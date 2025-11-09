# Database Setup Guide for Scalable Services Project

This guide provides step-by-step instructions to set up and seed the databases for the Scalable Services project using Docker and SQL Server.

## Prerequisites

- Docker Desktop installed and running
- Node.js installed (for running the seed script)
- SQL Server Management Studio (SSMS) - optional, for viewing databases
- PowerShell or Command Prompt

## Project Structure Overview

The project uses 5 separate SQL Server databases:
- **catalog_db** (Port 1433) - Events, Venues
- **user_db** (Port 1437) - Users
- **seating_db** (Port 1434) - Seats
- **order_db** (Port 1435) - Orders, Tickets
- **payment_db** (Port 1436) - Payments

## Step-by-Step Setup Instructions

### 1. Start Database Containers

First, start only the database services to allow them to initialize properly:

```powershell
docker compose up -d catalog-db user-db seating-db order-db payment-db
```

### 2. Wait for Database Initialization

Wait for the databases to fully initialize (approximately 60-90 seconds):

```powershell
Start-Sleep -Seconds 60
```

### 3. Check Database Status

Verify that databases are running:

```powershell
docker ps | findstr "db-1"
```

### 4. Create Database Initialization Scripts

Create individual SQL scripts for each database. These scripts create the databases and app_user login.

#### catalog-db initialization script (`init-catalog-db.sql`):
```sql
-- Initialize catalog database
CREATE DATABASE catalog_db;
GO

-- Create app_user login
CREATE LOGIN app_user WITH PASSWORD = 'StrongP@ssw0rd!';
GO

-- Switch to catalog_db and create user
USE catalog_db;
GO

CREATE USER app_user FOR LOGIN app_user;
GO

ALTER ROLE db_owner ADD MEMBER app_user;
GO
```

#### user-db initialization script (`init-user-db.sql`):
```sql
-- Initialize user database
CREATE DATABASE user_db;
GO

-- Create app_user login
CREATE LOGIN app_user WITH PASSWORD = 'StrongP@ssw0rd!';
GO

-- Switch to user_db and create user
USE user_db;
GO

CREATE USER app_user FOR LOGIN app_user;
GO

ALTER ROLE db_owner ADD MEMBER app_user;
GO
```

#### seating-db initialization script (`init-seating-db.sql`):
```sql
-- Initialize seating database
CREATE DATABASE seating_db;
GO

-- Create app_user login
CREATE LOGIN app_user WITH PASSWORD = 'StrongP@ssw0rd!';
GO

-- Switch to seating_db and create user
USE seating_db;
GO

CREATE USER app_user FOR LOGIN app_user;
GO

ALTER ROLE db_owner ADD MEMBER app_user;
GO
```

#### order-db initialization script (`init-order-db.sql`):
```sql
-- Initialize order database
CREATE DATABASE order_db;
GO

-- Create app_user login
CREATE LOGIN app_user WITH PASSWORD = 'StrongP@ssw0rd!';
GO

-- Switch to order_db and create user
USE order_db;
GO

CREATE USER app_user FOR LOGIN app_user;
GO

ALTER ROLE db_owner ADD MEMBER app_user;
GO
```

#### payment-db initialization script (`init-payment-db.sql`):
```sql
-- Initialize payment database
CREATE DATABASE payment_db;
GO

-- Create app_user login
CREATE LOGIN app_user WITH PASSWORD = 'StrongP@ssw0rd!';
GO

-- Switch to payment_db and create user
USE payment_db;
GO

CREATE USER app_user FOR LOGIN app_user;
GO

ALTER ROLE db_owner ADD MEMBER app_user;
GO
```

### 5. Initialize Each Database

Run the initialization scripts on each database container:

```powershell
# Initialize catalog database
docker cp init-catalog-db.sql ss-catalog-db-1:/tmp/init.sql
docker exec ss-catalog-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "StrongP@ssw0rd!" -C -i /tmp/init.sql

# Initialize user database
docker cp init-user-db.sql ss-user-db-1:/tmp/init.sql
docker exec ss-user-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "StrongP@ssw0rd!" -C -i /tmp/init.sql

# Initialize seating database
docker cp init-seating-db.sql ss-seating-db-1:/tmp/init.sql
docker exec ss-seating-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "StrongP@ssw0rd!" -C -i /tmp/init.sql

# Initialize order database
docker cp init-order-db.sql ss-order-db-1:/tmp/init.sql
docker exec ss-order-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "StrongP@ssw0rd!" -C -i /tmp/init.sql

# Initialize payment database
docker cp init-payment-db.sql ss-payment-db-1:/tmp/init.sql
docker exec ss-payment-db-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "StrongP@ssw0rd!" -C -i /tmp/init.sql
```

### 6. Install Node.js Dependencies for Seed Script

Create a `package.json` file in the root directory and install required packages:

