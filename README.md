# Inventory Management System

Multi-tenant Inventory Management System built with React, Node.js, and PostgreSQL.

## Architecture

```
src/
├── api/              # Node.js + Express REST API (Port 3000)
├── admin-portal/     # React Admin App - Tenant & User Management (Port 3001)
├── user-portal/      # React User App - Product, Inventory, Orders (Port 3002)
└── db/               # Docker Compose for PostgreSQL
```

**API Layer**: Routes → Controllers → Services → Repositories

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

Login with `admin@test.com` / `Test@1234` → OTP: `123456`

### 5. User Portal

```bash
cd src/user-portal
npm install
set PORT=3002 && npm start  # http://localhost:3002
```

## Documentation

| Document | Description |
|----------|-------------|
| 📋 **[Core Features](docs/FEATURES.md)** | Complete feature breakdown, acceptance criteria status, enhancements |
| 📖 **[API Documentation](src/api/README.md)** | Architecture, endpoints, middleware, auth, multi-tenancy, business rules |
| 🖥️ **[Admin Portal Documentation](src/admin-portal/README.md)** | Setup, features, auth flow, UI patterns, error handling |
| 🗄️ **[Database Structure](docs/DATABASE.md)** | Tables, columns, FK relationships, indexes, enums, ER diagram |
| 🐳 **[Database Setup](src/db/README.md)** | Docker Compose, connection details, VS Code setup |

## API Documentation (Interactive)

The API uses [Scalar](https://scalar.com) for interactive API documentation.

- **Scalar UI**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api-docs/openapi.json

## Database Auto-Sync

No manual migrations needed. The API automatically manages the database schema:

- Creates the database if it doesn't exist
- Creates tables on first API call to that module
- Adds new columns when added to the schema
- Removes columns when removed from the schema
- Resolves FK dependencies automatically
- Creates all indexes

Schema is defined in each repository under `src/api/repositories/`.

📖 **[Full Database Structure](docs/DATABASE.md)**

## Modules

| Module | Portal | Features |
|--------|--------|----------|
| Auth | Both | Admin login, User login, OTP verification, JWT tokens |
| Tenant | Admin | List, Create, Edit, Soft Delete, Search, Filter, Sort, Pagination, Domains |
| User | Admin | List, Create, Edit, Soft Delete, Search, Roles, Portal Access, Tenant Assignment |
| Product | User | List, Create, Edit, Delete, View, Search, Sort, Pagination |
| Inventory | User | List, View, Edit Stock, Below-Reorder Alerts |
| Order | User | List, Create, View, Confirm, Cancel, Summary Tiles |

## Security

- JWT authentication with 20-minute expiry
- Separate login endpoints for admin and user portals
- Portal access validation on login (AdminPortal / UserPortal)
- Password hashing with bcrypt
- Strong password policy enforcement
- Token-based tenant context — no tenant ID in request body for protected routes
- Tenant-scoped data isolation — no cross-tenant data leakage

## Key Business Rules

- Orders only reference **Active** products
- Order status = **Created** if inventory ≥ quantity, else **Pending**
- Confirming an order deducts inventory — fails if insufficient
- Creating a product auto-creates an inventory record (stock = 0)
- SKU is read-only after product creation
- Tenant delete is **soft delete** (sets Inactive, data preserved)
- User delete is **soft delete** (sets is_active = false)
- Same email can exist in different tenants (unique per tenant)
- Admin users have `tenant_id = null` — can manage all tenants

## Assumptions

- Admin portal is the master portal — not scoped to any tenant
- Tenant dropdown in user portal defaults to the first available tenant
- Product creation auto-initializes inventory at 0
- Order confirmation fails if insufficient inventory at time of confirmation
- Default OTP is `123456` (configurable in admin portal `.env`)
