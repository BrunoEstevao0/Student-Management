export function validateName(name) {
  if (!name?.trim()) {
    return "Name is required.";
  }

  if (name.trim().length < 2) {
    return "Name must contain at least 2 characters.";
  }

  return "";
}

export function validateEmail(email) {
  if (!email?.trim()) {
    return "Email is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return "Enter a valid email address.";
  }

  return "";
}

export function validateMobile(mobile) {
  if (!mobile?.trim()) {
    return "Mobile number is required.";
  }

  if (!/^\d{10}$/.test(mobile.trim())) {
    return "Enter a valid 10-digit Indian mobile number.";
  }

  return "";
}

export function validateDob(dob) {
  if (!dob) {
    return "Date of birth is required.";
  }

  const date = new Date(dob);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(date.getTime()) || date >= today) {
    return "Enter a valid date in the past.";
  }

  return "";
}

export function validateGender(gender) {
  if (!gender?.trim()) {
    return "Please select a gender.";
  }

  return "";
}

export function validateCourse(course) {
  if (!course?.trim()) {
    return "Please select a course.";
  }

  return "";
}

export function validateAddress(address) {
  if (!address?.trim()) {
    return "Address is required.";
  }

  if (address.trim().length < 5) {
    return "Address must contain at least 5 characters.";
  }

  return "";
}

export function validatePassword(password) {
  if (!password) {
    return "Password is required.";
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

  if (!passwordRegex.test(password)) {
    return "Password must have at least 8 characters, including uppercase, lowercase, a number and a special character.";
  }

  return "";
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

// Validate the entire registration form
export function validateRegistration(data) {
  const errors = {
    name: validateName(data.name),
    email: validateEmail(data.email),
    mobile_no: validateMobile(data.mobile_no),
    dob: validateDob(data.dob),
    gender: validateGender(data.gender),
    course: validateCourse(data.course),
    address: validateAddress(data.address),
    password: validatePassword(data.password),
    confirmPassword: validateConfirmPassword(
      data.password,
      data.confirmPassword
    )
  };

  // Remove fields that have no errors
  Object.keys(errors).forEach((field) => {
    if (!errors[field]) {
      delete errors[field];
    }
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}