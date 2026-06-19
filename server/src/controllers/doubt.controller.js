import mongoose from "mongoose";
import Doubt from "../models/Doubt.js";
import Reply from "../models/Reply.js";
import User from "../models/User.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { createNotification, broadcastNotification } from "../services/notification.service.js";

// Create a new doubt
export const createDoubt = async (req, res) => {
    try {
        const { title, description, tags, isAnonymous } = req.body;
        
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploaded = await uploadOnCloudinary(file.path);
                if (uploaded) {
                    imageUrls.push(uploaded.secure_url);
                }
            }
        }

        const tagArray = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

        const newDoubt = new Doubt({
            author: req.user._id,
            title,
            description,
            tags: tagArray,
            isAnonymous: isAnonymous === 'true' || isAnonymous === true,
            images: imageUrls
        });

        await newDoubt.save();

        // Notify all users about new doubt
        await broadcastNotification(
            req.user._id,
            "new_doubt",
            "New Doubt Posted!",
            `A new doubt was posted: "${title}"`,
            "Doubt",
            newDoubt._id
        );

        res.status(201).json({ success: true, doubt: newDoubt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all doubts with filtering, sorting, and pagination
export const getDoubts = async (req, res) => {
    try {
        const { page = 1, limit = 15, search, tag, sort = "newest" } = req.query;
        const query = { isDeleted: false };

        if (search) {
            query.$text = { $search: search };
        }

        if (tag) {
            query.tags = { $regex: new RegExp(tag, 'i') };
        }

        let sortOption = { createdAt: -1 };
        switch (sort) {
            case "oldest": sortOption = { createdAt: 1 }; break;
            case "most_upvoted": sortOption = { "upvotes.length": -1 }; break;
            case "most_replied": sortOption = { "replies.length": -1 }; break;
            case "most_viewed": sortOption = { "viewers.length": -1 }; break;
            case "trending":
                sortOption = { "viewers.length": -1, createdAt: -1 }; 
                break;
            default: sortOption = { createdAt: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const doubts = await Doubt.find(query)
            .populate("author", "name avatar role")
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Format for anonymous + compute views from viewers array
        const formattedDoubts = doubts.map(doubt => {
            doubt.views = (doubt.viewers || []).length;
            if (doubt.isAnonymous && (!req.user || req.user.role !== 'admin')) {
                doubt.author = { _id: doubt.author._id, name: "Anonymous Student", avatar: "default.png" };
            }
            return doubt;
        });

        const total = await Doubt.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            data: formattedDoubts,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get doubt by ID
export const getDoubtById = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id)
            .populate("author", "name avatar role")
            .populate({
                path: "replies",
                match: { isDeleted: false },
                populate: [
                    { path: "author", select: "name avatar role reputation" },
                    { path: "parentReply", select: "author content" }
                ]
            });

        if (!doubt || doubt.isDeleted) {
            return res.status(404).json({ success: false, message: "Doubt not found" });
        }

        // Track unique viewers — skip if the viewer is the author
        if (req.user && doubt.author._id.toString() !== req.user._id.toString()) {
            const alreadyViewed = doubt.viewers.some(
                viewerId => viewerId.toString() === req.user._id.toString()
            );
            if (!alreadyViewed) {
                doubt.viewers.push(req.user._id);
                await doubt.save();
            }
        }

        const obj = doubt.toObject();
        // Expose a `views` number for the frontend
        obj.views = (obj.viewers || []).length;

        if (obj.isAnonymous && (!req.user || req.user.role !== 'admin')) {
            obj.author = { _id: obj.author._id, name: "Anonymous Student", avatar: "default.png" };
        }

        res.status(200).json({ success: true, doubt: obj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update doubt
export const updateDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt || doubt.isDeleted) {
            return res.status(404).json({ success: false, message: "Doubt not found" });
        }

        if (doubt.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized to update this doubt" });
        }

        const { title, description, tags, isAnonymous } = req.body;
        if (title) doubt.title = title;
        if (description) doubt.description = description;
        if (tags) doubt.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (isAnonymous !== undefined) doubt.isAnonymous = isAnonymous === 'true' || isAnonymous === true;

        await doubt.save();

        res.status(200).json({ success: true, doubt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Soft Delete doubt
export const deleteDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt || doubt.isDeleted) {
            return res.status(404).json({ success: false, message: "Doubt not found" });
        }

        if (doubt.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized to delete this doubt" });
        }

        doubt.isDeleted = true;
        doubt.deletedAt = new Date();
        await doubt.save();

        res.status(200).json({ success: true, message: "Doubt deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle upvote
export const upvoteDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt || doubt.isDeleted) return res.status(404).json({ success: false, message: "Doubt not found" });

        if (doubt.author.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot upvote your own doubt" });
        }

        const hasUpvoted = doubt.upvotes.includes(req.user._id);

        if (hasUpvoted) {
            doubt.upvotes = doubt.upvotes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            doubt.upvotes.push(req.user._id);
        }

        await doubt.save();
        res.status(200).json({ success: true, upvotes: doubt.upvotes.length, hasUpvoted: !hasUpvoted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle Bookmark
export const bookmarkDoubt = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const doubtId = req.params.id;

        const isBookmarked = user.bookmarkedDoubts.includes(doubtId);

        if (isBookmarked) {
            user.bookmarkedDoubts = user.bookmarkedDoubts.filter(id => id.toString() !== doubtId);
        } else {
            user.bookmarkedDoubts.push(doubtId);
        }

        await user.save();
        res.status(200).json({ success: true, isBookmarked: !isBookmarked });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBookmarkedDoubts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'bookmarkedDoubts',
            match: { isDeleted: false },
            populate: { path: 'author', select: 'name avatar role' }
        });

        res.status(200).json({ success: true, doubts: user.bookmarkedDoubts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get similar doubts (same tags, excluding current doubt)
export const getSimilarDoubts = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) {
            return res.status(404).json({ success: false, message: "Doubt not found" });
        }

        const similar = await Doubt.find({
            _id: { $ne: doubt._id },
            isDeleted: false,
            tags: { $in: doubt.tags }
        })
            .populate("author", "name avatar")
            .sort({ createdAt: -1 })
            .limit(5);

        const formatted = similar.map(d => {
            const obj = d.toObject();
            obj.views = (obj.viewers || []).length;
            obj.replyCount = (obj.replies || []).length;
            return obj;
        });

        res.status(200).json({ success: true, doubts: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get real community stats
export const getCommunityStats = async (req, res) => {
    try {
        const [totalUsers, totalDoubts, totalReplies] = await Promise.all([
            User.countDocuments(),
            Doubt.countDocuments({ isDeleted: false }),
            Reply.countDocuments({ isDeleted: false })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                students: totalUsers,
                doubts: totalDoubts,
                answers: totalReplies
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
