import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    profilePicture: user.profilePicture ? `${baseUrl}${user.profilePicture}` : null,
                    bio: user.bio,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    role: user.role,
                    isVerified: user.isVerified,
                    isProfileComplete: user.isProfileComplete,
                    isActive: user.isActive,
                    preferences: user.preferences,
                    passengerRating: user.passengerRating,
                    totalRidesAsPassenger: user.totalRidesAsPassenger,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, phone, bio, dateOfBirth, gender } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({
                phone,
                _id: { $ne: userId }
            });

            if (phoneExists) {
                return res.status(409).json({
                    success: false,
                    message: "Phone number already in use by another account"
                });
            }
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;

        const hasRequiredFields = user.name && user.phone && user.dateOfBirth && user.gender && user.profilePicture;
        user.isProfileComplete = hasRequiredFields ? true : false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    isProfileComplete: user.isProfileComplete
                }
            }
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile picture is required"
            });
        }

        const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.profilePicture = profilePictureUrl;
        const hasRequiredFields = user.name && user.phone && user.dateOfBirth && user.gender && user.profilePicture;
        user.isProfileComplete = hasRequiredFields ? true : false;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            data: { profilePicture: user.profilePicture }
        });

    } catch (error) {
        console.error("Upload Profile Picture Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const updatePreferences = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { smoking, pets, music, chat } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (smoking !== undefined) user.preferences.smoking = smoking;
        if (pets !== undefined) user.preferences.pets = pets;
        if (music !== undefined) user.preferences.music = music;
        if (chat) user.preferences.chat = chat;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Preferences updated successfully",
            data: {
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error("Update Preferences Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            });
        }

        user.isActive = false;
        await user.save();

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Delete Account Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};