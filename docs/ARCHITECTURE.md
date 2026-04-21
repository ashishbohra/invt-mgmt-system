# Architecture & High-Level Design

System architecture, data flow, and design patterns used in the Inventory Management System.

📖 **[← Back to Main README](../README.md)**

---

## System Overview

```
┌─────────────────┐     ┌─────────────────┐
│  Admin Portal    │     │  User Portal     │
│  (React :3001)   │     │  (React :4002+)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │ HTTP/REST
                     ▼
         ┌───────────────────────┐
         │     REST API          │
         │  (Node.js :3000)      │
         │                       │
         │  ┌─────────────────┐  │
         │  │ Tenant Resolver  │  │  ← Resolves tenant from domain
         │  │ JWT Auth         │  │  ← Validates token
         │  │ Tenant Guard     │  │  ← Blocks without tenant context
         │  └─────────────────┘  │
         │                       │
         │  Routes → Controllers │
         │  → Services           │
         │  → Repositories       │
         └───────────┬───────────┘
                     │ SQL
                     ▼
         ┌───────────────────────┐
         │    PostgreSQL          │
         │    (Docker :5432)      │
         └───────────────────────┘
```

---

## API Architecture — Layered Pattern

```
Request → Middleware Pipeline → Route → Controller → Service → Repository → Database
```

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Routes** | URL mapping, Swagger docs | `GET /api/products → ctrl.list` |
| **Controllers** | Extract request data, call service, return response | `req.user.tenantId → service.list()` |
| **Services** | Business logic, validation, orchestration | Check inventory before creating order |
| **Repositories** | SQL queries, schema definition, auto-sync | `SELECT * FROM products WHERE tenant_id = $1` |

### Why This Pattern?

- **Separation of concerns** — Each layer has one job
- **Testability** — Services can be tested without HTTP, repos without business logic
- **Reusability** — Services can be called from multiple controllers
- **Maintainability** — Change DB queries without touching business logic

---

## Middleware Pipeline

Every request passes through this pipeline in order:

```
1. requestLogger    → Logs method, URL, timing
2. tenantResolver   → Resolves tenant from origin domain or X-Tenant-Name header
3. authenticate     → Verifies JWT token, sets req.user
4. requireTenant    → Ensures tenant context exists (user portal routes only)
5. responseHandler  → Wraps response in { success, data } format
```

---

## Entity Relationship

```
Tenant (1) ──── (N) Product (1) ──── (1) Inventory
   │                    │
   │                    └──── (N) Order
   │
   └──── (N) User
```

| Relationship | Description |
|---|---|
| Tenant → Products | A tenant has many products |
| Product → Inventory | Each product has exactly one inventory record (auto-created) |
| Tenant → Orders | A tenant has many orders |
| Order → Product | Each order references one product |
| Tenant → Users | A tenant has many users |

---

## Data Flow Examples

### Creating a Product

```
UI: Fill form → Submit
API: Controller extracts tenant_id from JWT
     → Service validates data
     → ProductRepo.create() inserts product
     → InventoryRepo.create() inserts inventory (stock=0)
     → Returns product to UI
```

### Creating an Order

```
UI: Select product, enter quantity → Submit
API: Controller extracts tenant_id from JWT
     → Service checks product is Active
     → Service checks product belongs to same tenant
     → Service checks inventory >= quantity (rejects if not)
     → OrderRepo.create() with status='Created'
     → Returns order to UI
```

### Approving an Order (Manager only)

```
UI: Manager clicks "Approve" on order view
API: Controller passes user roles from JWT
     → Service checks roles includes 'Manager'
     → Service checks inventory >= order quantity
     → InventoryRepo.updateStock() deducts quantity
     → OrderRepo.confirm() sets status='Confirmed', approved_by, approved_at
     → Returns updated order
```

---

## Frontend Architecture

Both portals follow the same structure:

```
src/
├── components/     # Reusable UI components (Header, Sidebar, FormModal, ViewModal)
├── context/        # React Context (AuthContext)
├── pages/          # Page components organized by module
│   ├── auth/       # Login page
│   ├── product/    # ProductList, ProductModal, ProductViewModal
│   ├── inventory/  # InventoryList, InventoryModal, InventoryViewModal
│   └── order/      # OrderList, OrderModal, OrderViewModal
├── services/       # API service layer (httpClient + module services)
├── styles/         # All CSS files
└── utils/          # Token decode/expiry utilities
```

### Reusable Components

| Component | Purpose | Used By |
|-----------|---------|---------|
| **FormModal** | Create/Edit forms in modal | Product, Inventory, Order |
| **ViewModal** | Read-only detail view in modal | Product, Inventory |
| **ProtectedRoute** | Redirects to login if not authenticated | All protected pages |

---

## Security Architecture

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────────┐
│  Login   │───▶│  JWT     │───▶│  Every       │───▶│  Tenant      │
│  Page    │    │  Token   │    │  API Call    │    │  Scoped Data │
└──────────┘    └──────────┘    └──────────────┘    └──────────────┘
                 Contains:        Sends:              Queries:
                 - userId         Authorization:      WHERE tenant_id = $1
                 - tenantId       Bearer <token>
                 - tenantName
                 - email
                 - roles
                 - portals
```

- Tokens expire in 20 minutes
- 401 responses auto-redirect to login
- Tenant context comes from token, not from request body
- Domain-based tenant resolution for login (no tenant dropdown needed)

---

## Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19 | Modern UI with hooks |
| Routing | React Router 7 | Client-side routing |
| HTTP Client | Axios | Interceptors for auth |
| Backend | Node.js + Express | Fast, lightweight |
| Database | PostgreSQL 16 | JSONB support, robust |
| Auth | JWT (jsonwebtoken) | Stateless authentication |
| Password | bcryptjs | Secure hashing |
| API Docs | Scalar + swagger-jsdoc | Interactive documentation |
| Container | Docker | Database portability |
