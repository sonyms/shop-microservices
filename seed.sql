-- seed.sql
-- Clear existing data if necessary (optional, but good for idempotency)
TRUNCATE TABLE user_credentials CASCADE;
TRUNCATE TABLE products CASCADE;

-- Insert 1000 users
-- Password is 'password' hashed with BCrypt
INSERT INTO user_credentials (
    username, 
    email, 
    password, 
    role, 
    status, 
    first_name, 
    last_name, 
    created_at, 
    deleted
)
SELECT 
    'testuser' || i, 
    'testuser' || i || '@test.com', 
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HCGFJZ3/WAW5yK.R5rOq2', 
    'USER', 
    'ACTIVE', 
    'Test', 
    'User' || i, 
    CURRENT_TIMESTAMP, 
    false
FROM generate_series(1, 1000) AS s(i);

-- Insert 1000 products
-- Stock is incredibly high to prevent running out during load tests
INSERT INTO products (
    name, 
    description, 
    price, 
    stock_quantity, 
    created_at, 
    deleted
)
SELECT 
    'Test Product ' || i, 
    'This is an automatically generated product for load testing.', 
    19.99 + (i % 100), 
    100000, 
    CURRENT_TIMESTAMP, 
    false
FROM generate_series(1, 1000) AS s(i);

-- Ensure auto-increment sequences are advanced so app doesn't crash on new inserts
SELECT setval(pg_get_serial_sequence('user_credentials', 'id'), COALESCE((SELECT MAX(id)+1 FROM user_credentials), 1), false);
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id)+1 FROM products), 1), false);
