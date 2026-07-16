# Meridian — Student Management System (Frontend)

React 18 + Vite + Tailwind CSS + Framer Motion + Recharts, talking to the Spring
Boot backend in `../backend`.

## Setup

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. The dev server proxies `/api/*` requests to
`http://localhost:8080` (see `vite.config.js`), so make sure the backend is
running first.

## What's built

- **Landing page** — hero, features, stats, testimonials, contact form, footer.
- **Auth** — login (with remember-me, show/hide password), registration
  (role picker), forgot-password UI (front-end only — see the note in
  `src/pages/ForgotPassword.jsx`, the backend endpoints don't exist yet).
- **Dashboard shell** — sidebar (role-aware links), top bar with search,
  notifications, dark/light theme toggle, profile menu.
- **Dashboard overview** — stat cards + charts. Currently uses **mock data**;
  swap in a real `/api/dashboard/summary` endpoint when you build it.
- **Student Management** — fully wired to the backend: search, filter by
  department/status, sortable columns, pagination, add/edit modal, delete
  confirmation, CSV export, print.
- **Every other sidebar link** (Teachers, Attendance, Marks, Fees, Library,
  Hostel, Transport, Examinations, Timetable, Notices, Events, Settings, and
  the student-facing "My ___" pages) routes to a placeholder page — so
  navigation is complete and each one is a matter of building the page +
  backend module using Students as the template.

## Login for testing

There's no seeded user. Register one from `/register`, or via curl — see the
backend README.

## Structure

```
src/
  api/axiosClient.js       — axios instance with JWT interceptor + 401 handling
  context/                 — AuthContext, ThemeContext
  routes/ProtectedRoute.jsx
  layouts/DashboardLayout.jsx
  components/              — Sidebar, Topbar, StatCard, StudentFormModal, ConfirmDialog, PlaceholderPage
  pages/                    — Landing, Login, Register, ForgotPassword, Dashboard, Students
```
