import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import Departments from './pages/Departments.jsx';
import Courses from './pages/Courses.jsx';
import Teachers from './pages/Teachers.jsx';
import Attendance from './pages/Attendance.jsx';
import MyAttendance from './pages/MyAttendance.jsx';
import Examinations from './pages/Examinations.jsx';
import Marks from './pages/Marks.jsx';
import MyMarks from './pages/MyMarks.jsx';
import Fees from './pages/Fees.jsx';
import MyFees from './pages/MyFees.jsx';
import Library from './pages/Library.jsx';
import Hostel from './pages/Hostel.jsx';
import Transport from './pages/Transport.jsx';
import Timetable from './pages/Timetable.jsx';
import Notices from './pages/Notices.jsx';
import Events from './pages/Events.jsx';
import Settings from './pages/Settings.jsx';
import PlaceholderPage from './components/PlaceholderPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

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
          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Departments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Teachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/examinations"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Examinations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marks"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Marks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-marks"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyMarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Fees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-fees"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyFees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']}>
                <Library />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hostel"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
                <Hostel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transport"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
                <Transport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']}>
                <Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']}>
                <Notices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']}>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;

