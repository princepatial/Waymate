import { body } from "express-validator";

export const updateProfileValidator = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("phone")
        .optional()
        .trim()
        .isMobilePhone("en-IN")
        .withMessage("Please enter a valid Indian phone number"),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Bio cannot exceed 200 characters"),

    body("dateOfBirth")
        .optional()
        .isISO8601()
        .withMessage("Please enter a valid date (YYYY-MM-DD)")
        .custom((value) => {
            const age = Math.floor((new Date() - new Date(value)) / 31557600000);
            if (age < 18) {
                throw new Error("You must be at least 18 years old");
            }
            if (age > 100) {
                throw new Error("Please enter a valid date of birth");
            }
            return true;
        }),

    body("gender")
        .optional()
        .isIn(["MALE", "FEMALE", "OTHER"])
        .withMessage("Gender must be MALE, FEMALE, or OTHER")
];

export const changePasswordValidator = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters")
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
        .withMessage("New password must contain at least one letter and one number")
];


export const updatePreferencesValidator = [
    body("smoking")
        .optional()
        .isBoolean()
        .withMessage("Smoking preference must be true or false"),

    body("pets")
        .optional()
        .isBoolean()
        .withMessage("Pets preference must be true or false"),

    body("music")
        .optional()
        .isBoolean()
        .withMessage("Music preference must be true or false"),

    body("chat")
        .optional()
        .isIn(["SILENT", "SOME", "TALKATIVE"])
        .withMessage("Chat preference must be SILENT, SOME, or TALKATIVE")
];


export const deleteAccountValidator = [
    body("password")
        .notEmpty()
        .withMessage("Password is required to delete account")
];