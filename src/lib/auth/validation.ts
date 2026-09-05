export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username: string) {
  return username
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._-]/g, "");
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateUsername(username: string) {
  const clean = normalizeUsername(username);
  return clean.length >= 2 && clean.length <= 50;
}

export function validatePassword(password: string) {
  return password.length >= 6 && password.length <= 128;
}

