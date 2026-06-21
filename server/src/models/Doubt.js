import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
  },
  images: [{
    type: String, // Cloudinary URLs
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reply",
  }],
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reply",
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flagReason: {
    type: String,
    default: "",
  },
}, { timestamps: true });

// Text Index for fast keyword searching
doubtSchema.index({ title: "text", description: "text" });

// Standard Indexes for filtering
doubtSchema.index({ tags: 1 });
doubtSchema.index({ author: 1 });

const Doubt = mongoose.model("Doubt", doubtSchema);

export default Doubt;
