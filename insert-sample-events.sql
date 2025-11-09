USE catalog_db;

-- Insert sample events data
INSERT INTO Events (event_id, venue_id, title, event_type, event_date, base_price, status) VALUES
(1, 14, 'Workshop #200', 'Concert', '2025-06-07 20:35:51', 683.28, 'SOLD_OUT'),
(2, 5, 'Concert #291', 'Conference', '2024-05-19 10:38:35', 492.51, 'CANCELLED'),
(3, 3, 'Stand-up #927', 'Conference', '2025-07-11 01:40:41', 492.59, 'SCHEDULED'),
(4, 4, 'Concert #838', 'Concert', '2023-07-30 05:37:18', 2602.9, 'CANCELLED'),
(5, 6, 'Workshop #166', 'Play', '2023-05-04 11:15:03', 2929.29, 'SCHEDULED');

-- Check count
SELECT COUNT(*) as EventCount FROM Events;