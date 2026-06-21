import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    learner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    skill: {
        type: String,
        required: true,
        trim: true
    },

    message: {
        type: String,
        default: "",
        maxlength: 500
    },

    scheduledDate: {
        type: Date
    },

    startTime: {
        type: Date
    },

    endTime: {
        type: Date
    },

    timezone: {
        type: String,
        trim: true
    },

    meetingLink: {
        type: String,
        trim: true
    },

    meetingPlatform: {
        type: String,
        enum: ["Google Meet", "Zoom", "Microsoft Teams", "Other"],
        trim: true
    },

    mentorJoinedAt: {
        type: Date
    },

    learnerJoinedAt: {
        type: Date
    },

    mentorLeftAt: {
        type: Date
    },

    learnerLeftAt: {
        type: Date
    },

    noShowBy: {
        type: String,
        enum: ["mentor", "learner", "both"]
    },

    disputeReason: {
        type: String,
        maxlength: 500
    },

    creditCost: {
        type: Number,
        default: 10
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    isReviewed: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "scheduled", "live", "completed_pending_confirmation", "completed", "under_review", "resolved_for_learner", "resolved_for_mentor", "no_show", "rescheduled", "expired", "rejected", "cancelled_by_learner", "cancelled_by_mentor", "attendance_disputed"],
        default: "pending"
    },

    requestedAt: {
        type: Date,
        default: Date.now
    },

    acceptedAt: {
        type: Date
    },

    completedAt: {
        type: Date
    },

    cancelledAt: {
        type: Date
    },

    cancelledBy: {
        type: String,
        enum: ["learner", "mentor"]
    },

    cancellationReason: {
        type: String,
        minlength: 10,
        maxlength: 500
    },

    rejectedAt: {
        type: Date
    },

    reviewedAt: {
        type: Date
    },

    notes: {
        mentorNotes: { type: String, default: "" },
        aiSummary: { type: String, default: "" },
        keyConcepts: [{ type: String }],
        actionItems: [{ type: String }],
        resources: [{
            title: String,
            url: String
        }],
        deliverables: [{ type: String }]
    },

    timeline: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        description: { type: String }
    }]
}, {
    timestamps: true
});

// Indexes for Dashboards and Scheduling
sessionSchema.index({ mentor: 1, status: 1 });
sessionSchema.index({ learner: 1, status: 1 });
sessionSchema.index({ startTime: 1 });
sessionSchema.index({ status: 1, startTime: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;