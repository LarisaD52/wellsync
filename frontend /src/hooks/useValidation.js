export function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Please enter a valid email address.";
  if (!password || password.length < 4)
    errors.password = "Password must be at least 4 characters.";
  return errors;
}

export function validateSignUp({ fullName, email, password, confirm, department }) {
  const errors = {};
  if (!fullName || fullName.trim().length < 2)
    errors.fullName = "Full name is required.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email.";
  if (!password || password.length < 6)
    errors.password = "Password must be at least 6 characters.";
  if (password !== confirm)
    errors.confirm = "Passwords do not match.";
  if (!department)
    errors.department = "Please select a department.";
  return errors;
}

export function validateResource({ name, department, type, unlockCondition, rating, dateAdded }) {
  const errors = {};

  if (!name || name.trim().length < 3)
    errors.name = "Name must be at least 3 characters.";

  if (!department)
    errors.department = "Please select a department.";

  if (!type)
    errors.type = "Please select a type.";

  if (!unlockCondition || !unlockCondition.trim())
    errors.unlockCondition = "Unlock condition is required.";

  const ratingNum = parseFloat(rating);
  if (rating === undefined || rating === "" || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)
    errors.rating = "Rating must be a number between 0 and 5.";

  if (!dateAdded)
    errors.dateAdded = "Date is required.";

  return errors;
}