import Review from "../models/Review.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { createNotification } from "../services/notification.service.js";
import { invalidateCache } from "../config/redis.js";

const updateMentorRating = async(mentorId) => {
    const result = await Review.aggregate([{
            $match: {
                mentor: mentorId
            }
        },
        {
            $group: {
                _id: "$mentor",
                averageRating: {
                    $avg: "$rating"
                },
                totalReviews: {
                    $sum: 1
                }
            }
        }
    ]);

    const ratingData = result[0];

    await User.findByIdAndUpdate(mentorId, {
        rating: ratingData ? Number(ratingData.averageRating.toFixed(1)) : 0,
        totalReviews: ratingData ? ratingData.totalReviews : 0
    });
};

export const createReview = async(req, res) => {
    try {
        const { sessionId, rating, comment } = req.body;

        if (!sessionId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Session and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        if (session.learner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only learner can review this session"
            });
        }

        if (session.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Only completed sessions can be reviewed"
            });
        }

        if (session.isReviewed) {
            return res.status(400).json({
                success: false,
                message: "This session has already been reviewed"
            });
        }

        const existingReview = await Review.findOne({
            session: session._id
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: "Review already exists for this session"
            });
        }

        const review = await Review.create({
            session: session._id,
            reviewer: req.user._id,
            mentor: session.mentor,
            rating,
            comment: comment ? comment.trim() : ""
        });

        session.isReviewed = true;
        session.reviewedAt = new Date();
        await session.save();

        await updateMentorRating(session.mentor);

        const populatedReview = await Review.findById(review._id)
            .populate("reviewer", "name email")
            .populate("mentor", "name email rating totalReviews")
            .populate("session", "skill status completedAt");

        await createNotification({
            recipient: session.mentor,
            type: "review_received",
            title: "New Review Received",
            message: `${req.user.name} left a ${rating}-star review for your ${session.skill} session.`,
            relatedEntity: review._id,
            relatedEntityType: "Review"
        });

        await invalidateCache(`reviews*`);

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review: populatedReview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMentorReviews = async(req, res) => {
    try {
        const { mentorId } = req.params;

        const reviews = await Review.find({
                mentor: mentorId
            })
            .populate("reviewer", "name")
            .populate("session", "skill completedAt")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyGivenReviews = async(req, res) => {
    try {
        const reviews = await Review.find({
                reviewer: req.user._id
            })
            .populate("mentor", "name email rating")
            .populate("session", "skill completedAt")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};