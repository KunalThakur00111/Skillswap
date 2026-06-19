import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "session_request",
                "session_accepted",
                "session_rejected",
                "session_rescheduled",
                "session_cancelled",
                "session_starting_soon",
                "session_completed",
                "review_received",
                "rating_received",
                "credit_earned",
                "credit_deducted",
                "insufficient_credit",
                "otp_sent",
                "otp_verified",
                "password_reset",
                "profile_update",
                "system",
            ],
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        relatedEntity: {
            type: mongoose.Schema.Types.ObjectId,
            // Can point to Session, Review, CreditTransaction, etc.
        },
        relatedEntityType: {
            type: String,
            enum: ["Session", "Review", "CreditTransaction", "User", ""],
            default: "",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
