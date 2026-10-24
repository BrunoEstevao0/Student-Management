const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const Student = require("../models/model");
const {
  validateRegistration,
  validatePassword,
  validateConfirmPassword,
} = require("../utils/validators");

// ==================== ADMIN DETAILS ====================
// For development only. Move these credentials to environment variables
// before deploying the application.
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

// ==================== GET NEXT STUDENT ID ====================
async function getNextStudentId() {
  const lastStudent = await Student.findOne()
    .sort({ _id: -1 })
    .select("_id")
    .lean();

  return lastStudent ? Number(lastStudent._id) + 1 : 1;
}

// ==================== REGISTER STUDENT ====================
router.post("/register", async (req, res) => {
  try {
    // Validate all registration fields
    const { errors, isValid } = validateRegistration(req.body);

    if (!isValid) {
      return res.status(400).json({
        message: "Please correct the highlighted fields.",
        errors,
      });
    }

    const {
      fullName,
      email,
      mobile,
      dob,
      gender,
      course,
      address,
      password,
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the email is already registered
    const existingStudent = await Student.findOne({
      email: normalizedEmail,
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Email already exists.",
        errors: {
          email: "This email is already registered.",
        },
      });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate the next student ID
    const newId = await getNextStudentId();

    const student = new Student({
      _id: newId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      dob,
      gender,
      course,
      address: address.trim(),
      password: hashedPassword,
      admissionConfirmed: false,
    });

    await student.save();

    return res.status(201).json({
      message: "Registration successful. Please login.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate email errors from MongoDB
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        message: "Email already exists.",
        errors: {
          email: "This email is already registered.",
        },
      });
    }

    return res.status(500).json({
      message: "Server error.",
    });
  }
});

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ==================== ADMIN LOGIN ====================
    if (normalizedEmail === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        return res.status(200).json({
          message: "Admin login successful.",
          role: "admin",
        });
      }

      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // ==================== STUDENT LOGIN ====================
    const student = await Student.findOne({
      email: normalizedEmail,
    });

    if (!student) {
      return res.status(404).json({
        message: "User not found. Please register first.",
      });
    }

    // Compare the entered password with the stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Never return the password or password hash
    const studentData = student.toObject();
    delete studentData.password;

    return res.status(200).json({
      message: "Student login successful.",
      role: "student",
      student: studentData,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error.",
    });
  }
});


/* ==================== FORGOT PASSWORD ==================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, mobile, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof mobile !== "string" ||
      !mobile.trim() ||
      typeof newPassword !== "string" ||
      !newPassword ||
      typeof confirmPassword !== "string" ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    // Validate password using the existing registration rules
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        message: passwordError,
        errors: {
          newPassword: passwordError,
        },
      });
    }

    // Validate password confirmation using the existing validator
    const confirmPasswordError = validateConfirmPassword(
      newPassword,
      confirmPassword
    );

    if (confirmPasswordError) {
      return res.status(400).json({
        message: confirmPasswordError,
        errors: {
          confirmPassword: confirmPasswordError,
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    // Verify registered email and mobile number
    const student = await Student.findOne({
      email: normalizedEmail,
      mobile: normalizedMobile,
    });

    if (!student) {
      return res.status(400).json({
        message: "Email and mobile number do not match our records.",
      });
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    student.password = hashedPassword;

    await student.save();

    return res.status(200).json({
      message: "Password changed successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Unable to change password. Please try again.",
    });
  }
});

module.exports = router;