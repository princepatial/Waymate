import express from "express";
import multer from "multer"
import {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    changePassword,
    updatePreferences,
    deleteAccount
} from "../controllers/userController.js";
import {
    updateProfileValidator,
    changePasswordValidator,
    updatePreferencesValidator,
    deleteAccountValidator
} from "../validators/userValidator.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/uploadMiddleware.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware, authorizeRoles("USER"));

router.get("/profile", getProfile);

router.put("/update-profile", updateProfileValidator, validate, updateProfile);

router.post("/upload-photo", (req, res, next) => {
    upload.single("profilePicture")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, uploadProfilePicture);

router.post("/change-password", changePasswordValidator, validate, changePassword);

router.put("/preferences", updatePreferencesValidator, validate, updatePreferences);

router.delete("/delete-account", deleteAccountValidator, validate, deleteAccount);

export default router;