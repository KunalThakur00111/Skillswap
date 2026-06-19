import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0, // 0 = Sunday
        max: 6  // 6 = Saturday
    },
    startTime: {
        type: String, // format "HH:mm" in 24h
        required: true
    },
    endTime: {
        type: String, // format "HH:mm" in 24h
        required: true
    }
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    timezone: {
        type: String,
        default: "UTC"
    },
    defaultSessionDuration: {
        type: Number,
        default: 60 // duration in minutes
    },
    schedule: [timeSlotSchema],
    exceptions: [{
        date: { type: String }, // format "YYYY-MM-DD"
        isAvailable: { type: Boolean, default: false }, // false = blocked date
        customSlots: [timeSlotSchema] // Optional: if they want custom hours on a specific date instead of fully blocked
    }],
    externalSync: {
        provider: {
            type: String,
            enum: ["google", "outlook", "apple", null],
            default: null
        },
        accessToken: String,
        refreshToken: String,
        lastSyncAt: Date
    }
}, { timestamps: true });

const Availability = mongoose.model("Availability", availabilitySchema);
export default Availability;
