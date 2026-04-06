import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
    {
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true
        },

        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true
        },

        origin: {
            city: {
                type: String,
                required: true,
                trim: true
            },
            coordinates: {
                lat: { type: Number, default: null },
                lng: { type: Number, default: null }
            }
        },

        destination: {
            city: {
                type: String,
                required: true,
                trim: true
            },
            coordinates: {
                lat: { type: Number, default: null },
                lng: { type: Number, default: null }
            }
        },
        stops: [
            {
                city: {
                    type: String,
                    trim: true
                },
                coordinates: {
                    lat: { type: Number, default: null },
                    lng: { type: Number, default: null }
                }
            }
        ],

        departureDate: {
            type: Date,
            required: true
        },

        departureTime: {
            type: String,
            required: true
        },

        estimatedArrivalTime: {
            type: String,
            required: true
        },

        availableSeats: {
            type: Number,
            required: true,
            min: 1,
            max: 6
        },

        bookedSeats: {
            type: Number,
            default: 0
        },

        pricePerSeat: {
            type: Number,
            required: true,
            min: 0
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
            }
        },

        instantBooking: {
            type: Boolean,
            default: true
        },

        description: {
            type: String,
            maxlength: 300,
            default: null
        },

        status: {
            type: String,
            enum: ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"],
            default: "SCHEDULED"
        },

        cancellationReason: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

tripSchema.virtual("remainingSeats").get(function () {
    return this.availableSeats - this.bookedSeats;
});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;