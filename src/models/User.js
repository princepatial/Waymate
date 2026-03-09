import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        profilePicture: {
            type: String,
            default: null
        },

        bio: {
            type: String,
            maxlength: 200,
            default: null
        },

        dateOfBirth: {
            type: Date,
            default: null
        },

        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "OTHER"],
            default: null
        },

        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isProfileComplete: {
            type: Boolean,
            default: false
        },

        refreshToken: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },

        preferences: {
            smoking: {
                type: Boolean,
                default: false
            },
            pets: {
                type: Boolean,
                default: false
            },
            music: {
                type: Boolean,
                default: false
            },
            chat: {
                type: String,
                enum: ["SILENT", "SOME", "TALKATIVE"],
                default: "SOME"
            }
        },

        passengerRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        totalRidesAsPassenger: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;