import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();

  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const savedLogin = sessionStorage.getItem("authUser");

      if (!savedLogin) {
        navigate("/", { replace: true });
        return;
      }

      const authUser = JSON.parse(savedLogin);

      if (authUser.role !== "student" || !authUser.student) {
        navigate("/", { replace: true });
        return;
      }

      const student = authUser.student;

      const normalizedStudent = {
        ...student,
        id: String(student._id ?? student.id ?? ""),
        name: student.fullName ?? student.name ?? "",
        phno: student.mobile ?? student.phno ?? "",
        dob: student.dob
          ? String(student.dob).slice(0, 10)
          : "",
        gender: normalizeGender(student.gender),
      };

      setCurrentStudent(normalizedStudent);
      setFormData(normalizedStudent);
    } catch (error) {
      console.error("Unable to load student profile:", error);
      alert("Unable to load your profile. Please log in again.");
      sessionStorage.removeItem("authUser");
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  function normalizeGender(gender) {
    if (typeof gender !== "string") {
      return "";
    }

    const normalized = gender.trim().toLowerCase();

    const genderMap = {
      male: "Male",
      female: "Female",
      other: "Other",
    };

    return genderMap[normalized] || "";
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const getErrorMessage = (result) => {
    const fieldNames = {
      fullName: "Name",
      name: "Name",
      mobile: "Phone",
      phno: "Phone",
      dob: "Date of Birth",
      gender: "Gender",
      course: "Course",
      address: "Address",
      email: "Email",
      password: "Password",
    };

    const errors = result.errors || result.validationErrors;

    if (errors) {
      if (Array.isArray(errors)) {
        return errors
          .map((error) => {
            if (typeof error === "string") {
              return error;
            }

            const field =
              error.field || error.path || error.param;
            const message = error.message || error.msg;

            if (field && message) {
              return `${fieldNames[field] || field}: ${message}`;
            }

            return message || JSON.stringify(error);
          })
          .join("\n");
      }

      if (typeof errors === "object") {
        return Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName = fieldNames[field] || field;
            const message = Array.isArray(messages)
              ? messages.join(", ")
              : typeof messages === "string"
                ? messages
                : JSON.stringify(messages);

            return `${fieldName}: ${message}`;
          })
          .join("\n");
      }

      if (typeof errors === "string") {
        return errors;
      }
    }

    if (result.field && result.message) {
      return `${fieldNames[result.field] || result.field}: ${result.message}`;
    }

    return (
      result.message ||
      "Unable to update student details. Please try again."
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const savedLogin = sessionStorage.getItem("authUser");

      if (!savedLogin) {
        alert("Your session has expired. Please log in again.");
        handleLogout();
        return;
      }

      const authUser = JSON.parse(savedLogin);

      if (authUser.role !== "student" || !authUser.student) {
        alert("Invalid student session. Please log in again.");
        handleLogout();
        return;
      }

      const studentId =
        authUser.student._id ?? authUser.student.id;

      if (
        studentId === undefined ||
        studentId === null ||
        studentId === ""
      ) {
        alert("Student ID is missing. Please log in again.");
        handleLogout();
        return;
      }

      const gender = normalizeGender(formData.gender);

      if (!gender) {
        alert("Gender: Please select Male, Female, or Other.");
        setSaving(false);
        return;
      }

      const payload = {
        fullName: String(formData.name ?? "").trim(),
        mobile: String(formData.phno ?? "").trim(),
        dob: formData.dob,
        gender,
        course: String(formData.course ?? "").trim(),
        address: String(formData.address ?? "").trim(),
      };

      const response = await fetch(
        `http://localhost:5000/api/students/${encodeURIComponent(
          studentId
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      let result;

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(result));
      }

      const student = result.student;

      if (!student) {
        throw new Error(
          "The server did not return the updated student details."
        );
      }

      const updatedStudent = {
        ...student,
        id: String(student._id ?? student.id ?? studentId),
        name: student.fullName ?? student.name ?? "",
        phno: student.mobile ?? student.phno ?? "",
        dob: student.dob
          ? String(student.dob).slice(0, 10)
          : "",
        gender: normalizeGender(student.gender),
      };

      const updatedAuthUser = {
        ...authUser,
        student: updatedStudent,
      };

      sessionStorage.setItem(
        "authUser",
        JSON.stringify(updatedAuthUser)
      );

      setCurrentStudent(updatedStudent);
      setFormData(updatedStudent);
      setIsEditing(false);

      alert("Student details updated successfully.");
    } catch (error) {
      console.error("Student update error:", error);
      alert(
        error.message || "Unable to save student details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    localStorage.removeItem("authUser");
    navigate("/", { replace: true });
  };

  const handleCancel = () => {
    setFormData({ ...currentStudent });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "40px", color: "#F6FAFD" }}>
        Loading your profile...
      </p>
    );
  }

  if (!currentStudent) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>

          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>

        <div className="profile-card">
          {!isEditing ? (
            <div className="profile-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={currentStudent.name || ""} readOnly />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={currentStudent.email || ""} readOnly />
              </div>

              <div className="form-group">
                <label>Course</label>
                <input type="text" value={currentStudent.course || ""} readOnly />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <input type="text" value={currentStudent.gender || ""} readOnly />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input type="text" value={currentStudent.dob || ""} readOnly />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={currentStudent.phno || ""} readOnly />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea value={currentStudent.address || ""} readOnly rows={3} />
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
                style={{ padding: "11px", borderRadius: "7px", marginTop: "10px" }}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="profile-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (Cannot be changed)</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="course">Course</label>
                <select
                  id="course"
                  name="course"
                  value={formData.course || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Course</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Sc IT">B.Sc IT</option>
                  <option value="M.Sc IT">M.Sc IT</option>
                  <option value="B.Tech CSE">B.Tech CSE</option>
                  <option value="M.Tech CSE">M.Tech CSE</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={formData.dob || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phno">Phone Number</label>
                <input
                  id="phno"
                  type="tel"
                  name="phno"
                  value={formData.phno || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              <div className="action-buttons">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;