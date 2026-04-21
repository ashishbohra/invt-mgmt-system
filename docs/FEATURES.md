# Features

Complete feature breakdown with acceptance criteria status.

📖 **[← Back to Main README](../README.md)**

---

## Module 1 — Tenant Management (Admin Portal)

| Feature | Status |
|---------|--------|
| Tenant list with Name, Tenant ID, Domains, Status | ✅ |
| Search by name or tenant ID | ✅ |
| Pagination with "Showing X to Y of Z" | ✅ |
| Sort by Name, Status, Date | ✅ |
| Status filter (All / Active / Inactive) | ✅ |
| Create tenant (modal) — name, domains | ✅ |
| Duplicate name check (case-insensitive) | ✅ |
| Edit tenant (modal) — name, domains | ✅ |
| Soft delete (sets Inactive) | ✅ |
| Tenant ID auto-generation (TEN-XXX-N) | ✅ |
| Domain-based tenant resolution | ✅ |
| Summary tiles (Total, Active/Inactive) | ✅ |
| ⋮ Action menu (Edit, Delete) | ✅ |

---

## Module 2 — Product Management (User Portal)

| Feature | Status |
|---------|--------|
| Product list with Name, SKU, Category, Status | ✅ |
| Search by name or SKU | ✅ |
| Pagination with page numbers | ✅ |
| Sort by Name, SKU, Category, Status, Date | ✅ |
| Active/Inactive filter | ✅ |
| Summary tiles (Total, Active, Inactive) | ✅ |
| ⋮ Action menu (View, Edit, Delete) | ✅ |
| Create product (modal) — SKU, Name, Category dropdown, Threshold, Cost | ✅ |
| Edit product (modal) — SKU read-only | ✅ |
| View product (modal) — read-only detail | ✅ |
| Category enum dropdown (10 categories) | ✅ |
| Soft delete (is_active = false, cascades to inventory) | ✅ |
| Auto-creates inventory record (stock = 0) | ✅ |

---

## Module 3 — Inventory Management (User Portal)

| Feature | Status |
|---------|--------|
| Inventory list with Product Name, SKU, Cost, Stock, Threshold | ✅ |
| ⚠️ Warning icon for below-threshold items | ✅ |
| Active/Inactive filter | ✅ |
| Below Threshold filter | ✅ |
| Summary tiles (Total, Active, Inactive, Below Reorder) | ✅ |
| ⋮ Action menu (View, Edit) | ✅ |
| View detail (modal) — product link, stock info, audit trail | ✅ |
| Edit stock (modal) — quick update | ✅ |
| Product name links to Product view modal | ✅ |
| No standalone delete (tied to product lifecycle) | ✅ |

---

## Module 4 — Order Management (User Portal)

| Feature | Status |
|---------|--------|
| Order list with ID, Product, Quantity, Status, Active/Deleted, Date | ✅ |
| Status filter (Created / Confirmed / Cancelled) | ✅ |
| Active/Inactive filter | ✅ |
| Summary tiles (Total, Created, Confirmed, Cancelled) | ✅ |
| ⋮ Action menu (View, Reorder, Delete) | ✅ |
| Create order (modal) — product dropdown (Active only), quantity | ✅ |
| Live inventory check — shows available stock | ✅ |
| Blocks creation if insufficient inventory | ✅ |
| View detail (modal) — product link, audit trail | ✅ |
| Approve order (Manager only) — deducts inventory | ✅ |
| Cancel order (Manager only) — requires reason | ✅ |
| Approval audit (approved_by, approved_at) | ✅ |
| Cancellation audit (cancelled_by, cancelled_at, cancel_reason) | ✅ |
| Reorder from existing order (pre-filled) | ✅ |
| Soft delete (is_active = false) | ✅ |
| Deleted orders dimmed, actions hidden | ✅ |

---

## Authentication & Authorization

| Feature | Status |
|---------|--------|
| Admin login (separate endpoint) | ✅ |
| User login (tenant-scoped) | ✅ |
| JWT tokens (20-min expiry) | ✅ |
| Portal access control (AdminPortal / UserPortal) | ✅ |
| Role-based access (Admin / Manager / User) | ✅ |
| Password policy (8+ chars, upper, lower, number, special) | ✅ |
| 401 auto-redirect to login | ✅ |
| Domain-based tenant resolution | ✅ |

---

## UI Patterns (Consistent Across All Modules)

| Pattern | Status |
|---------|--------|
| Reusable FormModal (create/edit) | ✅ |
| Reusable ViewModal (read-only) | ✅ |
| ⋮ Action menu on every list | ✅ |
| Summary tiles on every list | ✅ |
| Pagination with "Showing X to Y of Z" | ✅ |
| Color-coded badges (Active, Inactive, Created, Confirmed, Cancelled) | ✅ |
| Modal-based CRUD (no separate pages) | ✅ |
| Fixed sidebar with active highlight | ✅ |
| Top header with tenant name + user avatar + logout | ✅ |
