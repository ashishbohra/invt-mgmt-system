# Deployment Guide

How to deploy the Inventory Management System using Docker, and configure multiple tenants.

📖 **[← Back to Main README](../README.md)**

---

## Option 1 — Docker Compose (All Services)

Run everything with a single command from the project root:

```bash
docker-compose up -d
```

This starts:

| Service | Container | Port |
|---------|-----------|------|
| PostgreSQL | invt_mgmt_db | 5432 |
| API | invt_mgmt_api | 3000 |
| Admin Portal | invt_admin_portal | 3001 |
| User Portal | invt_user_portal | 4002 |

**Stop everything:**
```bash
docker-compose down
```

**Reset database (delete all data):**
```bash
docker-compose down -v
docker-compose up -d
```

---

## Option 2 — Database Only (Local Development)

If you want to run API and portals locally but database in Docker:

```bash
cd src/db
docker-compose up -d
```

Then run each service with `npm start` as described in **[Getting Started](GETTING-STARTED.md)**.

---

## First-Time Setup After Deployment

After all services are running:

### 1. Create Admin User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Test@1234","roles":["Admin"],"portals":["AdminPortal"]}'
```

### 2. Login to Admin Portal

Open `http://localhost:3001` → login with `admin@test.com` / `Test@1234`

### 3. Create a Tenant

- Click **+ New Tenant**
- Enter name (e.g., `Acme Corp`)
- Add domain: `localhost:4002`
- Save

### 4. Create a Tenant User

- Go to **Users** → **+ New User**
- Select portal: **User Portal**
- Select tenant: **Acme Corp**
- Select role: **User** or **Manager**
- Fill name, email, password
- Save

### 5. Login to User Portal

Open `http://localhost:4002` → login with the user you just created.

---

## Multi-Tenant Deployment

Each tenant gets its own User Portal instance on a unique port/domain. The API resolves the tenant from the browser's origin URL.

### How It Works

```
Tenant "Acme"  → User Portal on localhost:4002 → domain "localhost:4002" in DB
Tenant "Globe" → User Portal on localhost:4003 → domain "localhost:4003" in DB
Tenant "Beta"  → User Portal on localhost:4004 → domain "localhost:4004" in DB
```

The API's `tenantResolver` middleware matches the browser `Origin` header against the `domains` JSONB column in the tenants table.

### Adding a New Tenant

**Step 1** — Add tenant in Admin Portal with a domain (e.g., `localhost:4003`)

**Step 2** — Add a new service to `docker-compose.yml`:

```yaml
  user-portal-globe:
    build: ./src/user-portal
    container_name: invt_user_portal_globe
    restart: unless-stopped
    ports:
      - "4003:4003"
    environment:
      PORT: 4003
      REACT_APP_API_URL: http://localhost:3000/api
    depends_on:
      - api
```

**Step 3** — Run:
```bash
docker-compose up -d user-portal-globe
```

**Step 4** — Create users for this tenant in Admin Portal, then login at `http://localhost:4003`.

### Production Domains

In production, use real domains instead of `localhost:PORT`:

| Tenant | Domain | Portal URL |
|--------|--------|-----------|
| Acme | acme.invt-app.com | https://acme.invt-app.com |
| Globe | globe.invt-app.com | https://globe.invt-app.com |

Add these domains to each tenant in the Admin Portal. The tenant resolver matches them automatically.

---

## Environment Variables

### API (`src/api`)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | API server port |
| DB_HOST | localhost | PostgreSQL host (`postgres` in Docker) |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | invt_mgmt_db | Database name |
| DB_USER | invtMgmtUser | Database user |
| DB_PASSWORD | invtMgmtUser@2k26 | Database password |
| JWT_SECRET | — | Secret for signing JWT tokens |
| LOG_LEVEL | DEBUG | DEBUG, INFO, WARN, ERROR |

### Admin Portal (`src/admin-portal`)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Dev server port |
| REACT_APP_API_URL | http://localhost:3000/api | API base URL |

### User Portal (`src/user-portal`)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 4002 | Dev server port |
| REACT_APP_API_URL | http://localhost:3000/api | API base URL |

---

## Checklist Before Going Live

| # | Item | Details |
|---|------|---------|
| 1 | Change `JWT_SECRET` | Use a strong random string |
| 2 | Change DB password | Update in docker-compose and API env |
| 3 | Set `LOG_LEVEL=INFO` | Suppress debug logs in production |
| 4 | Add tenant domains | Real domains in Admin Portal |
| 5 | Create admin user | First-time setup via curl |
| 6 | Create tenant users | Via Admin Portal with correct roles |
| 7 | Verify tenant resolution | Login to each tenant portal, check data isolation |
| 8 | Test cross-tenant | Ensure Tenant A cannot see Tenant B data |

---

## Verifying Multi-Tenant Isolation

After setting up 2+ tenants, verify:

1. **Login isolation** — User from Tenant A cannot login at Tenant B's portal
2. **Data isolation** — Products/inventory/orders from Tenant A don't appear in Tenant B
3. **Order guard** — Cannot create an order referencing another tenant's product
4. **Inactive tenant** — Deactivating a tenant blocks login for all its users
5. **Domain mismatch** — Accessing a portal with an unregistered domain returns 401
