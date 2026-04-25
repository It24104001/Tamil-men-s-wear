// Email validation regex
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

// Phone number validation (exactly 10 digits)
export const validatePhone = (phone) => {
  const re = /^\d{10}$/;
  return re.test(String(phone).trim());
};

// General empty field check
export const isNotEmpty = (value) => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

// Password length validation (min 6 characters)
export const validatePassword = (password) => {
  return String(password).length >= 6;
};
