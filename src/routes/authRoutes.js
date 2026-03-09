import express from "express";
import { register, verifyOTP } from "../controllers/authController.js";
import { registerValidator, verifyOTPValidator } from "../validators/authValidator.js";
import validate from "../middleware/validate.js";

const router = express.Router();


router.post("/register", registerValidator, validate, register);

router.post("/verify-otp", verifyOTPValidator, validate, verifyOTP);

export default router;