# Inventory Management System

Multi-tenant Inventory Management System built with **React**, **Node.js**, and **PostgreSQL**.

> 🎬 **[View Demo →](https://drive.google.com/drive/folders/1W9h982zN7-BTu9sChu2PYfww__c-7WsC?usp=sharing)**

---

## Highlights

- **Multi-Tenant** — Tenant-scoped data isolation with domain mapping
- **Role-Based Access** — Admin, Manager, User with portal-level permissions
- **RESTful API** — Layered architecture: Routes → Controllers → Services → Repositories
- **Auto DB Sync** — Schema-driven table creation & migration on startup
- **Soft Deletes** — All deletes set `is_active = false` with full audit trail
- **Pagination, Search, Sort & Filter** — On every list view

---

## Architecture

```
src/
├── api/              # Node.js + Express REST API (Port 3000)
├── admin-portal/     # React Admin App - Tenant & User Management (Port 3001)
├── user-portal/      # React User App - Product, Inventory, Orders (Port 3002+)
└── db/               # Docker Compose for PostgreSQL
```

**Entity Flow**: Tenant → Product → Inventory → Order

---

## Quick Start

```bash
# 1. Database
cd src/db && docker-compose up -d

# 2. API
cd src/api && npm install && npm start

# 3. Create admin user (first time)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Test@1234","roles":["Admin"],"portals":["AdminPortal"]}'

# 4. Admin Portal
cd src/admin-portal && npm install && set PORT=3001 && npm start

# 5. User Portal
cd src/user-portal && npm install && npm start
```

📖 **[Full setup guide →](docs/GETTING-STARTED.md)**

---

## Modules

| Module | Portal | Key Features |
|--------|--------|-------------|
| Tenant | Admin | CRUD, search, sort, pagination, domains, auto-ID |
| User | Admin | CRUD, roles (Admin/Manager/User), portal access |
| Product | User | CRUD, categories, search, sort, Active/Inactive filter |
| Inventory | User | Stock management, ⚠️ low-stock alerts, threshold filter |
| Order | User | Create, approve/cancel (Manager), reorder, audit trail |

---

## Key Business Rules

- Orders only reference **Active** products
- Order creation **blocked** if inventory < quantity
- Only **Manager** can approve/cancel orders
- Cancel requires a **reason** (full audit trail)
- Product delete **cascades** to inventory deactivation
- All deletes are **soft deletes** (`is_active = false`)
- **Audit fields** on every entity (`created_by`, `updated_by` = email)

📖 **[All assumptions & design decisions →](docs/ASSUMPTIONS.md)**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| 🛠️ **[Tech Stack & Tools](docs/TECH-STACK.md)** | All technologies, libraries, and tools explained |
| 🚀 **[Getting Started](docs/GETTING-STARTED.md)** | Step-by-step setup guide |
| 🏗️ **[Architecture & HLD](docs/ARCHITECTURE.md)** | System design, data flow, tech stack |
| 🏢 **[Multi-Tenancy](docs/MULTI-TENANCY.md)** | Tenant resolution, data isolation, domain mapping |
| 🔐 **[Roles & Permissions](docs/ROLES-PERMISSIONS.md)** | Admin, Manager, User roles and access control |
| ✅ **[Features](docs/FEATURES.md)** | Complete feature checklist with status |
| 🗄️ **[Database](docs/DATABASE.md)** | Tables, columns, relationships, auto-sync |
| 📡 **[API Reference](docs/API-REFERENCE.md)** | All REST endpoints |
| 💡 **[Assumptions](docs/ASSUMPTIONS.md)** | Design decisions vs scope document |
| 🚢 **[Deployment](docs/DEPLOYMENT.md)** | Docker setup, multi-tenant config, go-live checklist |
| 📖 **[API README](src/api/README.md)** | API-specific setup and patterns |
| 🖥️ **[User Portal README](src/user-portal/README.md)** | User portal structure and features |
