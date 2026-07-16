# Meridian — Student Management System

A full-stack Student Management System: Spring Boot + MySQL backend, React +
Vite frontend. This is a **working foundation**, not the complete 20-module
spec — see "Scope" below for exactly what's implemented vs. stubbed.

```
sms/
  backend/    Spring Boot 3 / Java 17 REST API (JWT auth, Student CRUD, MySQL)
  frontend/   React + Vite + Tailwind dashboard (auth flow, landing page, Student Management UI)
```

## Quick start

**Backend** (needs Java 17+, Maven, MySQL running locally):
```bash
cd backend
export DB_USERNAME=root DB_PASSWORD=your_password
mvn spring-boot:run
```

**Frontend** (needs Node 18+):
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`, register an account from the Register page
(pick ADMIN to see everything), and log in.

Full setup details, including how to create your first admin account and the
full API reference, are in `backend/README.md` and `frontend/README.md`.

## Scope: what's actually implemented

**Fully working, end-to-end:**
- JWT authentication (register/login), role-based authorization (ADMIN/TEACHER/STUDENT)
- Student Management: full CRUD, search, filter by department/status, sortable
  columns, pagination, CSV export — wired from React all the way to MySQL
- Department and Course CRUD (needed as dropdowns for Student records)
- Dashboard shell: sidebar, top bar, dark/light theme, notifications UI, profile menu
- Landing page, login, registration, forgot-password UI

**Scaffolded but not implemented** (routes/nav exist, pages are placeholders):
Teacher Management, Attendance, Marks, Examinations, Fees, Library, Hostel,
Transport, Timetable, Notices, Events, Reports, Settings, and the
student-facing "My Attendance / My Marks / My Fees" views. The dashboard's
stat cards and charts currently show mock data rather than live numbers.

**Not implemented at all:**
Email/OTP-based password reset (the UI exists, the backend endpoints don't),
file upload for profile photos, real-time notifications, audit logging,
backup/restore, multi-language support, Swagger examples beyond the default,
and a formal ER diagram document.

## How to extend it

The Student module (`backend/src/main/java/com/sms/{entity,repository,service,controller}/Student*`
and `frontend/src/pages/Students.jsx` + `StudentFormModal.jsx`) is the
reference pattern. Building out Teacher Management, for example, means:

1. `Teacher` entity + repository (mirror `Student.java`)
2. `TeacherService` + `TeacherController` (mirror `StudentService`/`StudentController`)
3. Add `/api/teachers` to `SecurityConfig`'s authorization rules
4. A `Teachers.jsx` page mirroring `Students.jsx`, swapped into `App.jsx` in place
   of the `teachers` placeholder route

Recommended build order given dependencies between modules: Teacher →
Attendance → Examinations/Marks → Fees → the rest.
