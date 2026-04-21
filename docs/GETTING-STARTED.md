# Getting Started

Step-by-step guide to set up and run the Inventory Management System locally.

📖 **[← Back to Main README](../README.md)**

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | API and frontend runtime |
| Docker | Latest | PostgreSQL database |
| npm | 9+ | Package management |

---

## Step 1 — Start the Database

```bash
cd src/db
docker-compose up -d
```

This starts a PostgreSQL 16 container on port `5432` with:
- Database: `invt_mgmt_db`
- User: `invtMgmtUser`
- Password: `invtMgmtUser@2k26`

**Verify**: `docker ps` should show `invt_mgmt_db` running.

---

## Step 2 — Start the API

```bash
cd src/api
npm install
npm start
```

The API starts on `http://localhost:3000`. On first start, it automatically:
- Creates the database if missing
- Creates all tables when first accessed
- Sets up indexes and foreign keys

**Verify**: Open `http://localhost:3000/api/health`

---

## Step 3 — Create the First Admin User

This is a one-time setup. Run this command to create an admin user:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Test@1234","roles":["Admin"],"portals":["AdminPortal"]}'
```

**On Windows (cmd)**:
```cmd
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"name\":\"Admin\",\"email\":\"admin@test.com\",\"password\":\"Test@1234\",\"roles\":[\"Admin\"],\"portals\":[\"AdminPortal\"]}"
```

---

## Step 4 — Start the Admin Portal

```bash
cd src/admin-portal
npm install
set PORT=3001 && npm start
```

Open `http://localhost:3001` and login with:
- Email: `admin@test.com`
- Password: `Test@1234`

### What to do in Admin Portal:

1. **Create a Tenant** — e.g., "Acme Corp"
2. **Add a domain** to the tenant — e.g., `localhost:4002` (this is how the user portal resolves the tenant)
3. **Create a User** — Select the tenant, assign `UserPortal` portal, `User` or `Manager` role

---

## Step 5 — Start the User Portal

```bash
cd src/user-portal
npm install
set PORT=4002 && npm start
```

Open `http://localhost:4002` and login with the user you created in Step 4.

> **Important**: The port `4002` must match the domain you added to the tenant in Step 4. The API resolves the tenant from the browser's origin URL.

---

## Running Multiple Tenants

Each tenant gets its own user portal instance on a different port:

```bash
# Tenant 1 — domain "localhost:4002" in DB
set PORT=4002 && npm start

# Tenant 2 — domain "localhost:4003" in DB
set PORT=4003 && npm start
```

Add the corresponding `localhost:PORT` as a domain in each tenant via the Admin Portal.

---

## Summary of Ports

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | — |
| API | 3000 | http://localhost:3000 |
| Admin Portal | 3001 | http://localhost:3001 |
| User Portal (Tenant 1) | 4002 | http://localhost:4002 |
| User Portal (Tenant 2) | 4003 | http://localhost:4003 |
| API Docs (Scalar) | 3000 | http://localhost:3000/api-docs |

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| DB password auth failed | Run `docker-compose down -v && docker-compose up -d` to reset the volume |
| Tables not created | Restart the API — tables are created on first access |
| Login fails on user portal | Ensure the tenant has the correct domain (e.g., `localhost:4002`) |
| 401 on all requests | Token expired (20 min). Re-login. |
| CORS errors | API has `cors()` enabled. Check the API is running. |
