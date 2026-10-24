import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const API_URL = "http://localhost:5000/api/students";

const COURSES = [
  "BCA",
  "MCA",
  "B.Sc IT",
  "M.Sc IT",
  "B.Tech CSE",
  "M.Tech CSE",
];

const initialForm = {
  name: "",
  dob: "",
  email: "",
  course: "",
  gender: "",
  phno: "",
  address: "",
  password: "",
  admissionConfirmed: false,
};

function formatStudent(student = {}) {
  return {
    ...student,
    id: String(student._id ?? student.id ?? ""),
    name: student.fullName ?? student.name ?? "",
    phno: student.mobile ?? student.phno ?? "",
  };
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "The request failed.");
  }
  return data;
}

function StudentCard({
  student,
  onUpdate,
  onDelete,
  onToggleAdmission,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...student });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedData({ ...student });
  }, [student]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdate(editedData);
      setIsEditing(false);
    } catch {
      // Handled by parent
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setEditedData({ ...student });
    setIsEditing(false);
  }

  const avatarPlaceholder = student.name
    ? student.name.charAt(0).toUpperCase()
    : "S";

  return (
    <article className="student-card">
      <span className={`status-badge ${student.admissionConfirmed ? "confirmed" : "pending"}`}>
        {student.admissionConfirmed ? "Confirmed" : "Pending"}
      </span>

      <div className="student-avatar">
        <span>{avatarPlaceholder}</span>
      </div>

      <div className="student-info-container">
        {!isEditing ? (
          <>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <h4 style={{ margin: 0, fontSize: "20px", color: "#0A1931" }}>
                {student.name || "Unnamed Student"}
              </h4>

              <span style={{ fontSize: "13px", color: "#4A7FA7" }}>
                (ID: {student.id || "N/A"})
              </span>
            </div>

            <p><strong>Email:</strong> {student.email || "Not available"}</p>
            <p><strong>Course:</strong> {student.course || "Not specified"}</p>
            <p><strong>Gender:</strong> {student.gender || "Not specified"}</p>
            <p><strong>DOB:</strong> {student.dob || "Not available"}</p>
            <p><strong>Phone:</strong> {student.phno || "Not available"}</p>
            <p><strong>Address:</strong> {student.address || "Not available"}</p>

            <div className="card-actions">
              <button type="button" onClick={() => setIsEditing(true)}>
                Edit
              </button>

              <button type="button" onClick={() => onDelete(student.id)} className="btn-delete">
                Delete
              </button>

              <button type="button" onClick={() => onToggleAdmission(student)} className="secondary-button">
                {student.admissionConfirmed
                  ? "Revoke Admission"
                  : "Confirm Admission"}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            <h4 style={{ margin: 0, color: "#0A1931" }}>
              Edit Student: {student.name || "Student"}
            </h4>

            <input
              type="text"
              name="name"
              value={editedData.name || ""}
              onChange={handleInputChange}
              required
              placeholder="Full Name"
            />

            <input
              type="email"
              name="email"
              value={editedData.email || ""}
              readOnly
              aria-label="Student email (cannot be edited)"
              title="Email cannot be changed here"
            />

            <select
              name="course"
              value={editedData.course || ""}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Course</option>
              {COURSES.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            <select
              name="gender"
              value={editedData.gender || ""}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="date"
              name="dob"
              value={
                editedData.dob
                  ? String(editedData.dob).slice(0, 10)
                  : ""
              }
              onChange={handleInputChange}
              required
            />

            <input
              type="tel"
              name="phno"
              value={editedData.phno || ""}
              onChange={handleInputChange}
              required
              placeholder="Phone Number"
            />

            <textarea
              name="address"
              value={editedData.address || ""}
              onChange={handleInputChange}
              required
              placeholder="Address"
            />

            <p style={{ fontSize: "12px", color: "#4A7FA7", margin: 0 }}>
              Passwords cannot be viewed or edited here.
            </p>

            <div className="card-actions">
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              <button type="button" onClick={handleCancel} disabled={isSaving} className="secondary-button">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [admissionFilter, setAdmissionFilter] = useState("All");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newStudentFormData, setNewStudentFormData] = useState({
    ...initialForm,
  });

  useEffect(() => {
    if (error) {
      window.alert(error);
      setError("");
    }
  }, [error]);

  async function fetchStudents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await readResponse(response);

      if (!Array.isArray(data)) {
        throw new Error(
          "Unexpected student data returned by the server."
        );
      }

      setStudents(data.map(formatStudent));
    } catch (err) {
      setError(err.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  function handleInputChangeNewStudent(e) {
    const { name, value, type, checked } = e.target;

    setNewStudentFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsAdding(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: newStudentFormData.name.trim(),
          email: newStudentFormData.email.trim(),
          mobile: newStudentFormData.phno.trim(),
          dob: newStudentFormData.dob,
          gender: newStudentFormData.gender,
          course: newStudentFormData.course,
          address: newStudentFormData.address.trim(),
          password: newStudentFormData.password,
          admissionConfirmed: newStudentFormData.admissionConfirmed,
        }),
      });

      const data = await readResponse(response);
      const formattedStudent = formatStudent(data.student ?? data);

      setStudents((prev) => [...prev, formattedStudent]);
      setNewStudentFormData({ ...initialForm });
      setIsAddingNew(false);
      setMessage("Student registered successfully.");
    } catch (err) {
      setError(err.message || "Unable to add student.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdateStudent(updatedStudent) {
    setError("");
    setMessage("");

    const payload = {
      fullName: String(updatedStudent.name ?? "").trim(),
      mobile: String(updatedStudent.phno ?? "").trim(),
      dob: updatedStudent.dob,
      gender: updatedStudent.gender,
      course: updatedStudent.course,
      address: String(updatedStudent.address ?? "").trim(),
    };

    const response = await fetch(
      `${API_URL}/${encodeURIComponent(updatedStudent.id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await readResponse(response);
    const formattedStudent = formatStudent(data.student ?? data);

    setStudents((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? formattedStudent : student
      )
    );

    setMessage("Student updated successfully.");
  }

  async function handleDeleteStudent(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      await readResponse(response);

      setStudents((prev) =>
        prev.filter((student) => student.id !== id)
      );

      setMessage("Student deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete student.");
    }
  }

  async function handleToggleAdmission(student) {
    setError("");

    const newStatus = !student.admissionConfirmed;

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(student.id)}/confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admissionConfirmed: newStatus,
          }),
        }
      );

      const data = await readResponse(response);
      const formattedStudent = formatStudent(data.student ?? data);

      setStudents((prev) =>
        prev.map((item) =>
          item.id === student.id ? formattedStudent : item
        )
      );
    } catch (err) {
      setError(err.message || "Unable to update admission status.");
    }
  }

  function resetForm() {
    setNewStudentFormData({ ...initialForm });
    setIsAddingNew(false);
  }

  function handleLogout() {
    localStorage.removeItem("authUser");
    sessionStorage.removeItem("authUser");
    navigate("/login", { replace: true });
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredStudents = students.filter((student) => {
    const name = String(student.name ?? "").toLowerCase();
    const id = String(student.id ?? "").toLowerCase();
    const course = String(student.course ?? "");

    const matchesSearch =
      name.includes(normalizedSearch) ||
      id.includes(normalizedSearch);

    const matchesCourse =
      selectedCourse === "All" || course === selectedCourse;

    const matchesAdmission =
      admissionFilter === "All" ||
      (admissionFilter === "Confirmed" &&
        student.admissionConfirmed === true) ||
      (admissionFilter === "Pending" &&
        student.admissionConfirmed !== true);

    return matchesSearch && matchesCourse && matchesAdmission;
  });

  function clearFilters() {
    setSearchTerm("");
    setSelectedCourse("All");
    setAdmissionFilter("All");
  }

  return (
    <div className="dashboard-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </header>

        <section className="admin-controls">
          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");

              if (isAddingNew) {
                resetForm();
              } else {
                setIsAddingNew(true);
              }
            }}
          >
            {isAddingNew ? "Close Add Form" : "Add New Student"}
          </button>

          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="control-input"
          />

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="control-select"
            aria-label="Filter students by course"
          >
            <option value="All">All Courses</option>
            {COURSES.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <select
            value={admissionFilter}
            onChange={(e) => setAdmissionFilter(e.target.value)}
            className="control-select"
            aria-label="Filter students by admission status"
          >
            <option value="All">All Admission Statuses</option>
            <option value="Confirmed">Confirmed Only</option>
            <option value="Pending">Pending Only</option>
          </select>

          <button type="button" onClick={clearFilters} className="secondary-button">
            Clear Filters
          </button>

          <button
            type="button"
            onClick={fetchStudents}
            disabled={loading}
            className="secondary-button"
          >
            {loading ? "Refreshing..." : "Refresh Students"}
          </button>
        </section>

        {message && <div className="message">{message}</div>}

        {isAddingNew && (
          <form
            onSubmit={handleAddStudent}
            style={{
              border: "1px solid #B3CFE5",
              padding: "25px",
              marginBottom: "30px",
              borderRadius: "12px",
              backgroundColor: "#F6FAFD",
              boxShadow: "0 5px 18px rgba(10, 25, 49, 0.10)",
            }}
          >
            <h3 style={{ marginBottom: "15px", color: "#0A1931" }}>New Student Registration</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={newStudentFormData.name}
                onChange={handleInputChangeNewStudent}
                required
              />

              <input
                type="date"
                name="dob"
                value={newStudentFormData.dob}
                onChange={handleInputChangeNewStudent}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newStudentFormData.email}
                onChange={handleInputChangeNewStudent}
                required
              />

              <select
                name="course"
                value={newStudentFormData.course}
                onChange={handleInputChangeNewStudent}
                required
              >
                <option value="">Select Course</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>

              <select
                name="gender"
                value={newStudentFormData.gender}
                onChange={handleInputChangeNewStudent}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="tel"
                name="phno"
                placeholder="Phone Number"
                value={newStudentFormData.phno}
                onChange={handleInputChangeNewStudent}
                required
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={newStudentFormData.address}
                onChange={handleInputChangeNewStudent}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Temporary password"
                value={newStudentFormData.password}
                onChange={handleInputChangeNewStudent}
                autoComplete="new-password"
                required
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "15px",
                color: "#1A3D63",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="admissionConfirmed"
                checked={newStudentFormData.admissionConfirmed}
                onChange={handleInputChangeNewStudent}
                style={{ width: "auto" }}
              />
              Confirm Admission
            </label>

            <button
              type="submit"
              disabled={isAdding}
              style={{ marginTop: "15px" }}
            >
              {isAdding ? "Saving..." : "Register Student"}
            </button>
          </form>
        )}

        <h2 style={{ marginBottom: "20px", color: "#0A1931" }}>
          Student Records ({filteredStudents.length})
        </h2>

        {loading && <p style={{ color: "#0A1931" }}>Loading students from the database...</p>}

        {!loading && filteredStudents.length === 0 && (
          <p style={{ color: "#4A7FA7", textAlign: "center", padding: "20px" }}>
            {students.length === 0
              ? "No students found in the database."
              : "No students match the selected search or filters."}
          </p>
        )}

        <section>
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onUpdate={handleUpdateStudent}
              onDelete={handleDeleteStudent}
              onToggleAdmission={handleToggleAdmission}
            />
          ))}
        </section>
      </div>
    </div>
  );
}