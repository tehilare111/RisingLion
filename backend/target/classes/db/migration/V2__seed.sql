-- Seed categories
INSERT INTO categories(name) VALUES ('Action'),('Drama'),('Comedy'),('Sci-Fi');

-- Theaters
INSERT INTO theaters() VALUES (),(),();

-- Seats: 8 rows (A-H) x 12 per theater without CTEs (broad MySQL compatibility)
INSERT INTO seats(row_label, number, theater_id)
SELECT rl.row_label, n.num, t.id AS theater_id
FROM (
  SELECT 'A' AS row_label UNION ALL SELECT 'B' UNION ALL SELECT 'C' UNION ALL SELECT 'D'
  UNION ALL SELECT 'E' UNION ALL SELECT 'F' UNION ALL SELECT 'G' UNION ALL SELECT 'H'
) rl
CROSS JOIN (
  SELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
  UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
) n
CROSS JOIN (
  SELECT id FROM theaters ORDER BY id LIMIT 3
) t
ORDER BY t.id, rl.row_label, n.num;

-- Movies
INSERT INTO movies(title,duration,description,release_date,imageurl,category_id) VALUES
('Sky Guardians',120,'Aerial action saga', '2023-10-01','https://picsum.photos/seed/sky/400/300', 1),
('Ocean Echoes',110,'Drama on the high seas','2024-02-15','https://picsum.photos/seed/ocean/400/300',2),
('Laugh Lane',95,'Light-hearted comedy','2024-05-11','https://picsum.photos/seed/laugh/400/300',3),
('Nova Drift',130,'Epic sci-fi journey','2024-11-20','https://picsum.photos/seed/nova/400/300',4),
('Metro Chase',105,'Urban action thriller','2024-03-08','https://picsum.photos/seed/metro/400/300',1),
('Quiet Strings',118,'Music and heart','2023-12-05','https://picsum.photos/seed/strings/400/300',2);

-- Screenings over next 7 days: distribute movies across 3 theaters and 4 time slots to avoid (theater_id, datetime) conflicts
-- Use a stable index per movie to choose theater and hour
SET @i := -1;
INSERT INTO screenings(datetime, ticket_price, movie_id, theater_id)
SELECT 
  DATE_ADD(CURDATE(), INTERVAL d DAY) 
    + INTERVAL (CASE (idx % 4) WHEN 0 THEN 12 WHEN 1 THEN 15 WHEN 2 THEN 18 ELSE 21 END) HOUR,
  45.00,
  ml.id,
  (idx % 3) + 1 AS theater_id
FROM (
  SELECT m.id AS id, (@i := @i + 1) AS idx FROM movies m ORDER BY m.id
) ml
CROSS JOIN (
  SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
) days;
