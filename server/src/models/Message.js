import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    fileUrl: {
        type: String, // Cloudinary secure_url
        default: ""
    },
    fileName: {
        type: String,
        default: ""
    },
    fileType: {
        type: String,
        enum: ["image", "pdf", "document", "other", ""],
        default: ""
    },
    fileSize: {
        type: Number, // In bytes
        default: 0
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

messageSchema.index({ session: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
