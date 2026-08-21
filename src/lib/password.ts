export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters long"
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }
  return null
}
