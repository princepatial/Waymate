import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
    {
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        make: {
            type: String,
            required: true,
            trim: true
        },

        model: {
            type: String,
            required: true,
            trim: true
        },

        year: {
            type: Number,
            required: true
        },

        color: {
            type: String,
            required: true
        },

        plateNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },

        totalSeats: {
            type: Number,
            required: true,
            default: 4
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        vehicleImage: {
            type: String,
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;