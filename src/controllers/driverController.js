import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import User from "../models/User.js";


export const applyAsDriver = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { licenseNumber, licenseExpiry } = req.body;
        const expiryDate = new Date(licenseExpiry);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isProfileComplete) {
            return res.status(400).json({
                success: false,
                message: "Please complete your profile before applying as a driver"
            });
        }

        const existingDriver = await Driver.findOne({ user: userId });
        if (existingDriver) {
            if (!existingDriver.isRejected) {
                return res.status(409).json({
                    success: false,
                    message: "You have already applied as a driver"
                });
            }
            existingDriver.isRejected = false;
            existingDriver.rejectionReason = null;
            existingDriver.isDriverActive = true;
            existingDriver.licenseNumber = licenseNumber;
            existingDriver.licenseExpiry = expiryDate;
            existingDriver.licenseImage = null;
            await existingDriver.save();

            return res.status(200).json({
                success: true,
                message: "Application resubmitted. Please re-upload your license image.",
                data: { driver: existingDriver }
            });
        }


        if (expiryDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "License expiry date must be in the future"
            });
        }

        const licenseExists = await Driver.findOne({ licenseNumber });
        if (licenseExists) {
            return res.status(409).json({
                success: false,
                message: "This license number is already registered"
            });
        }

        const driver = await Driver.create({
            user: userId,
            licenseNumber,
            licenseExpiry: expiryDate
        });

        return res.status(201).json({
            success: true,
            message: "Driver application submitted successfully. Please upload your license image.",
            data: {
                driver: {
                    id: driver._id,
                    licenseNumber: driver.licenseNumber,
                    licenseExpiry: driver.licenseExpiry,
                    isDriverVerified: driver.isDriverVerified,
                    createdAt: driver.createdAt
                }
            }
        });

    } catch (error) {
        console.error("Apply As Driver Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const uploadLicenseImage = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "License image is required"
            });
        }

        const driver = await Driver.findOne({ user: userId });
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver application not found. Please apply as driver first."
            });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const licenseImageUrl = `/uploads/license-images/${req.file.filename}`;

        driver.licenseImage = licenseImageUrl;
        await driver.save();

        return res.status(200).json({
            success: true,
            message: "License image uploaded successfully",
            data: {
                licenseImage: `${baseUrl}${licenseImageUrl}`
            }
        });

    } catch (error) {
        console.error("Upload License Image Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const addVehicle = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { make, model, year, color, plateNumber, totalSeats } = req.body;

        const driver = await Driver.findOne({ user: userId });
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver application not found. Please apply as driver first."
            });
        }

        const existingVehicle = await Vehicle.findOne({ driver: driver._id });
        if (existingVehicle) {
            return res.status(409).json({
                success: false,
                message: "You have already added a vehicle"
            });
        }

        const plateExists = await Vehicle.findOne({ plateNumber: plateNumber.toUpperCase() });
        if (plateExists) {
            return res.status(409).json({
                success: false,
                message: "This plate number is already registered"
            });
        }

        const currentYear = new Date().getFullYear();
        if (year < 1990 || year > currentYear + 1) {
            return res.status(400).json({
                success: false,
                message: `Vehicle year must be between 1990 and ${currentYear + 1}`
            });
        }

        const vehicle = await Vehicle.create({
            driver: driver._id,
            user: userId,
            make,
            model,
            year,
            color,
            plateNumber: plateNumber.toUpperCase(),
            totalSeats: totalSeats || 4
        });

        return res.status(201).json({
            success: true,
            message: "Vehicle added successfully. Please upload vehicle image.",
            data: {
                vehicle: {
                    id: vehicle._id,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    color: vehicle.color,
                    plateNumber: vehicle.plateNumber,
                    totalSeats: vehicle.totalSeats,
                    isVerified: vehicle.isVerified,
                    createdAt: vehicle.createdAt
                }
            }
        });

    } catch (error) {
        console.error("Add Vehicle Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const uploadVehicleImage = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Vehicle image is required"
            });
        }

        const driver = await Driver.findOne({ user: userId });
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver application not found"
            });
        }

        const vehicle = await Vehicle.findOne({ driver: driver._id });
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found. Please add vehicle details first."
            });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const vehicleImageUrl = `/uploads/vehicle-images/${req.file.filename}`;

        vehicle.vehicleImage = vehicleImageUrl;
        await vehicle.save();

        return res.status(200).json({
            success: true,
            message: "Vehicle image uploaded successfully",
            data: {
                vehicleImage: `${baseUrl}${vehicleImageUrl}`
            }
        });

    } catch (error) {
        console.error("Upload Vehicle Image Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const getDriverProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const driver = await Driver.findOne({ user: userId });
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver profile not found"
            });
        }

        const vehicle = await Vehicle.findOne({ driver: driver._id });

        return res.status(200).json({
            success: true,
            message: "Driver profile fetched successfully",
            data: {
                driver: {
                    id: driver._id,
                    licenseNumber: driver.licenseNumber,
                    licenseExpiry: driver.licenseExpiry,
                    licenseImage: driver.licenseImage ? `${baseUrl}${driver.licenseImage}` : null,
                    isDriverVerified: driver.isDriverVerified,
                    isDriverActive: driver.isDriverActive,
                    isAvailable: driver.isAvailable,
                    driverRating: driver.driverRating,
                    totalRidesAsDriver: driver.totalRidesAsDriver,
                    totalEarnings: driver.totalEarnings,
                    createdAt: driver.createdAt
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
                    vehicleImage: vehicle.vehicleImage ? `${baseUrl}${vehicle.vehicleImage}` : null,
                    createdAt: vehicle.createdAt
                } : null
            }
        });

    } catch (error) {
        console.error("Get Driver Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getDriverStatus = async (req, res) => {
    try {
        const userId = req.user.userId;

        const driver = await Driver.findOne({ user: userId });
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "No driver application found"
            });
        }

        const vehicle = await Vehicle.findOne({ driver: driver._id });

        let onboardingStatus = "INCOMPLETE";
        let pendingSteps = [];

        if (!driver.licenseImage) pendingSteps.push("Upload license image");
        if (!vehicle) pendingSteps.push("Add vehicle details");
        if (vehicle && !vehicle.vehicleImage) pendingSteps.push("Upload vehicle image");
        if (driver.isRejected) {
            onboardingStatus = "REJECTED";
        }
        if (pendingSteps.length === 0 && !driver.isDriverVerified) {
            onboardingStatus = "PENDING_VERIFICATION";
        } else if (driver.isDriverVerified) {
            onboardingStatus = "VERIFIED";
        }


        return res.status(200).json({
            success: true,
            message: "Driver status fetched successfully",
            data: {
                onboardingStatus,
                pendingSteps,
                isDriverVerified: driver.isDriverVerified,
                isDriverActive: driver.isDriverActive,
                isAvailable: driver.isAvailable,
                licenseUploaded: !!driver.licenseImage,
                vehicleAdded: !!vehicle,
                vehicleImageUploaded: vehicle ? !!vehicle.vehicleImage : false,
                vehicleVerified: vehicle ? vehicle.isVerified : false,
                rejectionReason: driver.isRejected ? driver.rejectionReason : null,
                isRejected: driver.isRejected
            }
        });

    } catch (error) {
        console.error("Get Driver Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};