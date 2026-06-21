import Reply from "../models/Reply.js";
import Doubt from "../models/Doubt.js";
import User from "../models/User.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { createNotification } from "../services/notification.service.js";

export const createReply = async (req, res) => {
    try {
        const { content, parentReplyId } = req.body;
        const doubtId = req.params.doubtId;

        const doubt = await Doubt.findById(doubtId);
        if (!doubt || doubt.isDeleted) return res.status(404).json({ success: false, message: "Doubt not found" });

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploaded = await uploadOnCloudinary(file.path);
                if (uploaded) imageUrls.push(uploaded.secure_url);
            }
        }

        const newReply = new Reply({
            author: req.user._id,
            doubt: doubtId,
            content,
            images: imageUrls,
            parentReply: parentReplyId || null
        });

        await newReply.save();

        doubt.replies.push(newReply._id);
        await doubt.save();

        // Notification Logic
        if (parentReplyId) {
            const parent = await Reply.findById(parentReplyId);
            if (parent && parent.author.toString() !== req.user._id.toString()) {
                await createNotification({
                    recipient: parent.author,
                    type: "reply_received",
                    title: "New reply to your comment",
                    message: `${req.user.name} replied to your comment.`,
                    relatedEntityType: "Doubt",
                    relatedEntity: doubtId
                });
            }
        } else if (doubt.author.toString() !== req.user._id.toString()) {
            await createNotification({
                recipient: doubt.author,
                type: "reply_received",
                title: "New reply on your doubt",
                message: `${req.user.name} replied to your doubt.`,
                relatedEntityType: "Doubt",
                relatedEntity: doubtId
            });
        }

        res.status(201).json({ success: true, reply: newReply });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);
        if (!reply || reply.isDeleted) return res.status(404).json({ success: false, message: "Reply not found" });

        if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (req.body.content) reply.content = req.body.content;
        await reply.save();

        res.status(200).json({ success: true, reply });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);
        if (!reply || reply.isDeleted) return res.status(404).json({ success: false, message: "Reply not found" });

        if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        reply.isDeleted = true;
        reply.deletedAt = new Date();
        await reply.save();

        res.status(200).json({ success: true, message: "Reply deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const upvoteReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);
        if (!reply || reply.isDeleted) return res.status(404).json({ success: false, message: "Reply not found" });

        if (reply.author.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot upvote your own reply" });
        }

        const hasUpvoted = reply.upvotes.includes(req.user._id);

        if (hasUpvoted) {
            reply.upvotes = reply.upvotes.filter(id => id.toString() !== req.user._id.toString());
            await User.findByIdAndUpdate(reply.author, { $inc: { reputation: -5 } });
        } else {
            reply.upvotes.push(req.user._id);
            await User.findByIdAndUpdate(reply.author, { $inc: { reputation: 5 } });
            
            // Remove from downvotes if mutually exclusive
            const hasDownvoted = reply.downvotes.includes(req.user._id);
            if (hasDownvoted) {
                reply.downvotes = reply.downvotes.filter(id => id.toString() !== req.user._id.toString());
                // Restore the deducted downvote reputation penalty (-2)
                await User.findByIdAndUpdate(reply.author, { $inc: { reputation: 2 } });
            }
        }

        await reply.save();
        res.status(200).json({ success: true, upvotes: reply.upvotes.length, downvotes: reply.downvotes.length, hasUpvoted: !hasUpvoted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const downvoteReply = async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);
        if (!reply || reply.isDeleted) return res.status(404).json({ success: false, message: "Reply not found" });

        if (reply.author.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot downvote your own reply" });
        }

        const hasDownvoted = reply.downvotes.includes(req.user._id);

        if (hasDownvoted) {
            reply.downvotes = reply.downvotes.filter(id => id.toString() !== req.user._id.toString());
            await User.findByIdAndUpdate(reply.author, { $inc: { reputation: 2 } });
        } else {
            reply.downvotes.push(req.user._id);
            await User.findByIdAndUpdate(reply.author, { $inc: { reputation: -2 } });

            // Remove from upvotes if mutually exclusive
            const hasUpvoted = reply.upvotes.includes(req.user._id);
            if (hasUpvoted) {
                reply.upvotes = reply.upvotes.filter(id => id.toString() !== req.user._id.toString());
                // Remove the upvote reputation bonus (+5)
                await User.findByIdAndUpdate(reply.author, { $inc: { reputation: -5 } });
            }
        }

        await reply.save();
        res.status(200).json({ success: true, upvotes: reply.upvotes.length, downvotes: reply.downvotes.length, hasDownvoted: !hasDownvoted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const acceptReply = async (req, res) => {
    try {
        const doubtId = req.params.doubtId;
        const replyId = req.params.replyId;

        const doubt = await Doubt.findById(doubtId);
        const reply = await Reply.findById(replyId);

        if (!doubt || doubt.isDeleted || !reply || reply.isDeleted) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        if (doubt.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Only the author can accept an answer" });
        }

        if (reply.author.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot accept your own answer" });
        }

        // If there was an already accepted answer, remove its status and reputation
        if (doubt.acceptedAnswer) {
            const previousReply = await Reply.findById(doubt.acceptedAnswer);
            if (previousReply) {
                previousReply.isAccepted = false;
                await previousReply.save();
                await User.findByIdAndUpdate(previousReply.author, { $inc: { reputation: -15 } });
            }
        }

        reply.isAccepted = true;
        await reply.save();

        doubt.acceptedAnswer = reply._id;
        await doubt.save();

        // Add reputation
        await User.findByIdAndUpdate(reply.author, { $inc: { reputation: 15 } });

        await createNotification({
            recipient: reply.author,
            type: "accepted_answer",
            title: "Your answer was accepted!",
            message: "Congratulations! Your reply was marked as the accepted answer. (+15 Reputation)",
            relatedEntityType: "Doubt",
            relatedEntity: doubtId
        });

        res.status(200).json({ success: true, message: "Answer accepted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
