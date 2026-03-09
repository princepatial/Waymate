import { body } from "express-validator";

export const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email"),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone("en-IN")
        .withMessage("Please enter a valid Indian phone number")
        .isLength({ min: 10, max: 13 })
        .withMessage("Phone number must be between 10 and 13 digits"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
        .withMessage("Password must contain at least one letter and one number")
];



export const verifyOTPValidator = [
    body("userId")
        .notEmpty()
        .withMessage("userId is required")
        .isMongoId()
        .withMessage("Invalid userId"),

    body("otp")
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits")
        .isNumeric()
        .withMessage("OTP must contain numbers only")
];