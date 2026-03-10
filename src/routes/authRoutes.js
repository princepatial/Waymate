import express from "express";
import {
    register,
    verifyOTP,
    login,
    refreshToken,
    logout,
    logoutAllDevices
} from "../controllers/authController.js";
import {
    registerValidator,
    verifyOTPValidator,
    loginValidator
} from "../validators/authValidator.js";
import validate from "../middleware/validate.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/register", registerValidator, validate, register);

router.post("/verify-otp", verifyOTPValidator, validate, verifyOTP);

router.post("/login", loginValidator, validate, login);

router.post("/refresh-token", refreshToken);

router.post("/logout", authMiddleware, logout);
router.post("/logout-all", authMiddleware, logoutAllDevices);

export default router;