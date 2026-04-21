# Inventory Management System

Multi-tenant Inventory Management System built with React, Node.js, and PostgreSQL.

## Architecture

```
src/
├── api/              # Node.js + Express REST API (Port 3000)
├── admin-portal/     # React Admin App - Tenant & User Management (Port 3001)
├── user-portal/      # React User App - Product, Inventory, Orders (Port 3002+)
└── db/               # Docker Compose for PostgreSQL
```

**API Layer**: Routes → Controllers → Services → Repositories

**Entity Flow**: Tenant → Product → Inventory → Order

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

## Quick Start

### 1. Database

```bash
cd src/db
docker-compose up -d
```

### 2. API

```bash
cd src/api
npm install
npm start           # http://localhost:3000
```

### 3. Create Admin User (first time only)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Test@1234","roles":["Admin"],"portals":["AdminPortal"]}'
```

### 4. Admin Portal

```bash
cd src/admin-portal
npm install
set PORT=3001 && npm start  # http://localhost:3001
```

Login with `admin@test.com` / `Test@1234`

### 5. User Portal

```bash
cd src/user-portal
npm install
npm start  # http://localhost:4002
```

Tenant is resolved automatically from the browser origin domain matched against tenant domains in DB.

## Modules

| Module | Portal | Features |
|--------|--------|----------|
| Auth | Both | Admin login, User login, JWT tokens, portal access control |
| Tenant | Admin | List, Create, Edit, Soft Delete, Search, Filter, Sort, Pagination, Domains, Tenant ID auto-generation |
| User | Admin | List, Create, Edit, Soft Delete, Search, Roles (Admin/Manager/User), Portal Access, Tenant Assignment |
| Product | User | List, Create, Edit, Soft Delete, View, Search, Sort, Pagination, Category dropdown, Active/Inactive filter |
| Inventory | User | List, View, Edit Stock, Below-Reorder Alerts (⚠️), Active/Inactive filter, Stock filter |
| Order | User | List, Create, View, Approve (Manager), Cancel with reason (Manager), Soft Delete, Reorder, Status filter, Active/Inactive filter |

## Multi-Tenancy

| Feature | Implementation |
|---------|---------------|
| Tenant Resolution | Domain-based — browser origin matched against tenant `domains` JSONB in DB |
| Data Isolation | All product/inventory/order data scoped by `tenant_id` from JWT token |
| Admin Users | `tenant_id = null` — manage all tenants via admin portal |
| Tenant Users | `tenant_id` set — access only their tenant's data |
| Cross-Tenant Guard | `requireTenant` middleware blocks access without tenant context |
| Email Uniqueness | Per-tenant — same email allowed in different tenants |

## Roles & Permissions

| Role | Portal | Permissions |
|------|--------|-------------|
| Admin | AdminPortal | Manage tenants, manage users |
| Manager | UserPortal | All User permissions + approve/cancel orders |
| User | UserPortal | Manage products, inventory, create orders |

## Key Business Rules

- Orders only reference **Active** products (`is_active = true`)
- Order creation **blocked** if inventory < requested quantity (shows available stock)
- Confirming an order deducts inventory — fails if insufficient at confirmation time
- Only **Manager** role can approve or cancel orders
- Cancel requires a **reason** (stored with cancelled_by, cancelled_at, cancel_reason)
- Approve stores **approved_by** and **approved_at**
- Creating a product auto-creates an inventory record (stock = 0)
- SKU is read-only after product creation
- Product delete is **soft delete** (`is_active = false`) — cascades to inventory
- All entities have **audit fields**: `created_by`, `updated_by` (stores user email from JWT)
- Tenant delete is **soft delete** (sets status = Inactive)
- Inactive tenants are rejected at login by tenant resolver

## Security

- JWT authentication with 20-minute expiry
- Separate login endpoints: `/api/auth/admin/login` and `/api/auth/login`
- Portal access validation on login (AdminPortal / UserPortal)
- Password hashing with bcrypt (10 rounds)
- Strong password policy: min 8 chars, uppercase, lowercase, number, special character
- Token-based tenant context — no tenant ID in request body
- Domain-based tenant resolution with DB validation
- 401 auto-redirect on expired tokens

## UI Patterns

- **Reusable Components**: FormModal (create/edit), ViewModal (read-only detail)
- **⋮ Action Menu**: View, Edit, Delete (consistent across all modules)
- **Summary Tiles**: Counts with status breakdown on every list page
- **Filters**: Status, Active/Inactive, Stock level (Below Threshold)
- **Pagination**: "Showing X to Y of Z" with page numbers
- **Badges**: Color-coded status indicators (Active, Inactive, Created, Confirmed, Cancelled)
- **Modal-based**: All CRUD operations in modals — no separate pages

## Database Auto-Sync

No manual migrations needed. The API automatically manages the database schema:

- Creates the database if it doesn't exist
- Creates tables on first API call to that module
- Adds new columns when added to the schema
- Removes columns when removed from the schema
- Resolves FK dependencies automatically
- Creates all indexes

Schema is defined in each repository under `src/api/repositories/`.

## API Documentation (Interactive)

- **Scalar UI**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api-docs/openapi.json

## Assumptions & Design Decisions

1. **No Tenant Dropdown on list pages** — Instead of a dropdown, tenant is resolved from the browser domain matched against tenant domains in DB. Each user portal instance serves one tenant. This is more secure (no client-side tenant switching) and closer to real-world SaaS architecture.
2. **OTP removed** — Simplified auth flow. Login directly returns JWT token.
3. **Order creation rejects insufficient inventory** — Instead of saving as "Pending", orders are blocked if stock < quantity. This prevents orders that can never be fulfilled.
4. **Manager role for order approval** — Users create orders, Managers approve/cancel. Adds proper separation of duties.
5. **Cancel requires reason** — Stored with audit trail (cancelled_by, cancelled_at, cancel_reason) for accountability.
6. **Soft deletes everywhere** — Products, inventory, orders use `is_active` flag. Tenants use `status`. Data is never hard-deleted.
7. **Audit fields store email** — `created_by`/`updated_by` store the user's email from JWT (not user ID) for human-readable audit trail.
8. **Category is enum-based** — Product categories are predefined (Electronics, Clothing, etc.) via dropdown.
9. **Reorder feature** — Confirmed/cancelled orders can be reordered with pre-filled product and quantity.
10. **Inventory lifecycle tied to product** — No standalone inventory delete. Deleting a product deactivates its inventory.
