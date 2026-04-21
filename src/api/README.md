# API — Inventory Management System

Node.js + Express REST API with PostgreSQL, JWT auth, auto-sync schema, and Scalar API docs.

📖 **[← Back to Main README](../../README.md)** | 📋 **[API Reference](../../docs/API-REFERENCE.md)**

---

## Architecture

```
src/api/
├── config/           # Database connection
├── constants/        # Enums (Roles, Portals, Categories, Password policy)
├── controllers/      # Request → Response (thin layer)
├── db/               # Database auto-creation on startup
├── middleware/        # Auth, tenant resolver, logging, response handler
├── repositories/     # SQL queries + schema definitions (auto-sync)
├── routes/           # Express routes + Swagger annotations
├── scripts/          # Migration scripts
├── services/         # Business logic layer
└── utils/            # JWT, password, logger, validators
```

### Request Flow

```
Client → requestLogger → tenantResolver → authenticate → requireTenant → Route → Controller → Service → Repository → PostgreSQL
```

---

## Quick Start

```bash
cd src/api
npm install
npm start       # http://localhost:3000
```

- Health: http://localhost:3000/api/health
- API Docs: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/api-docs/openapi.json

---

## Environment Variables

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

---

## Middleware Pipeline

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | requestLogger | Logs every request with timing |
| 2 | tenantResolver | Resolves tenant from domain or X-Tenant-Name header |
| 3 | authenticate | Verifies JWT, sets `req.user` |
| 4 | requireTenant | Blocks requests without tenant context |
| 5 | responseHandler | Wraps all responses in `{ success, data }` format |

---

## Key Design Patterns

- **Layered architecture**: Routes → Controllers → Services → Repositories
- **Auto-sync schema**: No migrations — schema in code, synced on startup
- **Soft deletes**: `is_active` flag on products, inventory, orders, users
- **Audit trail**: `created_by`, `updated_by` (email) on all entities
- **Consistent responses**: `{ success: true/false, data/error }`
- **Domain-based tenancy**: Tenant resolved from browser origin, not from request body

---

## Business Rules

| Rule | Implementation |
|------|---------------|
| Orders → Active products only | `is_active` check in service |
| Insufficient inventory → blocked | Rejects with available stock count |
| Confirm deducts inventory | Manager role required |
| Cancel requires reason | Stored with cancelled_by, cancelled_at |
| Product create → auto inventory | Inventory record at stock = 0 |
| Product delete → cascades | Inventory deactivated |
| SKU read-only after creation | Not updated in UPDATE query |
| Cross-tenant guard | Product tenant must match order tenant |

📖 **[Full API Reference](../../docs/API-REFERENCE.md)** | 📖 **[Database Structure](../../docs/DATABASE.md)**
