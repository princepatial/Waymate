import express from "express";
import multer from "multer";
import {
    applyAsDriver,
    uploadLicenseImage,
    addVehicle,
    uploadVehicleImage,
    getDriverProfile,
    getDriverStatus
} from "../../controllers/driverController.js";
import {
    applyAsDriverValidator,
    addVehicleValidator
} from "../../validators/driverValidator.js";
import validate from "../../middleware/validate.js";
import { uploadLicenseImage as uploadLicenseImg, uploadVehicleImage as uploadVehicleImg } from "../../middleware/uploadMiddleware.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware, authorizeRoles("USER"));

router.post("/apply", applyAsDriverValidator, validate, applyAsDriver);

router.post("/upload-license", (req, res, next) => {
    uploadLicenseImg.single("licenseImage")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, uploadLicenseImage);

router.post("/add-vehicle", addVehicleValidator, validate, addVehicle);

router.post("/upload-vehicle-image", (req, res, next) => {
    uploadVehicleImg.single("vehicleImage")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, uploadVehicleImage);


router.get("/profile", getDriverProfile);
router.get("/status", getDriverStatus);

export default router;