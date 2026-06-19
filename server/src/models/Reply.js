import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doubt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doubt",
    required: true,
  },
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reply",
    default: null,
  },
  content: {
    type: String,
    required: true,
  },
  images: [{
    type: String, // Cloudinary URLs
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  isAccepted: {
    type: Boolean,
    default: false,
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
}, { timestamps: true });

replySchema.index({ doubt: 1, createdAt: 1 });
replySchema.index({ parentReply: 1 });

const Reply = mongoose.model("Reply", replySchema);

export default Reply;
