# API Reference

Complete list of all REST API endpoints.

📖 **[← Back to Main README](../README.md)** | 🔗 **[Interactive Docs](http://localhost:3000/api-docs)**

---

## Base URL

```
http://localhost:3000/api
```

## Response Format

All endpoints return:

```json
{ "success": true, "data": { ... } }        // Success
{ "success": false, "error": "message" }     // Error
```

---

## Authentication

### Admin Login
```
POST /api/auth/admin/login
Body: { "email": "admin@test.com", "password": "Test@1234" }
Returns: { token, expiresAt, user: { id, tenantId, tenantName, name, email, roles, portals } }
```

### User Login
```
POST /api/auth/login
Headers: Origin resolved by tenantResolver (domain must be in tenant's domains)
Body: { "email": "user@test.com", "password": "Test@1234" }
Returns: { token, expiresAt, user: { id, tenantId, tenantName, name, email, roles, portals } }
```

---

## Tenants (Admin Portal — Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants?search=&status=&page=1&limit=10&sortBy=name&sortOrder=ASC` | List tenants |
| GET | `/api/tenants/:id` | Get tenant by ID |
| POST | `/api/tenants` | Create tenant `{ name, domains: [] }` |
| PUT | `/api/tenants/:id` | Update tenant `{ name, domains }` |
| DELETE | `/api/tenants/:id` | Soft delete (set Inactive) |

---

## Users (Auth Required, optional for create)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users?search=&page=1&limit=10` | List users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/enums` | Get available roles & portals |
| POST | `/api/users` | Create user `{ name, email, password, roles, portals, tenant_name }` |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Soft delete |
| PATCH | `/api/users/:id/password` | Change password `{ password }` |

---

## Products (Auth + Tenant Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products?search=&status=Active&page=1&limit=10&sortBy=name&sortOrder=ASC` | List products |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/categories` | Get category enum list |
| GET | `/api/products/active` | Get active products (for order dropdown) |
| POST | `/api/products` | Create product `{ name, sku, category, reorder_threshold, cost_per_unit }` |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft delete (`is_active = false`, cascades to inventory) |

---

## Inventory (Auth + Tenant Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory?status=Active&filter=below&page=1&limit=10` | List inventory |
| GET | `/api/inventory/:id` | Get inventory detail |
| GET | `/api/inventory/product/:productId` | Get inventory by product ID |
| PATCH | `/api/inventory/:id` | Update stock `{ current_inventory }` |

> **Note**: No create/delete endpoints. Inventory is auto-created with products and deactivated when products are deleted.

---

## Orders (Auth + Tenant Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders?status=Created&activeFilter=Active&page=1&limit=10` | List orders |
| GET | `/api/orders/:id` | Get order detail |
| POST | `/api/orders` | Create order `{ product_id, quantity }` |
| PATCH | `/api/orders/:id/confirm` | Approve order (Manager only, deducts inventory) |
| PATCH | `/api/orders/:id/cancel` | Cancel order (Manager only) `{ reason }` |
| DELETE | `/api/orders/:id` | Soft delete |

### Order Status Flow

```
Created ──→ Confirmed (Manager approves, inventory deducted)
Created ──→ Cancelled (Manager cancels with reason)
```

### Order Creation Rules

- Product must be Active (`is_active = true`)
- Product must belong to the same tenant
- Inventory must be >= requested quantity (else rejected with available stock shown)
- `tenant_id` comes from JWT token (not request body)

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Validation error (missing fields, insufficient inventory, etc.) |
| 401 | Authentication required or token expired |
| 403 | Forbidden (wrong portal, not Manager for order actions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate name, duplicate email) |
| 500 | Internal server error |
