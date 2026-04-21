# User Portal

React application for tenant users to manage products, inventory, and orders.

📖 **[← Back to Main README](../../README.md)**

---

## Quick Start

```bash
cd src/user-portal
npm install
set PORT=4002 && npm start    # http://localhost:4002
```

> The port must match a domain configured in the tenant's `domains` field in the database.

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FormModal.js     # Create/Edit modal (used by all modules)
│   ├── ViewModal.js     # Read-only detail modal (used by all modules)
│   ├── Header.js        # Top header with tenant name, user avatar, logout
│   ├── Sidebar.js       # Left navigation with module links
│   └── ProtectedRoute.js # Auth guard — redirects to login if not authenticated
├── context/
│   └── AuthContext.js   # Auth state (token, user, login, logout)
├── pages/
│   ├── auth/
│   │   └── LoginPage.js
│   ├── product/
│   │   ├── ProductList.js       # List with search, sort, filter, pagination
│   │   ├── ProductModal.js      # Create/Edit product (uses FormModal)
│   │   └── ProductViewModal.js  # View product detail (uses ViewModal)
│   ├── inventory/
│   │   ├── InventoryList.js     # List with filters, ⚠️ alerts
│   │   ├── InventoryModal.js    # Edit stock (uses FormModal)
│   │   └── InventoryViewModal.js # View detail with product link
│   └── order/
│       ├── OrderList.js         # List with status tiles, filters
│       ├── OrderModal.js        # Create/Reorder with stock validation
│       └── OrderViewModal.js    # View with approve/cancel (Manager)
├── services/
│   ├── httpClient.js      # Axios instance with auth interceptor
│   ├── authService.js     # Login API
│   ├── productService.js  # Product CRUD APIs
│   ├── inventoryService.js # Inventory APIs
│   └── orderService.js    # Order CRUD + confirm/cancel APIs
├── styles/
│   ├── app.css            # Global styles
│   ├── auth.css           # Login page styles
│   ├── header.css         # Header styles
│   ├── sidebar.css        # Sidebar styles
│   ├── modal.css          # Modal styles (overlay, header, body, footer)
│   └── pages.css          # Page layout, tables, badges, pagination, tiles
└── utils/
    └── token.js           # JWT decode and expiry check
```

---

## Features by Module

### Products
- List with search, sort (Name, SKU, Category, Status), pagination
- Active/Inactive filter
- Summary tiles (Total, Active, Inactive)
- ⋮ Action menu: View, Edit, Delete
- Category dropdown (10 predefined categories)
- SKU read-only after creation
- Soft delete (sets `is_active = false`, cascades to inventory)

### Inventory
- List with ⚠️ warning icons for low stock
- Filters: Active/Inactive, Below Threshold
- Summary tiles (Total, Active, Inactive, Below Reorder)
- ⋮ Action menu: View, Edit (no delete — tied to product)
- Quick stock update via Edit modal
- View modal links to Product detail

### Orders
- List with status badges and Active/Deleted column
- Filters: Active/Inactive, Status (Created/Confirmed/Cancelled)
- Summary tiles (Total, Created, Confirmed, Cancelled)
- ⋮ Action menu: View, Reorder, Delete
- Create order with live inventory check
- Reorder from existing order (pre-filled product + quantity)
- View modal shows full audit trail
- **Manager only**: Approve and Cancel buttons
- Cancel requires reason (stored in DB)
- Deleted orders dimmed with "Deleted" badge

---

## Reusable Components

### FormModal
Generic create/edit modal. Accepts field configuration:

```jsx
<FormModal
  title="Add Product"
  fields={[
    { label: 'Name *', value: name, onChange: setName, required: true },
    { label: 'Category *', type: 'select', options: [...], ... },
  ]}
  onSubmit={handleSubmit}
  onClose={onClose}
/>
```

### ViewModal
Generic read-only detail modal:

```jsx
<ViewModal
  title="Product Detail"
  fields={[
    { label: 'Name', value: product.name },
    { label: 'Status', value: <span className="badge Active">Active</span> },
  ]}
  onClose={onClose}
/>
```

---

## Authentication Flow

1. User visits portal → `ProtectedRoute` redirects to `/login`
2. User enters email + password → calls `POST /api/auth/login`
3. API resolves tenant from browser origin domain
4. On success → JWT token stored in `sessionStorage`
5. All API calls include `Authorization: Bearer <token>`
6. Token expires in 20 minutes → 401 → auto-redirect to login

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Dev server port |
| REACT_APP_API_URL | http://localhost:3000/api | API base URL |
