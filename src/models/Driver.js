import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        licenseNumber: {
            type: String,
            required: true,
            unique: true
        },

        licenseExpiry: {
            type: Date,
            required: true
        },

        licenseImage: {
            type: String,
            default: null
        },

        isDriverVerified: {
            type: Boolean,
            default: false
        },

        isDriverActive: {
            type: Boolean,
            default: true
        },

        isAvailable: {
            type: Boolean,
            default: false
        },

        driverRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        totalRidesAsDriver: {
            type: Number,
            default: 0
        },

        totalEarnings: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;