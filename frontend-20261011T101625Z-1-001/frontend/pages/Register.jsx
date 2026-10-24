import { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";

import {
  validateName,
  validateEmail,
  validateMobile,
  validateDob,
  validateGender,
  validateCourse,
  validateAddress,
  validatePassword,
  validateConfirmPassword,
} from "../utils/validators";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/register";

const initialForm = {
  name: "",
  dob: "",
  course: "",
  gender: "",
  password: "",
  confirmPassword: "",
  email: "",
  mobile_no: "",
  address: "",
};

const COURSES = [
  "BCA",
  "MCA",
  "B.Sc IT",
  "M.Sc IT",
  "B.Tech CSE",
  "M.Tech CSE",
];

const fieldValidators = {
  name: validateName,
  dob: validateDob,
  course: validateCourse,
  gender: validateGender,
  email: validateEmail,
  mobile_no: validateMobile,
  address: validateAddress,
  password: validatePassword,
};

const FIELD_LABELS = {
  name: "Full Name",
  dob: "Date of Birth",
  course: "Course",
  gender: "Gender",
  email: "Email",
  mobile_no: "Mobile Number",
  address: "Address",
  password: "Password",
  confirmPassword: "Confirm Password",
};

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>

      <div className="password-wrapper">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
        />

        <button
          type="button"
          className="show-button"
          onClick={() => setShow((previous) => !previous)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    ok: false,
  });

  const navigate = useNavigate();

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const validateField = (name, value, currentForm = form) => {
    if (name === "confirmPassword") {
      return validateConfirmPassword(
        currentForm.password,
        value
      );
    }

    const validator = fieldValidators[name];
    return validator ? validator(value) : "";
  };

  const getInvalidFields = (validationErrors) => {
    return Object.keys(validationErrors)
      .filter((field) => validationErrors[field])
      .map((field) => FIELD_LABELS[field] || field);
  };

  const showValidationAlert = (validationErrors) => {
    const fields = getInvalidFields(validationErrors);

    if (fields.length === 0) {
      return;
    }

    window.alert(
      `Please correct the following fields:\n\n${fields
        .map((field) => `• ${field}`)
        .join("\n")}`
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...form,
      [name]: value,
    };

    setForm(updatedForm);

    setErrors((previous) => {
      const updatedErrors = {
        ...previous,
        [name]: validateField(name, value, updatedForm),
      };

      if (name === "password" && updatedForm.confirmPassword) {
        updatedErrors.confirmPassword =
          validateConfirmPassword(
            value,
            updatedForm.confirmPassword
          );
      }

      return updatedErrors;
    });

    setMessage({
      text: "",
      ok: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      text: "",
      ok: false,
    });

    const validationErrors = {};

    Object.keys(fieldValidators).forEach((field) => {
      const error = validateField(field, form[field], form);

      if (error) {
        validationErrors[field] = error;
      }
    });

    const confirmPasswordError = validateConfirmPassword(
      form.password,
      form.confirmPassword
    );

    if (confirmPasswordError) {
      validationErrors.confirmPassword = confirmPasswordError;
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showValidationAlert(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile_no.trim(),
        dob: form.dob,
        gender: form.gender,
        course: form.course,
        address: form.address.trim(),
        password: form.password,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const out = await res.json().catch(() => ({}));

      if (res.ok) {
        const successMessage =
          out.message ||
          "Registration successful! Please log in.";

        setMessage({
          text: successMessage,
          ok: true,
        });

        setForm({ ...initialForm });
        setErrors({});

        setTimeout(() => {
          navigate("/login", {
            state: {
              message: successMessage,
              email: payload.email,
            },
          });
        }, 1500);
      } else {
        const backendErrors = { ...(out.errors || {}) };

        const fieldMapping = {
          fullName: "name",
          mobile: "mobile_no",
          phone: "mobile_no",
        };

        Object.entries(fieldMapping).forEach(
          ([backendField, frontendField]) => {
            if (backendErrors[backendField]) {
              backendErrors[frontendField] =
                backendErrors[backendField];

              delete backendErrors[backendField];
            }
          }
        );

        setErrors((previous) => ({
          ...previous,
          ...backendErrors,
        }));

        const backendFields = getInvalidFields(backendErrors);

        if (backendFields.length > 0) {
          window.alert(
            `${out.message || "Registration failed."}\n\n` +
              `Please check the following fields:\n\n${backendFields
                .map((field) => `• ${field}`)
                .join("\n")}`
          );
        } else {
          window.alert(
            out.message || "Registration failed."
          );
        }

        setMessage({
          text: out.message || "Registration failed.",
          ok: false,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);

      window.alert(
        "Could not reach the server. Please try again."
      );

      setMessage({
        text: "Could not reach the server. Please try again.",
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="reg-card">
        <h1>Student Registration</h1>

        <p className="reg-sub">
          Fill in all fields to create your account.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="reg-grid">
            <div className="reg-full">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. your name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dob">Date of Birth</label>

              <input
                id="dob"
                name="dob"
                type="date"
                max={today}
                value={form.dob}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="course">Course</label>

              <select
                id="course"
                name="course"
                value={form.course}
                onChange={handleChange}
              >
                <option value="">-- Select course --</option>

                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Gender</label>

              <div className="reg-radios">
                {[
                  ["Male", "Male"],
                  ["Female", "Female"],
                  ["Other", "Other"],
                ].map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="gender"
                      value={value}
                      checked={form.gender === value}
                      onChange={handleChange}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="mobile_no">Mobile Number</label>

              <input
                id="mobile_no"
                name="mobile_no"
                type="tel"
                maxLength={10}
                placeholder="10-digit number"
                value={form.mobile_no}
                onChange={handleChange}
              />
            </div>

            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />

            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <div className="reg-full">
              <label htmlFor="address">Address</label>

              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Full address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="reg-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div
            className="reg-msg"
            style={{
              color: message.ok ? "#176B4D" : "#8B2E3C",
            }}
            role="status"
            aria-live="polite"
          >
            {message.text}
          </div>
        </form>

        <div className="reg-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="reg-link"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}