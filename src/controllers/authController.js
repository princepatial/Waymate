import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { generateOTP } from "../utils/generateOTP.js";


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