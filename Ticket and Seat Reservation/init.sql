-- Create databases
CREATE DATABASE user_db;
GO
CREATE DATABASE catalog_db;
GO
CREATE DATABASE seating_db;
GO
CREATE DATABASE order_db;
GO
CREATE DATABASE payment_db;
GO

-- Create login
CREATE LOGIN app_user WITH PASSWORD = 'StrongP@ssw0rd!';
GO

-- Create users and grant permissions for each database
USE user_db;
GO
CREATE USER app_user FOR LOGIN app_user;
GO
ALTER ROLE db_owner ADD MEMBER app_user;
GO

USE catalog_db;
GO
CREATE USER app_user FOR LOGIN app_user;
GO
ALTER ROLE db_owner ADD MEMBER app_user;
GO

USE seating_db;
GO
CREATE USER app_user FOR LOGIN app_user;
GO
ALTER ROLE db_owner ADD MEMBER app_user;
GO

USE order_db;
GO
CREATE USER app_user FOR LOGIN app_user;
GO
ALTER ROLE db_owner ADD MEMBER app_user;
GO

USE payment_db;
GO
CREATE USER app_user FOR LOGIN app_user;
GO
ALTER ROLE db_owner ADD MEMBER app_user;
GO