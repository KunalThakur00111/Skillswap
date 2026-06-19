import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMessages, uploadChatFile, updateNotes } from "../controllers/chat.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router({ mergeParams: true }); // Important: to access :id from parent route

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for local temporary storage before Cloudinary
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format"), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get("/messages", protect, getMessages);
router.post("/messages/upload", protect, upload.single("file"), uploadChatFile);
router.put("/notes", protect, updateNotes);

export default router;
