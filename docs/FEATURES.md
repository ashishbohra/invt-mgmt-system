# Core Features

Complete feature breakdown of the Inventory Management System.

📖 **[← Back to Main README](../README.md)**

---

## Module Overview

```
┌─────────────────────────────────────────────────────┐
│                   Admin Portal                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Tenants  │  │  Users   │  │  Authentication  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                    REST API
                        │
┌─────────────────────────────────────────────────────┐
│                   User Portal                        │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐         │
│  │ Products │  │ Inventory │  │  Orders  │         │
│  └──────────┘  └───────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 1. Authentication & Authorization

| Feature | Description |
|---------|-------------|
| Admin Login | Separate endpoint — `POST /api/auth/admin/login` |
| User Login | Tenant-scoped — `POST /api/auth/login` |
| OTP Verification | 6-digit code after login (default: `123456`, configurable) |
| JWT Tokens | 20-minute expiry, claims: userId, tenantId, name, email, roles, portals |
| Portal Access Control | Admin login requires `AdminPortal` in portals, User login requires `UserPortal` |
| Session Management | Token stored in sessionStorage, auto-cleared on expiry or 401 |
| Password Policy | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character |
| Password Hashing | bcrypt with 10 salt rounds |

---

## 2. Tenant Management (Admin Portal)

**User Stories**: 1.1, 1.2 from assignment

| Feature | Acceptance Criteria | Status |
|---------|-------------------|--------|
| Tenant List | Table with Tenant Name, Tenant ID, Status | ✅ |
| Pagination | Page numbers, Previous/Next, "Showing X to Y of Z" | ✅ |
| Text Search | Filter by tenant name | ✅ |
| Create Tenant | Modal popup — Tenant Name (required) | ✅ |
| Duplicate Check | Inline error if name already exists | ✅ |
| Redirect After Create | Modal closes, list refreshes | ✅ |

**Enhancements beyond scope:**

| Enhancement | Description |
|-------------|-------------|
| Domains | Array of domain strings per tenant (add/remove tags) |
| Summary Tiles | Total Tenants, Active/Inactive counts from DB |
| Status Filter | Dropdown: All, Active, Inactive |
| Sort | Name (A-Z/Z-A), Newest, Oldest, Status |
| Soft Delete | Sets status to Inactive instead of hard delete |
| Action Menu | 3-dot (⋮) dropdown with Edit/Delete |
| Tenant ID Format | Displayed as `TEN-001`, `TEN-002`, etc. |

---

## 3. User Management (Admin Portal — Extra)

Not in original scope but added for complete auth flow.

| Feature | Description |
|---------|-------------|
| User List | Name, Email, Tenant, Roles (badges), Portals (badges) |
| Create User | Modal — Tenant dropdown, Name, Email, Password, Roles, Portals |
| Edit User | Same modal without password field |
| Soft Delete | Sets is_active = false |
| Tenant Assignment | Dropdown: "None (Admin)" or select tenant |
| Role Selection | Checkboxes: Admin, User |
| Portal Selection | Checkboxes: Admin Portal, User Portal |
| Email Uniqueness | Per-tenant — same email allowed in different tenants |
| Public Create | No auth required (for initial setup) |

---

## 4. Product Management (User Portal)

**User Stories**: 2.1, 2.2 from assignment

| Feature | Acceptance Criteria | Status |
|---------|-------------------|--------|
| Product List | Table: Name, SKU, Category, Status | ✅ |
| Search | Filter by name or SKU | ✅ |
| Pagination | Supported | ✅ |
| Sorting | By name, SKU, category, status, date | ✅ |
| Row Actions | View, Edit, Delete | ✅ |
| Tenant Dropdown | Top right — filters to selected tenant | ✅ |
| Product Detail | View page with Edit/Delete buttons | ✅ |
| Edit Form | SKU (read-only), Name, Category, Reorder Threshold, Cost per Unit | ✅ |
| Status Toggle | Active/Inactive on edit | ✅ |
| Auto Inventory | Creating product auto-creates inventory at 0 | ✅ |

---

## 5. Inventory Management (User Portal)

**User Stories**: 3.1, 3.2 from assignment

| Feature | Acceptance Criteria | Status |
|---------|-------------------|--------|
| Inventory List | Table: Product Name, SKU, Cost/Unit, Current Inventory, Reorder Threshold | ✅ |
| Row Actions | View, Edit, Delete | ✅ |
| Below Reorder Tile | Summary count of products below threshold | ✅ |
| Detail View | Product info, Cost per Unit, current inventory | ✅ |
| Quick Update | Current Inventory input + "Update Stock" button | ✅ |
| Product Link | Product Name links to Product Detail page | ✅ |
| Low Stock Highlight | Rows below threshold highlighted | ✅ |

---

## 6. Order Management (User Portal)

**User Stories**: 4.1, 4.2, 4.3 from assignment

| Feature | Acceptance Criteria | Status |
|---------|-------------------|--------|
| Order List | Table: Order ID, Product, Quantity, Status, Date | ✅ |
| Row Actions | View, Delete | ✅ |
| Summary Tiles | Total Orders, Total Pending, Total Created | ✅ |
| Create Order | Product dropdown (Active only), Quantity | ✅ |
| Auto Status | Inventory ≥ Quantity → Created, else → Pending | ✅ |
| Order Detail | Product info, quantity, current inventory | ✅ |
| Confirm | Deducts inventory — fails if insufficient | ✅ |
| Cancel | Sets status to Cancelled | ✅ |
| Product Link | Product Name links to Product Detail | ✅ |
| Status Guards | Can't confirm cancelled, can't cancel confirmed | ✅ |

---

## 7. Multi-Tenancy

| Feature | Description |
|---------|-------------|
| Tenant Scoping | All product/inventory/order data scoped by tenant_id from JWT |
| Admin Users | tenant_id = null — manage all tenants, no data access |
| Tenant Users | tenant_id = set — access only their tenant's data |
| Tenant Resolution | Via X-Tenant-Name header or origin port mapping |
| Data Isolation | requireTenant middleware blocks access without tenant context |
| Cross-Tenant Guard | Order creation validates product belongs to same tenant |
| Email Uniqueness | Per-tenant — same email in different tenants allowed |

---

## 8. Database Auto-Sync

| Feature | Description |
|---------|-------------|
| Auto-Create DB | Database created on API startup if missing |
| Auto-Create Tables | Tables created on first API call to that module |
| Auto-Add Columns | New columns in schema → added on restart |
| Auto-Remove Columns | Removed columns in schema → dropped on restart |
| FK Resolution | Parent tables created before child tables automatically |
| Index Management | All indexes created/maintained automatically |
| Schema Source | Defined in each repository's `static schema` |

📖 **[Database Structure Details](DATABASE.md)**

---

## 9. API Design

| Feature | Description |
|---------|-------------|
| Layered Architecture | Routes → Controllers → Services → Repositories |
| Consistent Responses | `{ success: true/false, data, error }` |
| Shared Response Handler | Single middleware for all controllers |
| Request Logging | Every request/response with timing |
| Colored Logger | 4 levels: DEBUG, INFO, WARN, ERROR |
| Scalar API Docs | Interactive documentation at /api-docs |
| OpenAPI Spec | JSON spec at /api-docs/openapi.json |

---

## 10. Security

| Feature | Description |
|---------|-------------|
| JWT Authentication | 20-minute expiry, verified on every protected route |
| Separate Login Endpoints | Admin vs User portal |
| Portal Access Validation | Checked on login |
| Password Hashing | bcrypt (10 rounds) |
| Strong Password Policy | Enforced on create and change |
| Tenant Isolation | Token-based — no tenant ID in request body |
| Soft Deletes | Tenants (Inactive) and Users (is_active = false) |

---

## Documentation Links

| Document | Path |
|----------|------|
| 📖 Main README | [README.md](../README.md) |
| 📖 API Documentation | [src/api/README.md](../src/api/README.md) |
| 🖥️ Admin Portal Documentation | [src/admin-portal/README.md](../src/admin-portal/README.md) |
| 🗄️ Database Structure | [docs/DATABASE.md](DATABASE.md) |
| 🐳 Database Setup | [src/db/README.md](../src/db/README.md) |
