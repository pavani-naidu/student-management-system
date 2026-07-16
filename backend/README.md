# Student Management System — Backend

Spring Boot 3 / Java 17 REST API with JWT authentication, role-based authorization
(ADMIN / TEACHER / STUDENT), and a Student CRUD module wired to MySQL.

## Prerequisites

- Java 17+
- Maven 3.9+
- MySQL 8+ running locally (or update `application.yml` to point elsewhere)

## Setup

1. Create a MySQL database (or let the app create it automatically — the JDBC URL
   uses `createDatabaseIfNotExist=true`):

   ```sql
   CREATE DATABASE sms_db;
   ```

2. Set environment variables (or edit `src/main/resources/application.yml` directly):

   ```bash
   export DB_USERNAME=root
   export DB_PASSWORD=your_mysql_password
   export JWT_SECRET=$(openssl rand -base64 32)   # generate a real secret for anything beyond local dev
   export CORS_ORIGINS=http://localhost:5173
   ```

3. Run it:

   ```bash
   mvn spring-boot:run
   ```

   The API starts on `http://localhost:8080`. Swagger UI is at
   `http://localhost:8080/swagger-ui.html`.

4. Run tests (uses an in-memory H2 database, no MySQL needed):

   ```bash
   mvn test
   ```

## Creating your first admin account

No admin user is seeded in `data.sql` (passwords must be BCrypt-hashed, and
hand-writing a hash into SQL is a good way to lock yourself out). Instead, call:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Admin User","email":"admin@school.edu","password":"Admin@12345","role":"ADMIN"}'
```

This returns a JWT you can use immediately, or log in again later via `/api/auth/login`.

## API overview

| Method | Endpoint                | Access          | Description                     |
|--------|--------------------------|-----------------|----------------------------------|
| POST   | `/api/auth/register`    | Public          | Register a new account           |
| POST   | `/api/auth/login`       | Public          | Log in, receive JWT              |
| GET    | `/api/students`         | ADMIN, TEACHER  | Paginated/filterable student list|
| GET    | `/api/students/{id}`    | ADMIN, TEACHER  | Get one student                  |
| POST   | `/api/students`         | ADMIN, TEACHER  | Create student                   |
| PUT    | `/api/students/{id}`    | ADMIN, TEACHER  | Update student                   |
| DELETE | `/api/students/{id}`    | ADMIN, TEACHER  | Delete student                   |
| GET    | `/api/departments`      | ADMIN           | List departments                 |
| POST   | `/api/departments`      | ADMIN           | Create department                |
| GET    | `/api/courses`          | ADMIN           | List courses                     |
| POST   | `/api/courses`          | ADMIN           | Create course                    |

`GET /api/students` supports: `query`, `departmentId`, `courseId`, `status`,
`page`, `size`, `sortBy`, `direction`.

## What's scaffolded vs. what's next

This backend currently implements **Auth** and **Student Management** end-to-end.
The remaining modules from the original spec (Teacher, Attendance, Marks, Fees,
Library, Hostel, Transport, Examination, Timetable, Notices, Events, Reports) are
**not yet implemented** — the entity/repository/service/controller pattern used
for `Student` is the template to follow for each of them. Recommended order,
since later modules depend on earlier ones existing: Teacher → Attendance →
Marks/Examination → Fees → the rest.

## Security notes for production

- Replace the default `JWT_SECRET` — the one in `application.yml` is for local
  dev only and is visible in this repo.
- Switch `spring.jpa.hibernate.ddl-auto` from `update` to `validate` once
  `schema.sql` is your source of truth, and run migrations through a tool like
  Flyway or Liquibase instead of relying on Hibernate to alter tables.
- Put real rate limiting in front of `/api/auth/login` to slow down credential
  stuffing.
