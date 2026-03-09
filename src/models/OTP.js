import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        otp: {
            type: String,
            required: true
        },

        otpExpiry: {
            type: Date,
            required: true
        },

        type: {
            type: String,
            enum: [
                "EMAIL_VERIFY",
                "PHONE_VERIFY",
                "PASSWORD_RESET"
            ],
            required: true
        },

        isUsed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

otpSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;