```powershell
# Create package.json (if not exists)
npm init -y

# Install required dependencies
npm install csv-parser sequelize tedious
```

### 7. Run the Seed Script

Execute the seed script to populate all databases with test data:

```powershell
node seedDataToDB.js
```

Expected output:
```
✅ Table "Events" created in database "catalog_db"
📄 "...\seed-data\etsr_events.csv" loaded with 60 rows
✅ Inserted 60/60 rows into "Events"
✅ Table "Orders" created in database "order_db"
📄 "...\seed-data\etsr_orders.csv" loaded with 400 rows
✅ Inserted 400/400 rows into "Orders"
...
🎉 Seeding complete: 7/7 tables seeded successfully.
```

## Connecting to Databases via SQL Server Management Studio (SSMS)

### Connection Details for Each Database:

| Database | Server Name | Port | Database Name | Login | Password |
|----------|-------------|------|---------------|-------|----------|
| Catalog | `localhost,1433` | 1433 | catalog_db | app_user | StrongP@ssw0rd! |
| User | `localhost,1437` | 1437 | user_db | app_user | StrongP@ssw0rd! |
| Seating | `localhost,1434` | 1434 | seating_db | app_user | StrongP@ssw0rd! |
| Order | `localhost,1435` | 1435 | order_db | app_user | StrongP@ssw0rd! |
| Payment | `localhost,1436` | 1436 | payment_db | app_user | StrongP@ssw0rd! |

### Connection Steps in SSMS:
1. Open SQL Server Management Studio
2. In "Connect to Server" dialog:
   - **Server type**: Database Engine
   - **Server name**: `localhost,1433` (use appropriate port)
   - **Authentication**: SQL Server Authentication
   - **Login**: `app_user`
   - **Password**: `StrongP@ssw0rd!`
3. Click "Connect"

### Alternative Connection Strings:
```
# Catalog Database
Data Source=localhost,1433;Initial Catalog=catalog_db;User ID=app_user;Password=StrongP@ssw0rd!;Encrypt=True;TrustServerCertificate=True

# User Database  
Data Source=localhost,1437;Initial Catalog=user_db;User ID=app_user;Password=StrongP@ssw0rd!;Encrypt=True;TrustServerCertificate=True

# Seating Database
Data Source=localhost,1434;Initial Catalog=seating_db;User ID=app_user;Password=StrongP@ssw0rd!;Encrypt=True;TrustServerCertificate=True

# Order Database
Data Source=localhost,1435;Initial Catalog=order_db;User ID=app_user;Password=StrongP@ssw0rd!;Encrypt=True;TrustServerCertificate=True

# Payment Database
Data Source=localhost,1436;Initial Catalog=payment_db;User ID=app_user;Password=StrongP@ssw0rd!;Encrypt=True;TrustServerCertificate=True
```

## Verification

After setup, you should see the following tables in each database:

- **catalog_db**: Events (60 rows), Venues (15 rows)
- **user_db**: Users (80 rows)
- **seating_db**: Seats (7,301 rows)
- **order_db**: Orders (400 rows), Tickets (995 rows)
- **payment_db**: Payments (400 rows)

## Troubleshooting

### Common Issues:

1. **"Login failed for user 'sa'"**
   - Wait longer for database initialization (try 90-120 seconds)
   - Check if container is running: `docker ps`

2. **"Cannot find module 'csv-parser'"**
   - Install dependencies: `npm install csv-parser sequelize tedious`

3. **Connection timeout in SSMS**
   - Verify Docker containers are running
   - Check port numbers in connection string
   - Ensure databases have been initialized with the scripts

4. **Container names different**
   - Check actual container names: `docker ps`
   - Adjust commands accordingly (replace `ss-catalog-db-1` with actual name)

### Useful Commands:

```powershell
# Check running containers
docker ps

# Check container logs
docker logs ss-catalog-db-1

# Stop all containers
docker compose down

# Remove all containers and volumes
docker compose down -v

# Restart specific container
docker restart ss-catalog-db-1
```

## File Structure

Make sure you have these files in your project root:
```
├── docker-compose.yml
├── seedDataToDB.js
├── package.json
├── init-catalog-db.sql
├── init-user-db.sql
├── init-seating-db.sql
├── init-order-db.sql
├── init-payment-db.sql
└── seed-data/
    ├── etsr_events.csv
    ├── etsr_orders.csv
    ├── etsr_payments.csv
    ├── etsr_seats.csv
    ├── etsr_tickets.csv
    ├── etsr_users.csv
    └── etsr_venues.csv
```

## Next Steps

Once databases are set up and seeded:
1. Fix the notification service Dockerfile issue
2. Start all application services: `docker compose up --build`
3. Access your microservices on their respective ports

---

**Created**: November 5, 2025  
**Author**: Database Setup Guide  
**Version**: 1.0