import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // remove extra space from beginning and end.
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    collegeDomain: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    role: {
        type: String,
        enum: ["student", "admin"],
        default: "student"
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    verificationCode: {
        type: String
    },

    verificationCodeExpires: {
        type: Date
    },
    verificationCodeLastSentAt: {
        type: Date
    },
    passwordResetCode: {
        type: String
    },

    passwordResetCodeExpires: {
        type: Date
    },

    passwordResetCodeLastSentAt: {
        type: Date
    },
    credits: {
        type: Number,
        default: 10
    },
    lockedCredits: {
        type: Number,
        default: 0
    },
    reputation: {
        type: Number,
        default: 0
    },
    bookmarkedDoubts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doubt"
    }],

    bio: {
        type: String,
        default: "",
        maxlength: 300
    },

    avatar: {
        type: String,
        default: ""
    },

    teachSkills: [{
        type: String,
        trim: true
    }],

    learnSkills: [{
        type: String,
        trim: true
    }],

    rating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    completedSessions: {
        type: Number,
        default: 0
    },

    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // automatically tells createdAt and updatedAt
});

// Indexes for Mentor Discovery and Leaderboards
userSchema.index({ teachSkills: 1 });
userSchema.index({ rating: -1, reputation: -1 });
userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

export default User;