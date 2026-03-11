import Driver from "../../models/Driver.js";
import Vehicle from "../../models/Vehicle.js";
import User from "../../models/User.js";

export const getPendingDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({ isDriverVerified: false })
            .populate("user", "name email phone profilePicture createdAt")
            .sort({ createdAt: -1 });

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const formatted = drivers.map((driver) => {
            return {
                id: driver._id,
                licenseNumber: driver.licenseNumber,
                licenseExpiry: driver.licenseExpiry,
                licenseImage: driver.licenseImage ? `${baseUrl}${driver.licenseImage}` : null,
                isDriverVerified: driver.isDriverVerified,
                appliedAt: driver.createdAt,
                user: {
                    ...driver.user.toObject(),
                    profilePicture: driver.user.profilePicture ? `${baseUrl}${driver.user.profilePicture}` : null
                }
            };
        });

        return res.status(200).json({
            success: true,
            message: "Pending drivers fetched successfully",
            data: {
                total: formatted.length,
                drivers: formatted
            }
        });

    } catch (error) {
        console.error("Get Pending Drivers Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const getDriverDetails = async (req, res) => {
    try {
        const { driverId } = req.params;
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const driver = await Driver.findById(driverId)
            .populate("user", "-password -refreshToken -refreshTokens");

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        const vehicle = await Vehicle.findOne({ driver: driverId });

        return res.status(200).json({
            success: true,
            message: "Driver details fetched successfully",
            data: {
                driver: {
                    id: driver._id,
                    licenseNumber: driver.licenseNumber,
                    licenseExpiry: driver.licenseExpiry,
                    licenseImage: driver.licenseImage ? `${baseUrl}${driver.licenseImage}` : null,
                    isDriverVerified: driver.isDriverVerified,
                    isDriverActive: driver.isDriverActive,
                    driverRating: driver.driverRating,
                    totalRidesAsDriver: driver.totalRidesAsDriver,
                    totalEarnings: driver.totalEarnings,
                    createdAt: driver.createdAt
                },
                user: {
                    ...driver.user.toObject(),
                    profilePicture: driver.user.profilePicture ? `${baseUrl}${driver.user.profilePicture}` : null
                },
                vehicle: vehicle ? {
                    id: vehicle._id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    color: vehicle.color,
                    plateNumber: vehicle.plateNumber,
                    totalSeats: vehicle.totalSeats,
                    isVerified: vehicle.isVerified,
                    vehicleImage: vehicle.vehicleImage ? `${baseUrl}${vehicle.vehicleImage}` : null
                } : null
            }
        });

    } catch (error) {
        console.error("Get Driver Details Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const verifyDriver = async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await Driver.findById(driverId).populate("user", "name email");
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        if (driver.isDriverVerified) {
            return res.status(400).json({
                success: false,
                message: "Driver is already verified"
            });
        }

        if (driver.isRejected) {
            return res.status(400).json({
                success: false,
                message: "Cannot verify a rejected driver. Driver must reapply first."
            });
        }

        if (!driver.licenseImage) {
            return res.status(400).json({
                success: false,
                message: "Driver has not uploaded license image yet"
            });
        }

        const vehicle = await Vehicle.findOne({ driver: driverId });
        if (!vehicle) {
            return res.status(400).json({
                success: false,
                message: "Driver has not added vehicle details yet"
            });
        }

        if (!vehicle.vehicleImage) {
            return res.status(400).json({
                success: false,
                message: "Driver has not uploaded vehicle image yet"
            });
        }

        driver.isDriverVerified = true;
        driver.isDriverActive = true;
        vehicle.isVerified = true;

        await driver.save();
        await vehicle.save();

        return res.status(200).json({
            success: true,
            message: `Driver ${driver.user.name} verified successfully`,
            data: {
                driverId: driver._id,
                isDriverVerified: driver.isDriverVerified,
                isDriverActive: driver.isDriverActive,
                vehicleVerified: vehicle.isVerified
            }
        });

    } catch (error) {
        console.error("Verify Driver Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const rejectDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const driver = await Driver.findById(driverId).populate("user", "name email");
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        if (driver.isDriverVerified) {
            return res.status(400).json({
                success: false,
                message: "Cannot reject an already verified driver"
            });
        }

        driver.isDriverActive = false;
        driver.isRejected = true;
        driver.rejectionReason = reason;
        await driver.save();

        return res.status(200).json({
            success: true,
            message: `Driver ${driver.user.name} application rejected`,
            data: {
                driverId: driver._id,
                reason,
                isDriverActive: driver.isDriverActive
            }
        });

    } catch (error) {
        console.error("Reject Driver Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const toggleDriverBlock = async (req, res) => {
    try {
        const { driverId } = req.params;

        const driver = await Driver.findById(driverId).populate("user", "name email");
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found"
            });
        }

        driver.isDriverActive = !driver.isDriverActive;
        if (!driver.isDriverActive) {
            driver.isAvailable = false;
        }
        await driver.save();

        const status = driver.isDriverActive ? "unblocked" : "blocked";

        return res.status(200).json({
            success: true,
            message: `Driver ${driver.user.name} has been ${status} successfully`,
            data: {
                driverId: driver._id,
                isDriverActive: driver.isDriverActive
            }
        });

    } catch (error) {
        console.error("Toggle Driver Block Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};