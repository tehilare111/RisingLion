# RisingLion

RisingLion is a movie ticket booking web app (no payments). It features two roles: USER and ADMIN.

- USER: sign up/login, browse/search movies, view reviews, pick a screening, view seat map with availability, reserve seats, see "My bookings", rate 1–5 and write a text review (only for movies they've seen), edit profile (email), logout.
- ADMIN: CRUD movies and categories, manage theaters, define screenings (movie, theater, datetime, ticketPrice), view bookings per screening, view users, promote/demote to ADMIN and remove users.

## Monorepo Structure

- `backend/` — Java 21, Spring Boot 3, Maven, MySQL 8, JWT security, OpenAPI/Swagger UI.
- `frontend/` — React + Vite + TypeScript + Tailwind CSS.
- `docker/` — Docker Compose for MySQL 8 and phpMyAdmin.
- `.github/workflows/` — CI building and testing backend and frontend.

## Quick Start

Prereqs: Java 21, Node 18+, Docker, Maven 3.9+

1) Start DB services

- cd docker
- docker compose up -d

MySQL: localhost:3306 (db: risinglion, user: root, password: rootpass)
phpMyAdmin: http://localhost:8081

2) Backend

- cd backend
- mvn spring-boot:run

App starts at http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html

3) Frontend

- cd frontend
- cp .env.example .env
- npm install
- npm run dev

App runs at http://localhost:5173

## Configuration

Backend `application.yml` uses:
- spring.datasource.url: jdbc:mysql://localhost:3306/risinglion
- spring.datasource.username: root
- spring.datasource.password: rootpass
- jwt.secret: change in production

Frontend `.env`:
- VITE_API_BASE_URL=http://localhost:8080/api

## API Overview (prefix `/api`)

Auth:
- POST /auth/signup
- POST /auth/login -> { accessToken, user:{id,email,isAdmin} }
- POST /auth/reset-password (placeholder)

Users:
- GET /users/me
- PATCH /users/me (email)

Admin:
- GET /admin/users
- PATCH /admin/users/{id}/role/{role}
- DELETE /admin/users/{id}

Movies & Categories:
- GET /movies?query=&categoryId=&page=
- GET /movies/{id}
- GET /categories
- (ADMIN) POST/PUT/DELETE /movies
- (ADMIN) POST/PUT/DELETE /categories

Screenings & Theaters:
- GET /theaters
- GET /screenings?date=YYYY-MM-DD
- GET /movies/{id}/screenings
- (ADMIN) POST/PUT/DELETE /theaters
- (ADMIN) POST/PUT/DELETE /screenings

Seats & Booking:
- GET /screenings/{id}/seats -> seat map with availability
- POST /bookings { screeningId, seatIds[] } -> creates Booking + Tickets; totalPrice = seat count × ticketPrice
- GET /bookings/me
- GET /screenings/{id}/bookings (ADMIN)

Reviews:
- GET /movies/{id}/reviews
- POST /movies/{id}/reviews (only if user has a past booking for that movie)
- PUT/DELETE /movies/{id}/reviews/{reviewId} (owner only)

Errors follow Problem+JSON style responses.

## Database & Seeding

Flyway migrations create schema and seed:
- 3 theaters with 8 rows × 12 seats each (rows A–H)
- Categories and ~6 movies
- Several screenings across the next 7 days
- One admin user (admin@demo.com / min123!) and one regular user

## CI

GitHub Actions builds and runs tests for backend and frontend.

## Acceptance Checklist

- Sign up/login with JWT; protected routes and role gating
- Movie search & category filter
- Admin can create screenings; they appear in user flows
- Seat map reflects real-time availability; double booking prevented
- Booking creates Booking + Tickets and appears under “My bookings”
- Only users who booked can post a review for that movie
- Swagger UI documents endpoints with examples
- CI passes for both apps
