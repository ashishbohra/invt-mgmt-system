# Inventory Management System

Multi-tenant Inventory Management System built with React, Node.js, and PostgreSQL.

## Architecture

```
src/
├── api/              # Node.js + Express REST API (Port 3000)
├── admin-portal/     # React Admin App - Tenant Management (Port 3001)
└── user-portal/      # React User App - Product, Inventory, Orders (Port 3002)
```

**API Layer**: Routes → Controllers → Services → Repositories

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE invt_mgmt;
```

### 2. API

```bash
cd src/api
cp .env .env.local  # Edit DB credentials if needed
npm install
npm run migrate     # Creates tables
npm start           # Runs on http://localhost:3000
```

Swagger UI: http://localhost:3000/api-docs

### 3. Admin Portal

```bash
cd src/admin-portal
npm install
PORT=3001 npm start  # Runs on http://localhost:3001
```

### 4. User Portal

```bash
cd src/user-portal
npm install
PORT=3002 npm start  # Runs on http://localhost:3002
```

## Modules

| Module    | Portal | Features |
|-----------|--------|----------|
| Tenant    | Admin  | List, Create, Edit, Delete, Search, Pagination |
| Product   | User   | List, Create, Edit, Delete, View, Search, Sort, Pagination |
| Inventory | User   | List, View, Edit Stock, Below-Reorder Alerts |
| Order     | User   | List, Create, View, Confirm, Cancel, Summary Tiles |

## Key Business Rules

- Orders only reference **Active** products
- Order status = **Created** if inventory ≥ quantity, else **Pending**
- Confirming an order deducts inventory
- Creating a product auto-creates an inventory record (stock = 0)
- SKU is read-only after product creation
- All data is tenant-scoped (multi-tenancy)

## Assumptions

- Tenant dropdown in user portal defaults to the first available tenant
- Product creation auto-initializes inventory at 0
- Order confirmation fails if insufficient inventory at time of confirmation
- Deleting a tenant cascades to all related products, inventory, and orders
