export const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    // Mật khẩu ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
};

export const validateFullName = (fullName) => {
    return fullName && fullName.trim().length > 0;
};

export const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return phoneRegex.test(phoneNumber);
};
