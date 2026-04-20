# API — Inventory Management System

Node.js + Express REST API with PostgreSQL, Scalar API docs, JWT auth, and auto-sync schema management.

## Architecture

```
src/api/
├── config/              # Database connection, tenant host mapping
│   ├── db.js            # PostgreSQL pool (pg)
│   └── tenantHosts.js   # Port-to-tenant mapping for user portal
├── constants/
│   └── enums.js         # Roles, Portals, Password policy
├── controllers/         # Request → Response (thin layer)
│   ├── authController.js
│   ├── inventoryController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── tenantController.js
│   └── userController.js
├── db/
│   └── sync.js          # Database auto-creation on startup
├── middleware/
│   ├── authenticate.js  # JWT token verification
│   ├── requestLogger.js # HTTP request/response logging
│   ├── requireTenant.js # Tenant context guard for user portal routes
│   ├── responseHandler.js # Consistent response wrapper + error handling
│   └── tenantResolver.js  # Resolves tenant from header/origin
├── repositories/        # Database queries + schema definitions
│   ├── baseRepository.js  # Auto-sync engine, FK dependency resolver
│   ├── inventoryRepository.js
│   ├── orderRepository.js
│   ├── productRepository.js
│   ├── tenantRepository.js
│   └── userRepository.js
├── routes/              # Express route definitions + Swagger annotations
│   ├── auth.js
│   ├── health.js
│   ├── inventory.js
│   ├── orders.js
│   ├── products.js
│   ├── tenants.js
│   └── users.js
├── services/            # Business logic layer
│   ├── authService.js
│   ├── inventoryService.js
│   ├── orderService.js
│   ├── productService.js
│   ├── tenantService.js
│   └── userService.js
├── utils/               # Shared utilities
│   ├── emailValidator.js
│   ├── jwt.js           # Sign, verify, decode JWT
│   ├── logger.js        # Colored console logger with levels
│   ├── password.js      # Hash, compare, validate policy
│   └── validators.js    # Role & portal array validators
├── .env                 # Environment variables
├── index.js             # App entry point
├── package.json
└── swagger.js           # OpenAPI spec generator
```

### Request Flow

```
Client → requestLogger → tenantResolver → [authenticate] → [requireTenant] → Route → Controller → Service → Repository → PostgreSQL
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (via Docker or local)

### 1. Start Database

```bash
cd src/db
docker-compose up -d
```

### 2. Configure Environment

Edit `src/api/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=invt_mgmt_db
DB_USER=invtMgmtUser
DB_PASSWORD=invtMgmtUser@2k26
JWT_SECRET=invtMgmt$ecretKey@2k26!
LOG_LEVEL=DEBUG
```

### 3. Install & Run

```bash
cd src/api
npm install
npm start       # Production
npm run dev     # Development (nodemon auto-reload)
```

### 4. Verify

- API: http://localhost:3000/api/health
- Scalar Docs: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/api-docs/openapi.json

## API Endpoints

### Public (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/login` | Admin portal login (tenant_id = null users) |
| POST | `/api/auth/login` | User portal login (tenant-scoped users) |
| POST | `/api/users` | Create a user |
| GET | `/api/users/enums` | Get available roles & portals |
| GET | `/api/health` | Health check |

### Protected — Auth Only (Admin Portal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants` | List tenants (search, filter, sort, paginate) |
| GET | `/api/tenants/:id` | Get tenant by ID |
| POST | `/api/tenants` | Create tenant |
| PUT | `/api/tenants/:id` | Update tenant |
| DELETE | `/api/tenants/:id` | Soft delete tenant (set Inactive) |
| GET | `/api/users` | List users (tenant-scoped) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Soft delete user |
| PATCH | `/api/users/:id/password` | Change password |

### Protected — Auth + Tenant Required (User Portal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product (auto-creates inventory) |
| GET | `/api/products/:id` | Get product |
| GET | `/api/products/active` | Get active products (for order dropdown) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/inventory` | List inventory |
| GET | `/api/inventory/:id` | Get inventory detail |
| PATCH | `/api/inventory/:id` | Update stock |
| DELETE | `/api/inventory/:id` | Delete inventory |
| GET | `/api/orders` | List orders with summary counts |
| POST | `/api/orders` | Create order (auto-determines status) |
| GET | `/api/orders/:id` | Get order detail |
| PATCH | `/api/orders/:id/confirm` | Confirm order (deducts inventory) |
| PATCH | `/api/orders/:id/cancel` | Cancel order |
| DELETE | `/api/orders/:id` | Delete order |

## Consistent Response Shape

All endpoints return:

```json
// Success
{ "success": true, "data": { ... }, "total": 10 }

