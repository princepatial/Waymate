import { body } from "express-validator";

export const applyAsDriverValidator = [
    body("licenseNumber")
        .trim()
        .notEmpty().withMessage("License number is required")
        .isLength({ min: 4, max: 20 }).withMessage("License number must be between 4 and 20 characters")
        .matches(/^[A-Za-z0-9-]+$/).withMessage("License number can only contain letters, numbers and hyphens"),

    body("licenseExpiry")
        .notEmpty().withMessage("License expiry date is required")
        .isISO8601().withMessage("License expiry must be a valid date (YYYY-MM-DD)")
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error("License expiry date must be in the future");
            }
            return true;
        })
];


export const addVehicleValidator = [
    body("make")
        .trim()
        .notEmpty().withMessage("Vehicle make is required")
        .isLength({ min: 2, max: 50 }).withMessage("Vehicle make must be between 2 and 50 characters"),

    body("model")
        .trim()
        .notEmpty().withMessage("Vehicle model is required")
        .isLength({ min: 1, max: 50 }).withMessage("Vehicle model must be between 1 and 50 characters"),

    body("year")
        .notEmpty().withMessage("Vehicle year is required")
        .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
        .withMessage(`Vehicle year must be between 1990 and ${new Date().getFullYear() + 1}`),

    body("color")
        .trim()
        .notEmpty().withMessage("Vehicle color is required")
        .isLength({ min: 2, max: 30 }).withMessage("Vehicle color must be between 2 and 30 characters"),

    body("plateNumber")
        .trim()
        .notEmpty().withMessage("Plate number is required")
        .isLength({ min: 2, max: 15 }).withMessage("Plate number must be between 2 and 15 characters")
        .matches(/^[A-Za-z0-9-]+$/).withMessage("Plate number can only contain letters, numbers and hyphens"),

    body("totalSeats")
        .optional()
        .isInt({ min: 2, max: 10 }).withMessage("Total seats must be between 2 and 10")
];