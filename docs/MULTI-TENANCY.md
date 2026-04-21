# Multi-Tenancy

How the system isolates data between tenants and resolves tenant context.

📖 **[← Back to Main README](../README.md)**

---

## Overview

This is a **shared database, shared schema** multi-tenant system. All tenants share the same PostgreSQL database and tables, but every row is scoped by `tenant_id`.

```
┌─────────────────────────────────────────────┐
│              PostgreSQL Database              │
│                                               │
│  products table:                              │
│  ┌─────────┬───────────┬──────────────────┐  │
│  │ id      │ tenant_id │ name             │  │
│  ├─────────┼───────────┼──────────────────┤  │
│  │ 1       │ TEN-ACM-1 │ Widget A         │  │  ← Tenant: Acme
│  │ 2       │ TEN-ACM-1 │ Widget B         │  │  ← Tenant: Acme
│  │ 3       │ TEN-GLO-2 │ Gadget X         │  │  ← Tenant: Global
│  └─────────┴───────────┴──────────────────┘  │
│                                               │
│  User from Acme can ONLY see rows 1 & 2      │
│  User from Global can ONLY see row 3          │
└─────────────────────────────────────────────┘
```

---

## Tenant ID Format

Tenant IDs are auto-generated on creation:

```
TEN-{FIRST 3 LETTERS OF NAME}-{DB ID}
```

| Tenant Name | Generated ID |
|---|---|
| Acme Corp | TEN-ACM-1 |
| Global Inc | TEN-GLO-2 |
| XY | TEN-XYX-3 (padded with X) |

Stored as `VARCHAR(20)` — used as the FK across all tables.

---

## How Tenant Resolution Works

### Step 1 — Domain Matching (Login)

When a user visits the User Portal (e.g., `http://localhost:4002`), the browser sends the `Origin` header automatically.

```
Browser → Origin: http://localhost:4002
API → tenantResolver middleware
    → Checks tenant domains JSONB: WHERE domains @> '"localhost:4002"'
    → Found: Acme Corp (TEN-ACM-1)
    → Sets req.tenantId = 'TEN-ACM-1'
```

The tenant's `domains` field in the DB must contain the portal's host:port.

### Step 2 — JWT Token (After Login)

On successful login, the JWT token contains:

```json
{
  "userId": 5,
  "tenantId": "TEN-ACM-1",
  "tenantName": "acme corp",
  "name": "John Doe",
  "email": "john@acme.com",
  "roles": ["User"],
  "portals": ["UserPortal"],
  "iat": 1713600000,
  "exp": 1713601200
}
```

### Step 3 — Data Scoping (Every Request)

Every API call includes `Authorization: Bearer <token>`. The `authenticate` middleware decodes the token and sets `req.user.tenantId`. All queries filter by this:

```sql
SELECT * FROM products WHERE tenant_id = 'TEN-ACM-1'
```

---

## Tenant Resolution Flow Diagram

```
Request arrives
    │
    ▼
tenantResolver middleware
    │
    ├── Has X-Tenant-Name header? → Look up by name
    │
    ├── Has Origin header? → Look up domain in tenants.domains JSONB
    │
    ├── No tenant context? → Skip (admin routes allowed, user routes blocked)
    │
    ├── Tenant not found? → 401 "tenant not recognized"
    │
    └── Tenant inactive? → 401 "tenant is inactive"
    │
    ▼
req.tenantId = tenant.tenant_id
req.tenantName = tenant.name
    │
    ▼
authenticate middleware → req.user from JWT
    │
    ▼
requireTenant middleware → blocks if req.user.tenantId is missing
```

---

## Data Isolation Rules

| Rule | Implementation |
|------|---------------|
| Products scoped to tenant | `WHERE tenant_id = $1` in all queries |
| Inventory scoped to tenant | Joined with products, filtered by `tenant_id` |
| Orders scoped to tenant | `WHERE tenant_id = $1` + cross-tenant product check |
| Users scoped to tenant | `WHERE tenant_id = $1` (admin users have `NULL`) |
| Email uniqueness per tenant | Unique index on `(tenant_id, email)` |
| No tenant ID in request body | Always from JWT token — client cannot override |

---

## Admin vs Tenant Users

| | Admin User | Tenant User |
|---|---|---|
| `tenant_id` | `NULL` | `TEN-ACM-1` |
| Portal | AdminPortal | UserPortal |
| Can see | All tenants | Only their tenant's data |
| Login endpoint | `/api/auth/admin/login` | `/api/auth/login` |
| Data access | Tenant & User management | Products, Inventory, Orders |

---

## Setting Up a New Tenant

1. **Admin Portal** → Create Tenant (name, domains)
2. Add domain `localhost:PORT` to the tenant
3. Create a User → assign to the tenant, set `UserPortal` portal
4. Start User Portal on that PORT
5. User logs in → tenant resolved from domain → data scoped

---

## Security Considerations

- **No client-side tenant switching** — Tenant comes from domain + JWT, not from a dropdown
- **Cross-tenant guard** — Orders validate product belongs to the same tenant
- **Inactive tenant rejection** — Login blocked if tenant status is Inactive
- **Token-based isolation** — Even if someone intercepts a request, they can't change the tenant context
