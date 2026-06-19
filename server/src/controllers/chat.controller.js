import Message from "../models/Message.js";
import Session from "../models/Session.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getIO } from "../socket.js";

// GET /api/sessions/:id/chat
export const getMessages = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify user is part of the session
        const session = await Session.findById(id);
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        if (session.learner.toString() !== req.user._id.toString() && session.mentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to view this chat" });
        }

        const messages = await Message.find({ session: id })
            .populate("sender", "name avatar")
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/sessions/:id/chat/upload
export const uploadChatFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

        const session = await Session.findById(id);
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        if (session.learner.toString() !== req.user._id.toString() && session.mentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to upload to this chat" });
        }

        if (session.status === "pending" || session.status === "requested") {
            return res.status(403).json({ success: false, message: "File sharing is disabled until the session is scheduled." });
        }

        const uploaded = await uploadOnCloudinary(file.path, "chat-files");
        if (!uploaded) return res.status(500).json({ success: false, message: "File upload failed" });

        // Determine file type
        let fileType = "other";
        if (file.mimetype.startsWith("image/")) fileType = "image";
        else if (file.mimetype === "application/pdf") fileType = "pdf";
        else if (file.mimetype.includes("word")) fileType = "document";

        const message = new Message({
            session: id,
            sender: req.user._id,
            content: req.body.content || "Shared a file",
            fileUrl: uploaded.secure_url,
            fileName: file.originalname,
            fileType,
            fileSize: file.size
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id).populate("sender", "name avatar");

        // Broadcast the file message via socket
        const io = getIO();
        io.to(id).emit("receive_message", populatedMessage);

        res.status(201).json({ success: true, message: populatedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/sessions/:id/notes
export const updateNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { mentorNotes, keyConcepts, actionItems } = req.body;

        const session = await Session.findById(id);
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        if (session.mentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the mentor can update session notes" });
        }

        session.notes.mentorNotes = mentorNotes || session.notes.mentorNotes;
        if (keyConcepts) session.notes.keyConcepts = keyConcepts;
        if (actionItems) session.notes.actionItems = actionItems;

        // Also add a timeline event if this is the first time notes are added
        const hasNotesTimeline = session.timeline.some(t => t.status === "notes_added");
        if (!hasNotesTimeline && mentorNotes) {
            session.timeline.push({
                status: "notes_added",
                description: "Mentor added session notes."
            });
        }

        await session.save();

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
