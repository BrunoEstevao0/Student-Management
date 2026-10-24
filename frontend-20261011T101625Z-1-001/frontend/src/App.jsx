import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import StudentDashboard from "../pages/StudentDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "../pages/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student-only routes */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route
            path="/student_dashboard"
            element={<StudentDashboard />}
          />
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route
            path="/admin_dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;