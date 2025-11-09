#!/bin/bash
set -e

for db in catalog-db order-db payment-db seating-db user-db; do
  # Wait for SQL Server to become healthy
  while ! docker-compose exec $db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "StrongP@ssw0rd!" -Q "SELECT 1;" &> /dev/null; do
    echo "Waiting for $db to become ready..."
    sleep 5
  done

  echo "$db is ready - initializing database..."
  docker-compose exec $db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "StrongP@ssw0rd!" -i /app/init.sql
  echo "$db initialization completed."
done