import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminClasses from './pages/admin/Classes';
import AdminSubjects from './pages/admin/Subjects';
import AdminAssignments from './pages/admin/Assignments';
import CreateAssignment from './pages/admin/CreateAssignment';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherSubmissions from './pages/teacher/Submissions';
import StudentDashboard from './pages/student/Dashboard';
import StudentSubjects from './pages/student/Subjects';
import StudentAssignments from './pages/student/Assignments';
import AssignmentView from './pages/AssignmentView';
import LoadingSpinner from './components/LoadingSpinner';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        {/* Admin Routes */}
        {user.role === 'admin' && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/classes" element={<AdminClasses />} />
            <Route path="/admin/subjects" element={<AdminSubjects />} />
            <Route path="/admin/assignments" element={<AdminAssignments />} />
            <Route path="/admin/assignments/create" element={<CreateAssignment />} />
          </>
        )}

        {/* Teacher Routes */}
        {user.role === 'teacher' && (
          <>
            <Route path="/" element={<TeacherDashboard />} />
            <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
          </>
        )}

        {/* Student Routes */}
        {user.role === 'student' && (
          <>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/student/subjects" element={<StudentSubjects />} />
            <Route path="/student/subjects/:subjectId/assignments" element={<StudentAssignments />} />
          </>
        )}

        {/* Shared Routes */}
        <Route path="/assignments/:id" element={<AssignmentView />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;