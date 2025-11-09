#!/bin/bash
set -e

# Wait for SQL Server to start
until /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d master -Q "SELECT 1;" &> /dev/null; do
  echo "Waiting for SQL Server to start..."
  sleep 2
done

echo "SQL Server is up - initializing database..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -i /app/init.sql
echo "Database initialization completed."

# Keep container running
tail -f /dev/null