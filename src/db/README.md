# Database Setup

PostgreSQL 16 via Docker Compose.

## Start

```bash
docker-compose up -d
```

## Stop

```bash
docker-compose down
```

## Reset (fresh database)

```bash
docker-compose down -v
docker-compose up -d
```

## Connection Details

| Property | Value |
|----------|-------|
| Host     | localhost |
| Port     | 5432 |
| Database | invt_mgmt_db |
| User     | invtMgmtUser |
| Password | invtMgmtUser@2k26 |

## Connect via VS Code

1. Install the **PostgreSQL** extension (by Microsoft) from the Extensions marketplace.
2. Open the **Database** panel in the sidebar (elephant icon).
3. Click **Connect a Server** (or the `+` icon).
4. Fill in the connection parameters:
   - **Server Name**: `localhost`
   - **Authentication Type**: `Password`
   - **User Name**: `invtMgmtUser`
   - **Password**: `invtMgmtUser@2k26`
   - **Database Name**: `invt_mgmt_db`
5. Check **Save Password** and click **Save & Connect**.

## Run Migrations

After the database is running:

```bash
cd ../api
npm run migrate
```
