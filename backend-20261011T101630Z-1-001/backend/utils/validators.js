
function validateName(name) {
  if (typeof name !== "string" || !name.trim()) {
    return "Name is required.";
  }

  if (name.trim().length < 2) {
    return "Name must contain at least 2 characters.";
  }

  return "";
}

function validateEmail(email) {
  if (typeof email !== "string" || !email.trim()) {
    return "Email is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return "Enter a valid email address.";
  }

  return "";
}

function validateMobile(mobile) {
  if (typeof mobile !== "string" || !mobile.trim()) {
    return "Mobile number is required.";
  }

  if (!/^\d{10}$/.test(mobile.trim())) {
    return "Enter a valid 10-digit Indian mobile number.";
  }

  return "";
}

function validateDob(dob) {
  if (typeof dob !== "string" || !dob.trim()) {
    return "Date of birth is required.";
  }

  const date = new Date(dob);

  // Ensure the input is a real YYYY-MM-DD date
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dob
  ) {
    return "Enter a valid date of birth.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date >= today) {
    return "Date of birth must be in the past.";
  }

  return "";
}

function validateGender(gender) {
  const allowedGenders = ["Male", "Female", "Other"];

  if (typeof gender !== "string" || !gender.trim()) {
    return "Please select a valid gender.";
  }

  const normalizedGender =
    gender.trim().toLowerCase();

  const validGender = allowedGenders.find(
    (item) => item.toLowerCase() === normalizedGender
  );

  if (!validGender) {
    return "Please select Male, Female, or Other.";
  }

  return "";
}

function validateCourse(course) {
  const allowedCourses = [
    "BCA",
    "MCA",
    "B.Sc IT",
    "M.Sc IT",
    "B.Tech CSE",
    "M.Tech CSE",
  ];

  if (
    typeof course !== "string" ||
    !allowedCourses.includes(course.trim())
  ) {
    return "Please select a valid course.";
  }

  return "";
}

function validateAddress(address) {
  if (typeof address !== "string" || !address.trim()) {
    return "Address is required.";
  }

  if (address.trim().length < 5) {
    return "Address must contain at least 5 characters.";
  }

  return "";
}

function validatePassword(password) {
  if (typeof password !== "string" || !password) {
    return "Password is required.";
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

  if (!passwordRegex.test(password)) {
    return (
      "Password must contain at least 8 characters, " +
      "including uppercase, lowercase, a number and a special character."
    );
  }

  return "";
}

// Used when confirmation is supplied, such as in a registration form
function validateConfirmPassword(password, confirmPassword) {
  if (
    typeof confirmPassword !== "string" ||
    !confirmPassword
  ) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

// Validate all registration fields together
function validateRegistration(data = {}) {
  const errors = {};

  const checks = {
    fullName: validateName(data.fullName),
    email: validateEmail(data.email),
    mobile: validateMobile(data.mobile),
    dob: validateDob(data.dob),
    gender: validateGender(data.gender),
    course: validateCourse(data.course),
    address: validateAddress(data.address),
    password: validatePassword(data.password),
  };

  for (const [field, error] of Object.entries(checks)) {
    if (error) {
      errors[field] = error;
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

module.exports = {
  validateName,
  validateEmail,
  validateMobile,
  validateDob,
  validateGender,
  validateCourse,
  validateAddress,
  validatePassword,
  validateConfirmPassword,
  validateRegistration,
};