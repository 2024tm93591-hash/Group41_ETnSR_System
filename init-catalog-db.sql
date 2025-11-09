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