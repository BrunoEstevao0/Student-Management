const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const Student = require("../models/model");

const {
  validateRegistration,
  validateName,
  validateMobile,
  validateDob,
  validateGender,
  validateCourse,
  validateAddress,
} = require("../utils/validators");

// ==================== GET NEXT STUDENT ID ====================
async function getNextStudentId() {
  const lastStudent = await Student.findOne()
    .sort({ _id: -1 })
    .select("_id")
    .lean();

  return lastStudent ? Number(lastStudent._id) + 1 : 1;
}

// ==================== VALIDATE STUDENT ID ====================
function parseStudentId(idParam, res) {
  const id = Number(idParam);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({
      message: "Invalid student ID.",
    });

    return null;
  }

  return id;
}

// ==================== GET ALL STUDENTS ====================
router.get("/", async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password")
      .lean();

    return res.status(200).json(students);
  } catch (error) {
    console.error("Get all students error:", error);

    return res.status(500).json({
      message: "Unable to load students.",
    });
  }
});

// ==================== GET ONE STUDENT ====================
router.get("/:id", async (req, res) => {
  try {
    const id = parseStudentId(req.params.id, res);

    if (id === null) return;

    const student = await Student.findOne({
      _id: id,
    })
      .select("-password")
      .lean();

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error("Get student error:", error);

    return res.status(500).json({
      message: "Unable to load student.",
    });
  }
});

// ==================== ADD STUDENT ====================
router.post("/", async (req, res) => {
  try {
    // Validate all required registration fields
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

    // Check for an existing email
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

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

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

    const studentData = student.toObject();
    delete studentData.password;

    return res.status(201).json({
      message: "Student added successfully.",
      student: studentData,
    });
  } catch (error) {
    console.error("Add student error:", error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        message: "Email already exists.",
        errors: {
          email: "This email is already registered.",
        },
      });
    }

    return res.status(500).json({
      message: "Unable to add student.",
    });
  }
});

// ==================== EDIT STUDENT ====================
router.put("/:id", async (req, res) => {
  try {
    const id = parseStudentId(req.params.id, res);

    if (id === null) return;

    // Only these fields can be updated through this route
    const fieldValidators = {
      fullName: validateName,
      mobile: validateMobile,
      dob: validateDob,
      gender: validateGender,
      course: validateCourse,
      address: validateAddress,
    };

    const updates = {};
    const errors = {};

    // Validate fields that were actually provided
    for (const [field, validator] of Object.entries(fieldValidators)) {
      if (req.body[field] !== undefined) {
        const error = validator(req.body[field]);

        if (error) {
          errors[field] = error;
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Please correct the highlighted fields.",
        errors,
      });
    }

    // Do not accept an empty update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Please provide at least one valid field to update.",
      });
    }

    // Trim text fields
    if (updates.fullName !== undefined) {
      updates.fullName = updates.fullName.trim();
    }

    if (updates.mobile !== undefined) {
      updates.mobile = updates.mobile.trim();
    }

    if (updates.address !== undefined) {
      updates.address = updates.address.trim();
    }

    const student = await Student.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      message: "Student updated successfully.",
      student,
    });
  } catch (error) {
    console.error("Update student error:", error);

    return res.status(500).json({
      message: "Unable to update student.",
    });
  }
});

// ==================== DELETE STUDENT ====================
router.delete("/:id", async (req, res) => {
  try {
    const id = parseStudentId(req.params.id, res);

    if (id === null) return;

    const student = await Student.findOneAndDelete({
      _id: id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("Delete student error:", error);

    return res.status(500).json({
      message: "Unable to delete student.",
    });
  }
});

// ==================== CONFIRM ADMISSION ====================
router.patch("/:id/confirm", async (req, res) => {
  try {
    const id = parseStudentId(req.params.id, res);
    if (id === null) return;

    const { admissionConfirmed } = req.body;

    if (typeof admissionConfirmed !== "boolean") {
      return res.status(400).json({
        message: "admissionConfirmed must be true or false.",
      });
    }

    const student = await Student.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          admissionConfirmed,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      message: admissionConfirmed
        ? "Admission confirmed successfully."
        : "Admission revoked successfully.",
      student,
    });
  } catch (error) {
    console.error("Update admission error:", error);

    return res.status(500).json({
      message: "Unable to update admission status.",
    });
  }
});

module.exports = router;
