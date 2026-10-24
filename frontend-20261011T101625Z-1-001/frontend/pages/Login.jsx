import { useState } from "react";
import "../styles/login.css";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const registrationMessage = location.state?.message || "";

  const formatStudent = (student = {}) => ({
    ...student,
    id: String(student._id ?? student.id ?? ""),
    name: student.fullName ?? student.name ?? "",
    phno: student.mobile ?? student.phno ?? "",
  });

  const saveLoginData = (userData) => {
    localStorage.removeItem("authUser");
    sessionStorage.setItem("authUser", JSON.stringify(userData));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login failed.");
        return;
      }

      if (result.role === "admin") {
        saveLoginData({
          role: "admin",
        });

        navigate("/admin_dashboard", { replace: true });
      } else if (result.role === "student" && result.student) {
        const student = formatStudent(result.student);

        if (!student.id) {
          setError("Student ID is missing from the server response.");
          return;
        }

        saveLoginData({
          role: "student",
          student,
        });

        navigate("/student_dashboard", { replace: true });
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Forgot password option will be available soon.");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Student Management</h1>
        <h2>Login</h2>

        {registrationMessage && (
          <p className="form-success" role="status">
            {registrationMessage}
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="input-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="show-button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-options">
            <button
              type="button"
              className="forgot-button"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="register">
          Don't have an account?

          <button type="button" onClick={handleRegister}>
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;