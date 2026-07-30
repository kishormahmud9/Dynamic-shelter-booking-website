// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation functions
export function validateEmail(email) {
    if (!email) {
        return 'Please enter your email address';
    }
    if (!EMAIL_REGEX.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
}

export function validatePassword(password, minLength = 6) {
    if (!password) {
        return 'Please enter your password';
    }
    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters`;
    }
    return null;
}

export function validatePasswordsMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return null;
}
