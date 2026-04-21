# Tech Stack & Tools

Everything a new developer needs to know about the technologies, libraries, and tools used in this project.

📖 **[← Back to Main README](../README.md)**

---

## Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                   │
│  Admin Portal (:3001)          User Portal (:4002+)       │
│  react-router-dom · axios · react-scripts                 │
├──────────────────────────────────────────────────────────┤
│                     Backend (Node.js + Express)           │
│  JWT Auth · bcryptjs · Swagger + Scalar · pg driver       │
├──────────────────────────────────────────────────────────┤
│                     Database (PostgreSQL 16)               │
│  Docker · docker-compose                                  │
└──────────────────────────────────────────────────────────┘
```

---

## Backend — API (`src/api/`)

| Technology | Version | What It Does | Learn More |
|-----------|---------|-------------|------------|
| **Node.js** | 18+ | JavaScript runtime — runs the API server | [nodejs.org](https://nodejs.org/) |
| **Express** | 4.18 | Web framework — handles routes, middleware, request/response | [expressjs.com](https://expressjs.com/) |
| **pg** | 8.12 | PostgreSQL client — runs SQL queries from Node.js | [node-postgres.com](https://node-postgres.com/) |
| **jsonwebtoken** | 9.0 | Creates and verifies JWT tokens for authentication | [jwt.io](https://jwt.io/) |
| **bcryptjs** | 3.0 | Hashes passwords securely (used during signup/login) | [npm: bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **cors** | 2.8 | Enables Cross-Origin requests (frontend → API on different ports) | [npm: cors](https://www.npmjs.com/package/cors) |
| **dotenv** | 16.4 | Loads `.env` file variables into `process.env` | [npm: dotenv](https://www.npmjs.com/package/dotenv) |
| **swagger-jsdoc** | 6.2 | Generates OpenAPI spec from JSDoc comments in route files | [npm: swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc) |
| **@scalar/express-api-reference** | 0.8 | Renders interactive API docs UI at `/api-docs` | [scalar.com](https://scalar.com/) |
| **nodemon** | 3.1 *(dev)* | Auto-restarts server on file changes during development | [npm: nodemon](https://www.npmjs.com/package/nodemon) |

### How They Work Together

```
Browser Request
  → Express receives it
  → cors allows cross-origin
  → dotenv provides config
  → jsonwebtoken verifies auth token
  → pg runs SQL query on PostgreSQL
  → Express sends JSON response
