import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  const savedUser =
    sessionStorage.getItem("authUser") ||
    localStorage.getItem("authUser");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "admin") {
      return <Navigate to="/admin_dashboard" replace />;
    }

    if (user.role === "student") {
      return <Navigate to="/student_dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}