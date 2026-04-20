# Admin Portal — Inventory Management System

React-based admin dashboard for managing tenants and users across the entire system. This is the **master portal** — not scoped to any tenant.

## Architecture

```
src/admin-portal/src/
├── components/          # Reusable UI components
│   ├── Header.js        # Top bar — app title, user name, logout
│   ├── ProtectedRoute.js # Auth guard — redirects to login if no session
│   └── Sidebar.js       # Left nav — Tenants, Users links
├── config/
│   └── index.js         # App config (API URL, default OTP)
├── context/
│   └── AuthContext.js    # Auth state — token, user (decoded JWT), login/logout
├── pages/
│   ├── auth/
│   │   ├── LoginPage.js     # Email + password login form
│   │   └── OtpVerifyPage.js # 6-digit OTP verification
│   ├── tenant/
│   │   ├── TenantListPage.js # Tenant list with tiles, search, filter, sort, pagination
│   │   └── TenantModal.js    # Create/Edit tenant popup (name, domains, status)
│   └── user/
│       ├── UserListPage.js   # User list with search, pagination
│       └── UserModal.js      # Create/Edit user popup (tenant, name, email, password, roles, portals)
├── services/            # API call layer
│   ├── authService.js   # POST /api/auth/admin/login
│   ├── httpClient.js    # Axios instance with auth interceptor
│   ├── tenantService.js # Tenant CRUD
│   └── userService.js   # User CRUD + enums
├── styles/              # All CSS organized by component
│   ├── app.css          # Global layout (sidebar + header + content)
│   ├── auth.css         # Login & OTP pages
│   ├── header.css       # Top header bar
│   ├── modal.css        # Popup modals (tenant, user)
│   ├── pages.css        # Tables, tiles, toolbar, pagination, forms, badges
│   └── sidebar.css      # Left navigation
├── utils/
│   └── token.js         # JWT decode & expiry check (client-side)
└── App.js               # Root — routing, auth provider, layout
```

## Getting Started

### Prerequisites

- Node.js 18+
- API running on http://localhost:3000

### 1. Install

```bash
cd src/admin-portal
npm install
```

### 2. Configure

Edit `.env`:

```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_DEFAULT_OTP=123456
```

### 3. Run

```bash
# Windows
set PORT=3001 && npm start

# Mac/Linux
PORT=3001 npm start
```

Opens at http://localhost:3001

### 4. First Login

1. Create an admin user via API (no auth required):
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Test@1234","roles":["Admin"],"portals":["AdminPortal"]}'
```
2. Go to http://localhost:3001
3. Login with `admin@test.com` / `Test@1234`
4. Enter OTP: `123456` (default from .env)
5. You're in!

## Features

### Authentication Flow

```
Login Page → API /auth/admin/login → OTP Verify → Session Created → Dashboard
```

1. **Login**: Email + password → calls admin login API
2. **OTP Verification**: 6-digit code (default: `123456`, configurable in `.env`)
3. **Session**: JWT token stored in `sessionStorage` (cleared on tab close)
4. **Auto-redirect**: Already logged in? Redirected to dashboard. Session expired? Redirected to login.
5. **Logout**: Clears session, redirects to login

### Session Management

- Token stored as plain string in `sessionStorage` (key: `admin_auth`)
- User info decoded from JWT on the fly — no extra data stored
- Token expiry checked on every page load
- 401 API response auto-clears session and redirects to login

### Tenant Management

| Feature | Description |
|---------|-------------|
| List | Table with Tenant ID (TEN-001 format), Name, Domains, Status |
| Summary Tiles | Total Tenants count, Active/Inactive breakdown |
| Search | Filter by tenant name |
| Status Filter | Dropdown: All, Active, Inactive |
| Sort | Name (A-Z/Z-A), Newest, Oldest, Status |
| Pagination | Page numbers, Previous/Next, "Showing X to Y of Z results" |
| Create | Popup modal — Tenant Name, Domains (multi-value with add/remove tags) |
| Edit | Popup modal — same fields + Status toggle (Active/Inactive) |
| Delete | Soft delete — sets status to Inactive (data preserved) |
| Domains | Array of domain strings, displayed as badges, Enter or Add button to add |
| Action Menu | 3-dot (⋮) dropdown with Edit and Delete options |

### User Management

| Feature | Description |
|---------|-------------|
| List | Table with Name, Email, Tenant, Roles (badges), Portals (badges) |
| Search | Filter by name or email |
| Pagination | Same style as tenant list |
| Create | Popup modal — Tenant dropdown, Name, Email, Password, Roles checkboxes, Portal checkboxes |
| Edit | Popup modal — same fields except password |
| Delete | Soft delete (is_active = false) |
| Tenant Assignment | Dropdown: "None (Admin)" or select a tenant |
| Roles | Checkboxes: Admin, User |
| Portals | Checkboxes: Admin Portal, User Portal |
| Action Menu | 3-dot (⋮) dropdown with Edit and Delete |

## UI Design

Matches the wireframe specifications:

- **Sidebar**: Dark navy (`#0f1535`) with active link indicator
- **Header**: White bar with app title, user avatar (first letter), logout button
- **Content**: Light gray background (`#f4f6f9`) with white card containers
- **Tables**: Uppercase headers in blue, hover rows, status badges
- **Modals**: Centered overlay, rounded card, header/body/footer sections
- **Buttons**: Blue primary (`#4f6ef7`), red danger, outlined secondary
- **Badges**: Green (Active/Created), Gray (Inactive), Yellow (Pending), Blue (Confirmed/domains), Red (Cancelled)

## Key Patterns

### Service Layer

Each API module has its own service file. All use the shared `httpClient`:

```
httpClient.js  ← Axios instance with auth interceptor
├── authService.js    → POST /api/auth/admin/login
├── tenantService.js  → GET/POST/PUT/DELETE /api/tenants
└── userService.js    → GET/POST/PUT/DELETE /api/users + GET /enums
```

### Auth Interceptor (httpClient.js)

- **Request**: Attaches `Authorization: Bearer <token>` from sessionStorage
- **Response**: On 401 → clears session → redirects to `/login`

### Modal Pattern

Both TenantModal and UserModal follow the same pattern:
- Props: `entityId` (null for create), `onClose`, `onSaved`
- Load data in `useEffect` if editing
- Functional state updates (`setForm(prev => ...)`) to avoid stale closures
- Loading state on submit button
- Error display from API response
- `onSaved()` callback refreshes the parent list

### Protected Routes

```jsx
<ProtectedRoute>
  <AppLayout>
    <PageComponent />
  </AppLayout>
</ProtectedRoute>
```

Checks both React state (`isAuthenticated`) and sessionStorage as fallback for race conditions.

## Error Handling

| Layer | Handling |
|-------|----------|
| API calls in list pages | try/catch with error banner above table |
| API calls in modals | try/catch with inline error message |
| 401 responses | Auto-redirect to login via httpClient interceptor |
| Network errors | Fallback message: "Failed to load..." |
| Loading states | "Loading..." in table body during fetch |
| Action dropdown | Closes on outside click (mousedown listener) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Dev server port |
| REACT_APP_API_URL | http://localhost:3000/api | API base URL |
| REACT_APP_DEFAULT_OTP | 123456 | Default OTP for verification |
