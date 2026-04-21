# Database Structure

📖 **[← Back to Main README](../README.md)**

---

## Overview

PostgreSQL with 5 tables. All tables auto-created and auto-synced by the API — **no manual migrations needed**.

## Entity Relationship

```
┌──────────┐       ┌──────────────┐
│  users   │──────▶│   tenants    │  (nullable FK — admin users have no tenant)
└──────────┘       └──────────────┘
                         │
               ┌─────────┼─────────┐
               ▼         ▼         ▼
          ┌──────────┐ ┌────────────┐ ┌──────────┐
          │ products │ │ inventory  │ │  orders  │
          └──────────┘ └────────────┘ └──────────┘
               │              ▲             │
               └──────────────┘             │
               └────────────────────────────┘
```

## FK Relationships

| Child | Column | → Parent | Column | On Delete |
|-------|--------|----------|--------|-----------|
| users | tenant_id | → tenants | tenant_id | CASCADE |
| products | tenant_id | → tenants | tenant_id | CASCADE |
| inventory | product_id | → products | id | CASCADE |
| inventory | tenant_id | → tenants | tenant_id | CASCADE |
| orders | product_id | → products | id | CASCADE |
| orders | tenant_id | → tenants | tenant_id | CASCADE |

> All `tenant_id` columns are `VARCHAR(20)` referencing `tenants.tenant_id` (e.g., `TEN-ACM-1`).

---

## Tables

### tenants

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment |
| tenant_id | VARCHAR(20) | UNIQUE | Auto-generated: `TEN-{3 letters}-{id}` |
| name | VARCHAR(255) | NOT NULL, UNIQUE (case-insensitive) | Stored lowercase |
| domains | JSONB | DEFAULT [] | Array of domain strings for resolution |
| status | VARCHAR(20) | DEFAULT 'Active' | Active / Inactive (soft delete) |
| created_by | VARCHAR(255) | | Email of creator |
| updated_by | VARCHAR(255) | | Email of last updater |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

### users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| tenant_id | VARCHAR(20) | FK → tenants(tenant_id), NULLABLE | null = admin user |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL | Unique per tenant |
| password | VARCHAR(255) | NOT NULL | bcrypt hashed |
| roles | JSONB | NOT NULL, DEFAULT [] | Admin, Manager, User |
| portals | JSONB | NOT NULL, DEFAULT [] | AdminPortal, UserPortal |
| is_active | BOOLEAN | DEFAULT true | Soft delete flag |
| created_by | VARCHAR(255) | | |
| updated_by | VARCHAR(255) | | |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

### products

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| tenant_id | VARCHAR(20) | NOT NULL, FK → tenants(tenant_id) | |
| name | VARCHAR(255) | NOT NULL | |
| sku | VARCHAR(100) | NOT NULL, UNIQUE per tenant | Read-only after creation |
| category | VARCHAR(100) | NOT NULL | Enum dropdown |
| is_active | BOOLEAN | DEFAULT true | Soft delete flag |
| reorder_threshold | INTEGER | NOT NULL, DEFAULT 0 | Low stock alert level |
| cost_per_unit | NUMERIC(10,2) | NOT NULL, DEFAULT 0 | |
| created_by | VARCHAR(255) | | |
| updated_by | VARCHAR(255) | | |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

### inventory

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| product_id | INTEGER | NOT NULL, UNIQUE, FK → products(id) | 1:1 with product |
| tenant_id | VARCHAR(20) | NOT NULL, FK → tenants(tenant_id) | |
| current_inventory | INTEGER | NOT NULL, DEFAULT 0 | Current stock |
| is_active | BOOLEAN | DEFAULT true | Deactivated when product deleted |
| created_by | VARCHAR(255) | | |
| updated_by | VARCHAR(255) | | |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

### orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | |
| tenant_id | VARCHAR(20) | NOT NULL, FK → tenants(tenant_id) | |
| product_id | INTEGER | NOT NULL, FK → products(id) | |
| quantity | INTEGER | NOT NULL | Requested quantity |
| status | VARCHAR(20) | DEFAULT 'Created' | Created / Confirmed / Cancelled |
| is_active | BOOLEAN | DEFAULT true | Soft delete flag |
| approved_by | VARCHAR(255) | | Manager email who approved |
| approved_at | TIMESTAMP | | When approved |
| cancelled_by | VARCHAR(255) | | Manager email who cancelled |
| cancelled_at | TIMESTAMP | | When cancelled |
| cancel_reason | TEXT | | Required reason for cancellation |
| created_by | VARCHAR(255) | | |
| updated_by | VARCHAR(255) | | |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

---

## Enums

### Roles
`Admin` · `Manager` · `User`

### Portals
`AdminPortal` · `UserPortal`

### Product Categories
`Electronics` · `Clothing` · `Food & Beverage` · `Furniture` · `Health & Beauty` · `Sports & Outdoors` · `Automotive` · `Office Supplies` · `Toys & Games` · `Other`

### Order Statuses
`Created` → `Confirmed` or `Cancelled`

---

## Auto-Sync

Schema defined in each repository file. On API start:

1. Creates database if missing
2. Creates tables on first access (resolves FK dependencies)
3. Adds new columns automatically
4. Removes dropped columns automatically
5. Creates/maintains all indexes
