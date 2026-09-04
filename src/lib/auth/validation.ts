export function normalizeEmail(
  email: string
) {
  return email
    .trim()
    .toLowerCase();
}

export function normalizeUsername(
  username: string
) {
  return username
    .trim()
    .toLowerCase();
}

export function validateEmail(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export function validateUsername(
  username: string
) {
  return /^[a-zA-Z0-9_]{3,50}$/.test(
    username
  );
}

export function validatePassword(
  password: string
) {
  return (
    password.length >= 8 &&
    password.length <= 128
  );
}
