-- Create databases
CREATE DATABASE user_db;
CREATE DATABASE catalog_db;
CREATE DATABASE seating_db;
CREATE DATABASE order_db;
CREATE DATABASE payment_db;

-- Create app_user login
CREATE LOGIN app_user WITH PASSWORD = 'StrongP@ssw0rd!';

-- Switch to each database and create user, then grant permissions
USE user_db;
CREATE USER app_user FOR LOGIN app_user;
ALTER ROLE db_owner ADD MEMBER app_user;

USE catalog_db;
CREATE USER app_user FOR LOGIN app_user;
ALTER ROLE db_owner ADD MEMBER app_user;

USE seating_db;
CREATE USER app_user FOR LOGIN app_user;
ALTER ROLE db_owner ADD MEMBER app_user;

USE order_db;
CREATE USER app_user FOR LOGIN app_user;
ALTER ROLE db_owner ADD MEMBER app_user;

USE payment_db;
CREATE USER app_user FOR LOGIN app_user;
ALTER ROLE db_owner ADD MEMBER app_user;