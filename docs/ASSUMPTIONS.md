# Assumptions & Design Decisions

Where the implementation differs from the original scope document, and why.

📖 **[← Back to Main README](../README.md)**

---

## Scope vs Implementation

| # | Scope Requirement | Our Implementation | Rationale |
|---|---|---|---|
| 1 | **Tenant Dropdown** on every list page to switch tenants | **Domain-based resolution** — no dropdown | More secure. Prevents client-side tenant switching. Closer to real SaaS (each tenant gets their own subdomain/port). Tenant resolved from browser origin matched against DB. |
| 2 | Insufficient inventory → order saved as **Pending** | Order creation **blocked** with error message | Prevents orders that can never be fulfilled. Shows available stock so user can adjust quantity. Better UX than creating unfulfillable orders. |
| 3 | Two roles: Admin, User | Three roles: **Admin, Manager, User** | Added Manager role for order approval workflow. Separation of duties — Users create orders, Managers approve/cancel. Required for real-world accountability. |
| 4 | Cancel order — simple status change | Cancel requires **reason** (mandatory text) | Audit trail for accountability. Stores cancelled_by, cancelled_at, cancel_reason. |
| 5 | Approve order — simple status change | Approve stores **approved_by, approved_at** | Full audit trail. Know who approved and when. |
| 6 | Product status: Active/Inactive toggle | **Soft delete** with `is_active` flag | Delete = set `is_active = false`. No status toggle in edit. Cleaner — delete is the only way to deactivate. |
| 7 | Category as free text input | **Enum dropdown** (10 predefined categories) | Consistent data. No typos. Better for filtering and reporting. |
| 8 | Separate detail pages for View | **Modal-based** View, Edit, Create | No page navigation needed. Faster UX. Consistent pattern across all modules. |
| 9 | Inventory can be deleted independently | **Inventory lifecycle tied to product** | Deleting inventory without deleting the product makes no sense. Product delete cascades to inventory deactivation. |

---

## Enhancements Beyond Scope

| Enhancement | Description |
|---|---|
| **Tenant ID auto-generation** | Format: `TEN-{3 letters}-{id}` (e.g., TEN-ACM-1) |
| **Tenant domains** | JSONB array of domains for domain-based resolution |
| **Reorder feature** | Confirmed/cancelled orders can be reordered with pre-filled data |
| **Audit fields** | `created_by`, `updated_by` on every entity (stores email) |
| **Active/Inactive filters** | Every list page has Active/Inactive filter |
| **Below-threshold filter** | Inventory page filters products below reorder threshold |
| **Summary tiles** | Every list page shows count breakdowns |
| **⚠️ Warning icons** | Inventory list shows warning for low stock items |
| **Reusable modal components** | FormModal and ViewModal used across all modules |
| **Database auto-sync** | No migrations — schema defined in code, auto-synced |
| **Interactive API docs** | Scalar UI at `/api-docs` |
| **Password policy** | Min 8 chars, uppercase, lowercase, number, special char |
| **401 auto-redirect** | Expired tokens redirect to login automatically |
| **Case-insensitive tenant names** | Stored lowercase, searched case-insensitive |
| **Docker support** | Dockerfile + docker-compose for admin portal |

---

## Design Philosophy

1. **Security first** — Tenant from token, not from client. No data leakage.
2. **Soft deletes everywhere** — Data is never hard-deleted. Audit trail preserved.
3. **Modal-based UX** — No page navigation for CRUD. Everything in modals.
4. **Consistent patterns** — Same ⋮ menu, same pagination, same tiles across all modules.
5. **Minimal configuration** — Auto-sync DB, auto-resolve tenants, auto-create inventory.
6. **Real-world SaaS patterns** — Domain-based tenancy, role-based access, audit trails.
