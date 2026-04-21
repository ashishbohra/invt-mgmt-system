# Roles & Permissions

How user roles, portal access, and permissions work in the system.

📖 **[← Back to Main README](../README.md)**

---

## Roles Overview

| Role | Portal | Description |
|------|--------|-------------|
| **Admin** | AdminPortal | System administrator — manages tenants and users |
| **Manager** | UserPortal | Tenant manager — all User permissions + approve/cancel orders |
| **User** | UserPortal | Tenant user — manage products, inventory, create orders |

---

## Portal Access

Users are assigned to one portal. The portal determines which application they can log into.

| Portal | Application | URL |
|--------|------------|-----|
| AdminPortal | Admin Portal | http://localhost:3001 |
| UserPortal | User Portal | http://localhost:4002+ |

**Login validation**: If a user with `AdminPortal` tries to login at the User Portal, they get `403 — You do not have access to the User Portal`.

---

## Permission Matrix

### Admin Portal

| Action | Admin |
|--------|-------|
| View tenants | ✅ |
| Create tenant | ✅ |
| Edit tenant | ✅ |
| Delete tenant (soft) | ✅ |
| View users | ✅ |
| Create user | ✅ |
| Edit user | ✅ |
| Delete user (soft) | ✅ |

### User Portal

| Action | User | Manager |
|--------|------|---------|
| View products | ✅ | ✅ |
| Create product | ✅ | ✅ |
| Edit product | ✅ | ✅ |
| Delete product (soft) | ✅ | ✅ |
| View inventory | ✅ | ✅ |
| Edit inventory stock | ✅ | ✅ |
| View orders | ✅ | ✅ |
| Create order | ✅ | ✅ |
| Delete order (soft) | ✅ | ✅ |
| Reorder | ✅ | ✅ |
| **Approve order** | ❌ | ✅ |
| **Cancel order** | ❌ | ✅ |

---

## Role Assignment Rules

When creating a user in the Admin Portal:

| If Portal is... | Available Roles | Tenant Required? |
|---|---|---|
| AdminPortal | Admin only | No (`tenant_id = null`) |
| UserPortal | User, Manager | Yes (must select tenant) |

The UI enforces this — selecting AdminPortal disables User/Manager roles and the tenant dropdown. Selecting UserPortal disables Admin role and requires a tenant.

---

## Order Approval Workflow

```
User creates order
    │
    ▼
Order status = "Created"
    │
    ├── Manager clicks "Approve"
    │   → Checks inventory >= quantity
    │   → Deducts inventory
    │   → Status = "Confirmed"
    │   → Stores: approved_by, approved_at
    │
    └── Manager clicks "Cancel"
        → Requires cancel reason (text)
        → Status = "Cancelled"
        → Stores: cancelled_by, cancelled_at, cancel_reason
```

**Non-Manager users** see the order details but the Approve/Cancel buttons are hidden. A message says: *"Only Managers can approve or cancel orders."*

---

## JWT Token Claims

After login, the JWT token contains:

```json
{
  "userId": 5,
  "tenantId": "TEN-ACM-1",
  "tenantName": "acme corp",
  "name": "John Doe",
  "email": "john@acme.com",
  "roles": ["Manager"],
  "portals": ["UserPortal"],
  "iat": 1713600000,
  "exp": 1713601200
}
```

The `roles` array is checked server-side for order approval/cancellation. The frontend reads it to show/hide UI elements.

---

## Audit Trail

Every create/update action stores the user's email:

| Field | When Set | Value |
|-------|---------|-------|
| `created_by` | On record creation | User's email from JWT |
| `updated_by` | On any update | User's email from JWT |
| `approved_by` | On order approval | Manager's email |
| `approved_at` | On order approval | Timestamp |
| `cancelled_by` | On order cancellation | Manager's email |
| `cancelled_at` | On order cancellation | Timestamp |
| `cancel_reason` | On order cancellation | Required text reason |
