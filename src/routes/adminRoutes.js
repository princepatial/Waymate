import express from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import {
    getPendingDrivers,
    getDriverDetails,
    verifyDriver,
    rejectDriver,
    toggleDriverBlock
} from "../controllers/Admin/adminDriverController.js";

const router = express.Router();
router.use(authMiddleware, authorizeRoles("ADMIN"));


router.get("/pending-drivers", getPendingDrivers);
router.get("/driver/:driverId", getDriverDetails);
router.put("/verify-driver/:driverId", verifyDriver);
router.put("/reject-driver/:driverId", rejectDriver);
router.put("/toggle-driver/:driverId", toggleDriverBlock);

export default router;