# Wait for SQL Server to start up
echo "Waiting for SQL Server to start up..."
sleep 30s

# Run the initialization SQL
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "StrongP@ssw0rd!" -i /app/init.sql

echo "Database initialization completed."