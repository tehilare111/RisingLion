-- Seed categories
INSERT INTO categories(name) VALUES ('Action'),('Drama'),('Comedy'),('Sci-Fi');

-- Theaters
INSERT INTO theaters() VALUES (),(),();

-- Seats: 8 rows (A-H) x 12 per theater using recursive CTEs (MySQL 8+)
WITH RECURSIVE r(n) AS (
  SELECT 0
  UNION ALL SELECT n+1 FROM r WHERE n < 7
),
 c(n) AS (
  SELECT 1
  UNION ALL SELECT n+1 FROM c WHERE n < 12
),
 t(n) AS (
  SELECT 1
  UNION ALL SELECT n+1 FROM t WHERE n < 3
)
INSERT INTO seats(row_label, number, theater_id)
SELECT CHAR(65 + r.n) AS row_label, c.n AS number, t.n AS theater_id
FROM r CROSS JOIN c CROSS JOIN t
ORDER BY theater_id, row_label, number;

-- Movies
INSERT INTO movies(title,duration,description,release_date,imageurl,category_id) VALUES
('Sky Guardians',120,'Aerial action saga', '2023-10-01','https://picsum.photos/seed/sky/400/300', 1),
('Ocean Echoes',110,'Drama on the high seas','2024-02-15','https://picsum.photos/seed/ocean/400/300',2),
('Laugh Lane',95,'Light-hearted comedy','2024-05-11','https://picsum.photos/seed/laugh/400/300',3),
('Nova Drift',130,'Epic sci-fi journey','2024-11-20','https://picsum.photos/seed/nova/400/300',4),
('Metro Chase',105,'Urban action thriller','2024-03-08','https://picsum.photos/seed/metro/400/300',1),
('Quiet Strings',118,'Music and heart','2023-12-05','https://picsum.photos/seed/strings/400/300',2);

-- Screenings over next 7 days per movie in theater 1
INSERT INTO screenings(datetime, ticket_price, movie_id, theater_id)
SELECT DATE_ADD(CURDATE(), INTERVAL d DAY) + INTERVAL h HOUR, 45.00, m.id, 1
FROM (SELECT 0 d UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) days
CROSS JOIN (SELECT 12 h UNION SELECT 15 UNION SELECT 18 UNION SELECT 21) hours
CROSS JOIN (SELECT id FROM movies LIMIT 6) m;
