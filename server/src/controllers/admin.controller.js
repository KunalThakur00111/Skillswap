import User from "../models/User.js";
import Session from "../models/Session.js";
import CreditTransaction from "../models/CreditTransaction.js";
import { createNotification } from "../services/notification.service.js";
import mongoose from "mongoose";
import Review from "../models/Review.js";

export const getAdminStats = async(req, res) => {
    try {
        const [
            totalUsers,
            verifiedUsers,
            blockedUsers,
            totalSessions,
            pendingSessions,
            completedSessions,
            totalReviews,
            totalCreditTransactions
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isEmailVerified: true }),
            User.countDocuments({ isBlocked: true }),
            Session.countDocuments(),
            Session.countDocuments({ status: "pending" }),
            Session.countDocuments({ status: "completed" }),
            Review.countDocuments(),
            CreditTransaction.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                verifiedUsers,
                blockedUsers,
                totalSessions,
                pendingSessions,
                completedSessions,
                totalReviews,
                totalCreditTransactions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllUsers = async(req, res) => {
    try {
        const { search, role, status } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { email: { $regex: search.trim(), $options: "i" } },
                { collegeDomain: { $regex: search.trim(), $options: "i" } }
            ];
        }

        if (role) {
            query.role = role;
        }

        if (status === "blocked") {
            query.isBlocked = true;
        }

        if (status === "active") {
            query.isBlocked = false;
        }

        if (status === "verified") {
            query.isEmailVerified = true;
        }

        if (status === "unverified") {
            query.isEmailVerified = false;
        }

        const users = await User.find(query)
            .select("-password -verificationCode -verificationCodeExpires -verificationCodeLastSentAt")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const blockUser = async(req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Admin cannot block their own account"
            });
        }

        const user = await User.findByIdAndUpdate(
            id, { isBlocked: true }, {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password -verificationCode -verificationCodeExpires -verificationCodeLastSentAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User blocked successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const unblockUser = async(req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id, { isBlocked: false }, {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password -verificationCode -verificationCodeExpires -verificationCodeLastSentAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User unblocked successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const makeUserAdmin = async(req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id, { role: "admin" }, {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password -verificationCode -verificationCodeExpires -verificationCodeLastSentAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User promoted to admin successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllSessionsForAdmin = async(req, res) => {
    try {
        const { status } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        const sessions = await Session.find(query)
            .populate("learner", "name email credits isBlocked")
            .populate("mentor", "name email credits completedSessions isBlocked")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: sessions.length,
            sessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const resolveDispute = async(req, res) => {
    const mongoSession = await mongoose.startSession();
    try {
        const { id } = req.params;
        const { resolution } = req.body; // 'resolved_for_learner' or 'resolved_for_mentor'

        if (!['resolved_for_learner', 'resolved_for_mentor'].includes(resolution)) {
            return res.status(400).json({ success: false, message: 'Invalid resolution status' });
        }

        let updatedSession;

        await mongoSession.withTransaction(async () => {
            const session = await Session.findById(id).session(mongoSession);
            if (!session) throw new Error('Session not found');
            if (session.status !== 'attendance_disputed' && session.status !== 'under_review') {
                throw new Error('Session is not in a disputed state');
            }

            const learner = await User.findById(session.learner).session(mongoSession);
            const mentor = await User.findById(session.mentor).session(mongoSession);

            if (resolution === 'resolved_for_learner') {
                if (learner.lockedCredits >= session.creditCost) {
                    learner.lockedCredits -= session.creditCost;
                    learner.credits += session.creditCost;
                    await learner.save({ session: mongoSession });

                    await CreditTransaction.create([{
                        user: learner._id, session: session._id, type: 'credit', reason: 'dispute_resolved',
                        amount: session.creditCost, balanceAfter: learner.credits, description: 'Dispute resolved: Credits refunded'
                    }], { session: mongoSession, ordered: true });
                }
            } else if (resolution === 'resolved_for_mentor') {
                if (learner.lockedCredits >= session.creditCost) {
                    learner.lockedCredits -= session.creditCost;
                    await learner.save({ session: mongoSession });

                    mentor.credits += session.creditCost;
                    mentor.completedSessions += 1;
                    await mentor.save({ session: mongoSession });

                    await CreditTransaction.create([{
                        user: learner._id, session: session._id, type: 'debit', reason: 'dispute_resolved',
                        amount: session.creditCost, balanceAfter: learner.credits, description: 'Dispute resolved: Payment sent to mentor'
                    }, {
                        user: mentor._id, session: session._id, type: 'credit', reason: 'dispute_resolved',
                        amount: session.creditCost, balanceAfter: mentor.credits, description: 'Dispute resolved: Payment received'
                    }], { session: mongoSession, ordered: true });
                }
            }

            session.status = resolution;
            await session.save({ session: mongoSession });
            updatedSession = session;

            await createNotification({
                recipient: session.learner, type: 'session_resolved', title: 'Dispute Resolved',
                message: `Your dispute for ${session.skill} has been resolved: ${resolution.replace(/_/g, ' ')}.`,
                relatedEntity: session._id, relatedEntityType: 'Session'
            });

            await createNotification({
                recipient: session.mentor, type: 'session_resolved', title: 'Dispute Resolved',
                message: `The dispute for ${session.skill} has been resolved: ${resolution.replace(/_/g, ' ')}.`,
                relatedEntity: session._id, relatedEntityType: 'Session'
            });
        });

        res.status(200).json({ success: true, message: 'Dispute resolved successfully', session: updatedSession });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    } finally {
        mongoSession.endSession();
    }
};
