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