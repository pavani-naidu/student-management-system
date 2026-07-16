import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import PlaceholderPage from './components/PlaceholderPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// Modules not yet built out — routed to a placeholder so navigation/sidebar links
// all resolve, ready to be swapped for real pages one at a time.
const STUB_MODULES = [
  { path: 'teachers', title: 'Teacher Management' },
  { path: 'courses', title: 'Course Management' },
  { path: 'departments', title: 'Department Management' },
  { path: 'attendance', title: 'Attendance Management' },
  { path: 'marks', title: 'Marks Management' },
  { path: 'fees', title: 'Fee Management' },
  { path: 'library', title: 'Library Management' },
  { path: 'hostel', title: 'Hostel Management' },
  { path: 'transport', title: 'Transport Management' },
  { path: 'examinations', title: 'Examination Management' },
  { path: 'timetable', title: 'Timetable' },
  { path: 'notices', title: 'Notice Board' },
  { path: 'events', title: 'Events' },
  { path: 'settings', title: 'Settings' },
  { path: 'my-attendance', title: 'My Attendance' },
  { path: 'my-marks', title: 'My Marks' },
  { path: 'my-fees', title: 'My Fees' },
];

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Students />
              </ProtectedRoute>
            }
          />
          {STUB_MODULES.map(({ path, title }) => (
            <Route key={path} path={`/${path}`} element={<PlaceholderPage title={title} />} />
          ))}
        </Route>
      </Routes>
    </>
  );
}

export default App;