```

---

## Frontend — Admin & User Portals (`src/admin-portal/`, `src/user-portal/`)

| Technology | Version | What It Does | Learn More |
|-----------|---------|-------------|------------|
| **React** | 19 | UI library — builds the interface with components and hooks | [react.dev](https://react.dev/) |
| **React DOM** | 19 | Renders React components into the browser DOM | [react.dev](https://react.dev/) |
| **React Router DOM** | 7 | Client-side routing — navigates between pages without reload | [reactrouter.com](https://reactrouter.com/) |
| **Axios** | 1.15 | HTTP client — calls the API with interceptors for auth headers | [axios-http.com](https://axios-http.com/) |
| **React Scripts** | 5.0 | Build toolchain (Webpack, Babel, ESLint) — `npm start`, `npm build` | [create-react-app.dev](https://create-react-app.dev/) |

### Key React Patterns Used

| Pattern | Where | Purpose |
|---------|-------|---------|
| **Context API** | `AuthContext.js` | Shares auth state (token, user) across all components |
| **Protected Routes** | `ProtectedRoute.js` | Redirects to login if user is not authenticated |
| **Reusable Modals** | `FormModal.js`, `ViewModal.js` | Same modal component used by Product, Inventory, Order |
| **Service Layer** | `services/*.js` | Separates API calls from UI components |

---

## Database

| Technology | Version | What It Does | Learn More |
|-----------|---------|-------------|------------|
| **PostgreSQL** | 16 (Alpine) | Relational database — stores all application data | [postgresql.org](https://www.postgresql.org/) |
| **Docker** | Latest | Runs PostgreSQL in a container (no local install needed) | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 3.8 | Defines and runs the database container with one command | [docs.docker.com/compose](https://docs.docker.com/compose/) |

### No ORM — Raw SQL

This project uses **raw SQL queries** via the `pg` driver instead of an ORM like Sequelize or Prisma. Each repository file contains its own SQL:

```
repositories/
├── productRepository.js    → CREATE TABLE products ..., SELECT, INSERT, UPDATE
├── inventoryRepository.js  → CREATE TABLE inventory ..., SELECT, INSERT, UPDATE
├── orderRepository.js      → CREATE TABLE orders ..., SELECT, INSERT, UPDATE
└── ...
```

**Why raw SQL?** — Full control, no abstraction overhead, easier to understand for learning.

---

## API Documentation

| Tool | URL | Purpose |
|------|-----|---------|
| **Scalar** | `http://localhost:3000/api-docs` | Interactive API docs UI — try endpoints directly in the browser |
| **OpenAPI JSON** | `http://localhost:3000/api-docs/openapi.json` | Raw OpenAPI 3.0 spec (can import into Postman) |
| **Swagger JSDoc** | — | Generates the OpenAPI spec from `@swagger` comments in route files |

### How API Docs Are Generated

1. Route files (`routes/*.js`) have `@swagger` JSDoc comments above each endpoint
2. `swagger-jsdoc` reads those comments and generates an OpenAPI 3.0 JSON spec
3. `@scalar/express-api-reference` renders that spec as a beautiful interactive UI

```js
// Example from a route file:
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 */
router.get('/', ctrl.list);
```

---

## Authentication & Security

| Concept | Tool/Library | How It Works |
|---------|-------------|-------------|
| **Password Hashing** | bcryptjs | Passwords are hashed before storing in DB, never stored as plain text |
| **Token-Based Auth** | jsonwebtoken (JWT) | After login, a signed token is issued containing userId, tenantId, roles |
| **Token Storage** | sessionStorage | Frontend stores the JWT in browser sessionStorage (cleared on tab close) |
| **Auth Interceptor** | Axios interceptor | Every API call automatically attaches `Authorization: Bearer <token>` header |
| **Token Expiry** | 20 minutes | Expired tokens return 401, frontend auto-redirects to login |
| **Tenant Resolution** | Custom middleware | Tenant is resolved from the browser's origin domain, not from user input |

---

## DevOps & Containerization

| File | Purpose |
|------|---------|
| `docker-compose.yml` (root) | Runs the **entire stack** — PostgreSQL + API + Admin Portal + User Portal |
| `src/db/docker-compose.yml` | Runs **only PostgreSQL** (for local development) |
| `src/api/Dockerfile` | Builds the API container image |
| `src/admin-portal/Dockerfile` | Builds the Admin Portal container image |
| `src/user-portal/Dockerfile` | Builds the User Portal container image |

### Run Everything with Docker

```bash
# From project root
docker-compose up -d
```

This starts all 4 services: database, API, admin portal, and user portal.

---

## Project Configuration Files

| File | What It Does |
|------|-------------|
| `package.json` | Lists dependencies and scripts (`npm start`, `npm install`) |
| `.env` | Environment variables (DB credentials, JWT secret, ports) |
| `.gitignore` | Files/folders excluded from Git (node_modules, .env) |
| `.dockerignore` | Files excluded from Docker builds (node_modules, .git) |
| `Dockerfile` | Instructions to build a Docker image for each service |

---

## Recommended Tools for Development

| Tool | Purpose | Download |
|------|---------|----------|
| **VS Code** | Code editor | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Docker Desktop** | Run containers locally | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| **Postman** | Test API endpoints manually | [postman.com](https://www.postman.com/) |
| **pgAdmin** or **DBeaver** | View/query the PostgreSQL database | [pgadmin.org](https://www.pgadmin.org/) / [dbeaver.io](https://dbeaver.io/) |
| **Git** | Version control | [git-scm.com](https://git-scm.com/) |

---

## Learning Path for Freshers

If you're new to this stack, here's a suggested order to learn:

1. **JavaScript basics** → Variables, functions, async/await, promises
2. **Node.js + Express** → Build a simple REST API with routes and middleware
3. **PostgreSQL + SQL** → CREATE TABLE, SELECT, INSERT, UPDATE, JOIN
4. **React** → Components, props, state, hooks (useState, useEffect, useContext)
5. **JWT Authentication** → How tokens work, login flow, protected routes
6. **Docker** → What containers are, docker-compose up/down
7. **Walk through this project** → Follow the [Getting Started](GETTING-STARTED.md) guide, then read the code

### Suggested Reading Order for Docs

| # | Document | Why |
|---|----------|-----|
| 1 | **[Getting Started](GETTING-STARTED.md)** | Set up and run the project first |
| 2 | **[Architecture](ARCHITECTURE.md)** | Understand how the pieces fit together |
| 3 | **[Database](DATABASE.md)** | See the tables and relationships |
| 4 | **[API Reference](API-REFERENCE.md)** | Know all the endpoints |
| 5 | **[Multi-Tenancy](MULTI-TENANCY.md)** | Understand tenant isolation |
| 6 | **[Roles & Permissions](ROLES-PERMISSIONS.md)** | Understand access control |
| 7 | **[Features](FEATURES.md)** | See what's built and what's pending |
| 8 | **[Assumptions](ASSUMPTIONS.md)** | Design decisions and trade-offs |