// Error
{ "success": false, "error": "Error message" }
```

## Middleware Pipeline

| Middleware | Applied To | Purpose |
|-----------|-----------|---------|
| requestLogger | All routes | Logs every request/response with timing |
| tenantResolver | All routes | Resolves tenant from `X-Tenant-Name` header or origin port |
| authenticate | Protected routes | Verifies JWT, sets `req.user` from token claims |
| requireTenant | User portal routes | Ensures `req.user.tenantId` exists |
| responseHandler | All controllers | Wraps response in `{ success, data }`, catches errors |

## Authentication

### JWT Token

- **Expiry**: 20 minutes
- **Claims**: userId, tenantId, name, email, roles, portals
- **Header**: `Authorization: Bearer <token>`

### Login Flow

```
Admin Portal:  POST /api/auth/admin/login  → finds user where tenant_id IS NULL
User Portal:   POST /api/auth/login        → finds user where tenant_id = resolved tenant
```

Both validate portal access — admin login requires `AdminPortal` in user's portals array, user login requires `UserPortal`.

### Password Policy

- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character (`@$!%*?&#`)
- Passwords hashed with bcrypt (10 rounds)

## Multi-Tenancy

### How It Works

- **Admin users**: `tenant_id = NULL` — can manage all tenants
- **Tenant users**: `tenant_id = <id>` — scoped to their tenant
- Same email can exist in different tenants (unique per tenant)
- All product/inventory/order data scoped by `tenant_id` from JWT

### Tenant Resolution

1. Check `X-Tenant-Name` header
2. Fallback to origin port mapping (`config/tenantHosts.js`)
3. If no tenant context → allowed for admin routes, blocked for user portal routes

## Database Auto-Sync

No migrations. Each repository defines its schema:

```js
class ProductRepository extends BaseRepository {
  static tableName = 'products';
  static schema = {
    id: 'SERIAL PRIMARY KEY',
    tenant_id: 'INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE',
    name: 'VARCHAR(255) NOT NULL',
    // ...
  };
  static indexes = [
    'CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id)',
  ];
}
```

On first API call to any module:
1. Resolves FK dependencies (e.g., products → tenants)
2. Creates parent tables first
3. Creates the table with all columns
4. Creates indexes
5. On subsequent restarts: adds new columns, removes dropped columns

📖 **[Full Database Structure](../../docs/DATABASE.md)**

## Logging

Colored console output with 4 levels: `DEBUG`, `INFO`, `WARN`, `ERROR`

```
2026-04-20T20:00:01.123Z [INFO] [Server] Running on http://localhost:3000
2026-04-20T20:00:02.000Z [INFO] [HTTP] → POST /api/auth/admin/login
2026-04-20T20:00:02.050Z [INFO] [Auth] Admin login attempt for admin@test.com
2026-04-20T20:00:02.120Z [INFO] [Auth] Admin login successful userId=1
2026-04-20T20:00:02.121Z [INFO] [HTTP] ← POST /api/auth/admin/login 200 (121ms)
```

Set `LOG_LEVEL=INFO` in production to suppress debug logs.

## Enums

### Roles
| Value | Description |
|-------|-------------|
| Admin | Full management access |
| User | Standard operations |

### Portals
| Value | Description |
|-------|-------------|
| AdminPortal | Access to Admin Portal |
| UserPortal | Access to User Portal |

## Business Rules

- Orders only reference **Active** products
- Order status = **Created** if inventory ≥ quantity, else **Pending**
- Confirming an order **deducts inventory** — fails if insufficient
- Cannot confirm a cancelled order, cannot cancel a confirmed order
- Creating a product **auto-creates inventory** at 0
- SKU is **read-only** after product creation
- Deleting a tenant **soft deletes** (sets Inactive)
- Deleting a user **soft deletes** (sets is_active = false)
- Product tenant must match order tenant (no cross-tenant orders)
