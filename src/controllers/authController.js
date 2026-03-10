import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { generateOTP } from "../utils/generateOTP.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils.js";


export const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            if (existingEmail.isVerified) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered"
                });
            }

            await User.findByIdAndDelete(existingEmail._id);
            await OTP.deleteMany({ user: existingEmail._id });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            if (existingPhone.isVerified) {
                return res.status(409).json({
                    success: false,
                    message: "Phone number is already registered"
                });
            }

            await User.findByIdAndDelete(existingPhone._id);
            await OTP.deleteMany({ user: existingPhone._id });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword
        });

        const otpCode = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.create({
            user: user._id,
            otp: otpCode,
            otpExpiry,
            type: "EMAIL_VERIFY"
        });

        await sendOTPEmail(user.email, user.name, otpCode);

        return res.status(201).json({
            success: true,
            message: "Registration successful! OTP sent to your email.",
            data: {
                userId: user._id,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const otpRecord = await OTP.findOne({
            user: userId,
            type: "EMAIL_VERIFY",
            isUsed: false
        });

        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                message: "OTP not found or already used. Please request a new OTP."
            });
        }

        if (otpRecord.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }


        otpRecord.isUsed = true;
        await otpRecord.save();

        await User.findByIdAndUpdate(userId, { isVerified: true });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now login."
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};




export const login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        let query = {};

        if (email && phone) {
            query = { $or: [{ email }, { phone }] };
        } else if (email) {
            query = { email };
        } else if (phone) {
            query = { phone };
        }

        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please check your credentials."
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first. Check your inbox for OTP.",
                requiresVerification: true,
                userId: user._id
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact support."
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password. Please try again."
            });
        }

        const accessToken = generateAccessToken(user._id, user.role);

        const refreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push({
            token: refreshToken,
            device: req.headers['user-agent'] || 'Unknown'
        });

        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            // sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found. Please login again."
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token. Please login again."
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please login again."
            });
        }

        const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);

        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token. Please login again."
            });
        }

        if (!user.isActive || !user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Account is not active. Please contact support."
            });
        }

        const newAccessToken = generateAccessToken(user._id);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        console.error("Refresh Token Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const logout = async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentRefreshToken = req.cookies.refreshToken;

        await User.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: { token: currentRefreshToken } }
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
            //   sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const logoutAllDevices = async (req, res) => {
    try {
        const userId = req.user.userId;

        await User.findByIdAndUpdate(userId, {
            refreshTokens: []
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out from all devices successfully"
        });

    } catch (error) {
        console.error("Logout All Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};