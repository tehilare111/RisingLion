-- Schema initialization
CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE movies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  duration INT NOT NULL,
  description TEXT NOT NULL,
  release_date DATE,
  imageurl VARCHAR(1000),
  category_id BIGINT NOT NULL,
  CONSTRAINT uq_movie_title_release UNIQUE (title, release_date),
  CONSTRAINT fk_movie_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE theaters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  row_count INT NOT NULL,
  seats_per_row INT NOT NULL
);

CREATE TABLE seats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  row_label VARCHAR(2) NOT NULL,
  number INT NOT NULL,
  theater_id BIGINT NOT NULL,
  CONSTRAINT uq_seat UNIQUE (row_label, number, theater_id),
  CONSTRAINT fk_seat_theater FOREIGN KEY (theater_id) REFERENCES theaters(id)
);

CREATE TABLE screenings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  datetime DATETIME NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL,
  movie_id BIGINT NOT NULL,
  theater_id BIGINT NOT NULL,
  CONSTRAINT uq_screening UNIQUE (theater_id, datetime),
  CONSTRAINT fk_screening_movie FOREIGN KEY (movie_id) REFERENCES movies(id),
  CONSTRAINT fk_screening_theater FOREIGN KEY (theater_id) REFERENCES theaters(id)
);

CREATE TABLE bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  total_price DECIMAL(10,2) NOT NULL,
  user_id BIGINT NOT NULL,
  screening_id BIGINT NOT NULL,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_booking_screening FOREIGN KEY (screening_id) REFERENCES screenings(id)
);

CREATE TABLE tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  seat_id BIGINT NOT NULL,
  booking_id BIGINT NOT NULL,
  screening_id BIGINT NOT NULL,
  CONSTRAINT uq_ticket UNIQUE (screening_id, seat_id),
  CONSTRAINT fk_ticket_seat FOREIGN KEY (seat_id) REFERENCES seats(id),
  CONSTRAINT fk_ticket_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_ticket_screening FOREIGN KEY (screening_id) REFERENCES screenings(id)
);

CREATE TABLE reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rating INT NOT NULL,
  text TEXT,
  user_id BIGINT NOT NULL,
  movie_id BIGINT NOT NULL,
  CONSTRAINT uq_review UNIQUE (user_id, movie_id),
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_review_movie FOREIGN KEY (movie_id) REFERENCES movies(id)
);
