/** Shared customer-facing auth field validators */

export function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name must be under 100 characters';
  if (!/^[a-zA-Z\s'.-]+$/.test(name)) {
    return 'Name can only contain letters, spaces, and . \' -';
  }
  return null;
}

/** Mobile number: digits, optional + prefix, 7–15 digits */
export function validatePhone(value: string): string | null {
  const phone = value.trim().replace(/[\s-]/g, '');
  if (!phone) return 'Mobile number is required';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    return 'Enter a valid mobile number';
  }
  return null;
}

export function validateEmail(value: string, required = false): string | null {
  const email = value.trim();
  if (!email) {
    return required ? 'Email is required' : null;
  }
  if (email.length > 100) return 'Email must be under 100 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email address';
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'Password must be at least 6 characters';
  if (value.length > 100) return 'Password must be under 100 characters';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Password must include at least one letter and one number';
  }
  return null;
}

export function validateLoginIdentifier(value: string): string | null {
  const id = value.trim();
  if (!id) return 'Mobile number or email is required';
  if (id.includes('@')) return validateEmail(id, true);
  return validatePhone(id);
}

export function normalizePhone(value: string): string {
  return value.trim().replace(/[\s-]/g, '');
}
