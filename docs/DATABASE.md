# Database Structure

## Overview

The system uses **PostgreSQL** with 5 tables. Tables are auto-created and auto-synced by the API on first use — no manual migration needed.

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐
│  users   │──────▶│ tenants  │  (nullable FK — admin users have no tenant)
└──────────┘       └──────────┘
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
         ┌──────────┐ ┌────────────┐ ┌──────────┐
         │ products │ │ inventory  │ │  orders  │
         └──────────┘ └────────────┘ └──────────┘
              │              ▲             │
              └──────────────┘             │
              └────────────────────────────┘

Arrows show FK direction (child → parent)
```

## Relationship Summary

| Child Table | Column       | → Parent Table | Column | On Delete | Nullable |
|-------------|-------------|----------------|--------|-----------|----------|
| users       | tenant_id   | → tenants      | id     | CASCADE   | Yes (admin users) |
| products    | tenant_id   | → tenants      | id     | CASCADE   | No |
| inventory   | product_id  | → products     | id     | CASCADE   | No |
| inventory   | tenant_id   | → tenants      | id     | CASCADE   | No |
| orders      | tenant_id   | → tenants      | id     | CASCADE   | No |
| orders      | product_id  | → products     | id     | CASCADE   | No |

---

## Tables

### 1. users

Stores system users with roles and portal access. Supports **soft delete** (is_active = false). Tenant-scoped uniqueness on email.

| Column     | Type         | Constraints                    | Description                          |
|------------|-------------|--------------------------------|--------------------------------------|
| id         | SERIAL      | PRIMARY KEY                    | Auto-increment ID                    |
| tenant_id  | INTEGER     | FK → tenants(id), NULLABLE     | null = admin user, set = tenant user |
| name       | VARCHAR(255)| NOT NULL                       | Full name                            |
| email      | VARCHAR(255)| NOT NULL                       | Login email                          |
| password   | VARCHAR(255)| NOT NULL                       | Bcrypt hashed password               |
| roles      | JSONB       | NOT NULL, DEFAULT []           | Array: Admin, User                   |
| portals    | JSONB       | NOT NULL, DEFAULT []           | Array: AdminPortal, UserPortal       |
| is_active  | BOOLEAN     | DEFAULT true                   | false = soft deleted                 |
| created_at | TIMESTAMP   | DEFAULT NOW()                  | Record creation time                 |
| updated_at | TIMESTAMP   | DEFAULT NOW()                  | Last update time                     |

**Indexes:**
- `idx_users_tenant_email` — UNIQUE on (tenant_id, email) WHERE is_active = true
- `idx_users_tenant_id` — Lookup by tenant
- `idx_users_is_active` — Filter index

**Key behaviors:**
- Same email can exist in different tenants
- Admin users (tenant_id = null) have globally unique email
- Soft delete hides user from all queries but preserves data

---

### 2. tenants

Represents organizations. All business data is scoped to a tenant. Supports **soft delete** (status = Inactive).

| Column     | Type         | Constraints     | Description              |
|------------|-------------|-----------------|--------------------------|
| id         | SERIAL      | PRIMARY KEY     | Auto-increment ID        |
| name       | VARCHAR(255)| NOT NULL, UNIQUE| Organization name        |
| domains    | JSONB       | DEFAULT []      | Array of domain strings  |
| status     | VARCHAR(20) | DEFAULT 'Active'| Active or Inactive       |
| created_at | TIMESTAMP   | DEFAULT NOW()   | Record creation time     |
| updated_at | TIMESTAMP   | DEFAULT NOW()   | Last update time         |

**Indexes:**
- `idx_tenants_name` — UNIQUE on name

**Key behaviors:**
- Delete sets status to Inactive (soft delete)
- Domains stored as JSON array (e.g., `["app.test.com", "localhost:3002"]`)

---

### 3. products

Product catalog scoped to a tenant. Each product has a unique SKU within its tenant.

| Column            | Type          | Constraints                    | Description                    |
|-------------------|--------------|--------------------------------|--------------------------------|
| id                | SERIAL       | PRIMARY KEY                    | Auto-increment ID              |
| tenant_id         | INTEGER      | NOT NULL, FK → tenants(id)     | Owning tenant                  |
| name              | VARCHAR(255) | NOT NULL                       | Product name                   |
| sku               | VARCHAR(100) | NOT NULL                       | Stock Keeping Unit (read-only after creation) |
| category          | VARCHAR(100) | NOT NULL                       | Product category               |
| status            | VARCHAR(20)  | DEFAULT 'Active'               | Active or Inactive             |
| reorder_threshold | INTEGER      | NOT NULL, DEFAULT 0            | Minimum stock level alert      |
| cost_per_unit     | NUMERIC(10,2)| NOT NULL, DEFAULT 0            | Unit cost                      |
| created_at        | TIMESTAMP    | DEFAULT NOW()                  | Record creation time           |
| updated_at        | TIMESTAMP    | DEFAULT NOW()                  | Last update time               |

**Indexes:**
- `idx_products_tenant_sku` — UNIQUE on (tenant_id, sku)
- `idx_products_tenant_id` — Lookup by tenant
- `idx_products_status` — Filter by status

---

### 4. inventory

Tracks stock levels for each product. Auto-created when a product is created (stock = 0).

| Column            | Type      | Constraints                    | Description              |
|-------------------|----------|--------------------------------|--------------------------|
| id                | SERIAL   | PRIMARY KEY                    | Auto-increment ID        |
| product_id        | INTEGER  | NOT NULL, UNIQUE, FK → products(id) | One inventory per product |
| tenant_id         | INTEGER  | NOT NULL, FK → tenants(id)     | Owning tenant            |
| current_inventory | INTEGER  | NOT NULL, DEFAULT 0            | Current stock count      |
| created_at        | TIMESTAMP| DEFAULT NOW()                  | Record creation time     |
| updated_at        | TIMESTAMP| DEFAULT NOW()                  | Last update time         |

**Indexes:**
- `idx_inventory_product_id` — UNIQUE on product_id (1:1 with product)
- `idx_inventory_tenant_id` — Lookup by tenant

---

### 5. orders

Orders placed against products. Status is auto-determined by inventory availability.

| Column     | Type      | Constraints                    | Description                          |
|------------|----------|--------------------------------|--------------------------------------|
| id         | SERIAL   | PRIMARY KEY                    | Auto-increment ID                    |
| tenant_id  | INTEGER  | NOT NULL, FK → tenants(id)     | Owning tenant                        |
| product_id | INTEGER  | NOT NULL, FK → products(id)    | Ordered product                      |
| quantity   | INTEGER  | NOT NULL                       | Requested quantity                   |
| status     | VARCHAR(20)| DEFAULT 'Created'            | Created, Pending, Confirmed, Cancelled |
| created_at | TIMESTAMP| DEFAULT NOW()                  | Order date                           |
| updated_at | TIMESTAMP| DEFAULT NOW()                  | Last update time                     |

**Indexes:**
- `idx_orders_tenant_id` — Lookup by tenant
- `idx_orders_product_id` — Lookup by product
- `idx_orders_status` — Filter by status

**Status Rules:**
| Condition | Status Set |
|-----------|-----------|
| Inventory ≥ Quantity | **Created** |
| Inventory < Quantity | **Pending** |
| User confirms (stock available) | **Confirmed** (inventory deducted) |
| User cancels | **Cancelled** |

---

## Enums (Constants)

### Roles
| Value | Description |
|-------|-------------|
| Admin | Full management access |
| User  | Standard operations |

### Portals
| Value       | Description |
|-------------|-------------|
| AdminPortal | Access to Admin Portal (Tenant & User management) |
| UserPortal  | Access to User Portal (Products, Inventory, Orders) |

---

## How Auto-Sync Works

You **never** run migrations manually. The API handles everything:

1. **Database** — Created on API startup if it doesn't exist
2. **Tables** — Created on first API call to that module
3. **New columns** — Add to `schema` in the repository file → restart → column added
4. **Removed columns** — Remove from `schema` → restart → column dropped
5. **FK dependencies** — Resolved automatically (e.g., calling Orders API creates Tenants → Products → Orders)
6. **Indexes** — Created/maintained automatically

Schema is defined in each repository file under `src/api/repositories/`.
