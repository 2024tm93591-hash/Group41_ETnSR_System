-- Database Status Check Script
USE catalog_db;
SELECT 'catalog_db' as Database, 'Events' as TableName, COUNT(*) as RowCount FROM Events
UNION ALL 
SELECT 'catalog_db', 'Venues', COUNT(*) FROM Venues;