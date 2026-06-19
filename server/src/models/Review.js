import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true,
        unique: true
    },

    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        default: "",
        maxlength: 500,
        trim: true
    }
}, {
    timestamps: true
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;