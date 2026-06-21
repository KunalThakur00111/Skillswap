import mongoose from "mongoose";
import Session from "../models/Session.js";
import User from "../models/User.js";
import CreditTransaction from "../models/CreditTransaction.js";
import { createNotification } from "../services/notification.service.js";
import { checkTimeConflict } from "../utils/dateUtils.js";

const SESSION_CREDIT_COST = 10;

export const requestSession = async(req, res) => {
    try {
        const { mentorId, skill, message, startTime, endTime } = req.body;

        if (!mentorId || !skill || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Mentor and skill are required"
            });
        }

        const learnerIdStr = req.user._id.toString();
        const mentorIdStr = String(mentorId);

        if (learnerIdStr === mentorIdStr) {
            return res.status(400).json({
                success: false,
                message: "You cannot book a session with yourself."
            });
        }

        if (req.user.credits < SESSION_CREDIT_COST) {
            return res.status(400).json({
                success: false,
                message: `You need at least ${SESSION_CREDIT_COST} credits to request a session`
            });
        }

        const mentor = await User.findById(mentorId);

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: "Mentor not found"
            });
        }

        if (!mentor.isEmailVerified || mentor.isBlocked) {
            return res.status(400).json({
                success: false,
                message: "Mentor is not available"
            });
        }

        const mentorCanTeachSkill = mentor.teachSkills.some(
            (mentorSkill) => mentorSkill.toLowerCase() === skill.toLowerCase().trim()
        );

        if (!mentorCanTeachSkill) {
            return res.status(400).json({
                success: false,
                message: "Mentor does not teach this skill"
            });
        }

        const existingRequest = await Session.findOne({
            learner: req.user._id,
            mentor: mentorId,
            skill: skill.trim(),
            status: { $in: ["pending", "accepted"] }
        });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: "You already have an active request for this mentor and skill"
            });
        }

        const isConflict = await checkTimeConflict([req.user._id, mentorId], startTime, endTime);
        if (isConflict) {
            return res.status(409).json({
                success: false,
                message: "This time slot is no longer available."
            });
        }

        const session = await Session.create({
            learner: req.user._id,
            mentor: mentorId,
            skill: skill.trim(),
            message: message ? message.trim() : "",
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            creditCost: SESSION_CREDIT_COST
        });

        const populatedSession = await Session.findById(session._id)
            .populate("learner", "name email credits")
            .populate(
                "mentor",
                "name email teachSkills rating completedSessions credits"
            );

        await createNotification({
            recipient: mentorId,
            type: "session_request",
            title: "New Session Request",
            message: `${req.user.name} requested a session with you for ${skill.trim()}`,
            relatedEntity: session._id,
            relatedEntityType: "Session"
        });

        res.status(201).json({
            success: true,
            message: "Session request sent successfully",
            session: populatedSession
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMySessions = async(req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = { $or: [{ learner: req.user._id }, { mentor: req.user._id }] };

        const total = await Session.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const sessions = await Session.find(query)
            .populate("learner", "name avatar")
            .populate("mentor", "name avatar teachSkills rating")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            data: sessions,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const acceptSession = async(req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        if (session.mentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only mentor can accept this session"
            });
        }

        if (session.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending sessions can be accepted"
            });
        }

        const sessionCost = session.creditCost || SESSION_CREDIT_COST;

        // Conflict Detection
        const isConflict = await checkTimeConflict([session.mentor, session.learner], session.startTime, session.endTime, session._id);
        if (isConflict) {
            return res.status(409).json({
                success: false,
                message: "This time slot is no longer available."
            });
        }

        const mongoSession = await mongoose.startSession();
        let populatedSession;

        try {
            mongoSession.startTransaction();

            // Check if learner has enough credits
            const learner = await User.findById(session.learner).session(mongoSession);
            if (!learner || learner.credits < sessionCost) {
                const error = new Error("Learner does not have enough credits");
                error.statusCode = 400;
                throw error;
            }

            // Move credits to escrow
            learner.credits -= sessionCost;
            learner.lockedCredits = (learner.lockedCredits || 0) + sessionCost;
            await learner.save({ session: mongoSession });

            session.status = "accepted";
            session.acceptedAt = new Date();
            await session.save({ session: mongoSession });

            await mongoSession.commitTransaction();

            populatedSession = await Session.findById(session._id)
                .populate("learner", "name email credits")
                .populate("mentor", "name email credits");
        } catch (error) {
            await mongoSession.abortTransaction();
            throw error;
        } finally {
            mongoSession.endSession();
        }

        await createNotification({
            recipient: session.learner,
            type: "session_accepted",
            title: "Session Scheduled",
            message: `${req.user.name} accepted your session request. It is now scheduled!`,
            relatedEntity: session._id,
            relatedEntityType: "Session"
        });

        res.status(200).json({
            success: true,
            message: "Session accepted successfully",
            session: populatedSession
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const rejectSession = async(req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        if (session.mentor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only mentor can reject this session"
            });
        }

        if (session.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending sessions can be rejected"
            });
        }

        session.status = "rejected";
        session.rejectedAt = new Date();

        await session.save();

        await createNotification({
            recipient: session.learner,
            type: "session_rejected",
            title: "Session Rejected",
            message: `${req.user.name} rejected your session request for ${session.skill}`,
            relatedEntity: session._id,
            relatedEntityType: "Session"
        });

        res.status(200).json({
            success: true,
            message: "Session rejected successfully",
            session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const cancelSession = async(req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        if (session.learner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only learner can cancel this session"
            });
        }

        if (!["pending", "accepted", "scheduled"].includes(session.status)) {
            return res.status(400).json({
                success: false,
                message: "Only pending, accepted, or scheduled sessions can be cancelled"
            });
        }

        const sessionCost = session.creditCost || SESSION_CREDIT_COST;
        const mongoSession = await mongoose.startSession();
        
        try {
            mongoSession.startTransaction();
            
            // Refund escrow if credits were locked (accepted or scheduled)
            if (["accepted", "scheduled"].includes(session.status)) {
                const learner = await User.findById(session.learner).session(mongoSession);
                if (learner && learner.lockedCredits >= sessionCost) {
                    learner.lockedCredits -= sessionCost;
                    learner.credits += sessionCost;
                    await learner.save({ session: mongoSession });
                }
            }

            session.status = "cancelled";
            session.cancelledAt = new Date();
            await session.save({ session: mongoSession });
            
            await mongoSession.commitTransaction();
        } catch (error) {
            await mongoSession.abortTransaction();
            throw error;
        } finally {
            mongoSession.endSession();
        }

        await createNotification({
            recipient: session.mentor,
            type: "session_cancelled",
            title: "Session Cancelled",
            message: `${req.user.name} cancelled the session for ${session.skill}`,
            relatedEntity: session._id,
            relatedEntityType: "Session"
        });

        res.status(200).json({
            success: true,
            message: "Session cancelled successfully",
            session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const completeSession = async(req, res) => {
    const mongoSession = await mongoose.startSession();

    try {
        let completedSession;

        await mongoSession.withTransaction(async() => {
            const session = await Session.findById(req.params.id).session(
                mongoSession
            );

            if (!session) {
                const error = new Error("Session not found");
                error.statusCode = 404;
                throw error;
            }

            if (session.mentor.toString() !== req.user._id.toString()) {
                const error = new Error("Only mentor can mark this session as completed");
                error.statusCode = 403;
                throw error;
            }

            if (session.status !== "live" && session.status !== "scheduled" && session.status !== "accepted") {
                const error = new Error("Only live, scheduled, or accepted sessions can be completed");
                error.statusCode = 400;
                throw error;
            }

            session.status = "completed_pending_confirmation";
            session.completedAt = new Date();

            await session.save({ session: mongoSession });

            completedSession = session;
        });

        await createNotification({
            recipient: completedSession.learner,
            type: "session_confirmation_required",
            title: "Session Completion Confirmation Required",
            message: `${req.user.name} has marked your session as completed. Please confirm to release credits.`,
            relatedEntity: completedSession._id,
            relatedEntityType: "Session"
        });

        const populatedSession = await Session.findById(completedSession._id)
            .populate("learner", "name email credits")
            .populate("mentor", "name email credits completedSessions");

        await createNotification({
            recipient: completedSession.mentor,
            type: "session_completed",
            title: "Session Completed",
            message: `You marked the session for ${completedSession.skill} with ${populatedSession.learner.name} as completed. Awaiting confirmation.`,
            relatedEntity: completedSession._id,
            relatedEntityType: "Session"
        });

        res.status(200).json({
            success: true,
            message: "Session completed successfully. Awaiting learner confirmation.",
            session: populatedSession
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    } finally {
        await mongoSession.endSession();
    }
};

export const scheduleSession = async (req, res) => {
    try {
        const { startTime, endTime, meetingPlatform, meetingLink, timezone } = req.body;
        const session = await Session.findById(req.params.id);

        if (!session) return res.status(404).json({ success: false, message: "Session not found" });
        if (session.mentor.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Only mentor can schedule" });
        if (session.status !== "accepted" && session.status !== "rescheduled") return res.status(400).json({ success: false, message: "Cannot schedule this session" });

        // URL Validation
        if (meetingPlatform === "Google Meet" && !meetingLink.includes("meet.google.com")) {
            return res.status(400).json({ success: false, message: "Invalid Google Meet link. Must contain meet.google.com" });
        }
        if (meetingPlatform === "Zoom" && !meetingLink.includes("zoom.us")) {
            return res.status(400).json({ success: false, message: "Invalid Zoom link. Must contain zoom.us" });
        }
        if (meetingPlatform === "Microsoft Teams" && !meetingLink.includes("teams.microsoft.com")) {
            return res.status(400).json({ success: false, message: "Invalid Microsoft Teams link. Must contain teams.microsoft.com" });
        }
        if (meetingPlatform === "Other") {
            try {
                const url = new URL(meetingLink);
                if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
            } catch (e) {
                return res.status(400).json({ success: false, message: "Invalid custom URL. Must be a valid http/https link" });
            }
        }

        // Time Conflict Check
        const conflict = await checkTimeConflict([session.mentor, session.learner], startTime, endTime, session._id);
        if (conflict) {
            return res.status(409).json({ 
                success: false, 
                message: "This time slot is no longer available."
            });
        }

        session.startTime = startTime;
        session.endTime = endTime;
        session.meetingPlatform = meetingPlatform;
        session.meetingLink = meetingLink;
        session.timezone = timezone;
        session.status = "scheduled";

        await session.save();

        await createNotification({
            recipient: session.learner,
            type: "session_scheduled",
            title: "Session Scheduled",
            message: `${req.user.name} scheduled your session for ${new Date(startTime).toLocaleString()}`,
            relatedEntity: session._id,
            relatedEntityType: "Session"
        });

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const startSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) return res.status(404).json({ success: false, message: "Session not found" });
        if (session.status !== "scheduled" && session.status !== "live") return res.status(400).json({ success: false, message: "Session must be scheduled to start" });

        if (session.mentor.toString() === req.user._id.toString()) {
            session.mentorJoinedAt = new Date();
        } else if (session.learner.toString() === req.user._id.toString()) {
            session.learnerJoinedAt = new Date();
        } else {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (session.status !== "live") {
            session.status = "live";
            await createNotification({
                recipient: session.mentor.toString() === req.user._id.toString() ? session.learner : session.mentor,
                type: "session_started",
                title: "Session Started",
                message: `${req.user.name} has joined the session`,
                relatedEntity: session._id,
                relatedEntityType: "Session"
            });
        }

        await session.save();
        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const confirmSession = async (req, res) => {
    const mongoSession = await mongoose.startSession();
    try {
        let confirmedSession;
        await mongoSession.withTransaction(async () => {
            const session = await Session.findById(req.params.id).session(mongoSession);
            if (!session) throw new Error("Session not found");
            if (session.learner.toString() !== req.user._id.toString()) throw new Error("Only learner can confirm completion");
            if (session.status !== "completed_pending_confirmation") throw new Error("Session is not awaiting confirmation");

            const learner = await User.findById(session.learner).session(mongoSession);
            if (!learner || learner.lockedCredits < session.creditCost) throw new Error("Insufficient escrow credits");

            learner.lockedCredits -= session.creditCost;
            await learner.save({ session: mongoSession });

            const mentor = await User.findByIdAndUpdate(session.mentor, {
                $inc: { credits: session.creditCost, completedSessions: 1 }
            }, { new: true, session: mongoSession });

            session.status = "completed";
            session.isPaid = true;
            await session.save({ session: mongoSession });

            await CreditTransaction.create([{
                user: learner._id, session: session._id, type: "debit", reason: "session_completed_payment",
                amount: session.creditCost, balanceAfter: learner.credits, description: `Paid ${session.creditCost} credits for ${session.skill}`
            }, {
                user: mentor._id, session: session._id, type: "credit", reason: "session_completed_earning",
                amount: session.creditCost, balanceAfter: mentor.credits, description: `Earned ${session.creditCost} credits for teaching ${session.skill}`
            }], { session: mongoSession, ordered: true });

            confirmedSession = session;
        });

        await createNotification({
            recipient: confirmedSession.mentor,
            type: "credits_released",
            title: "Credits Released",
            message: `${req.user.name} confirmed the session. ${confirmedSession.creditCost} credits have been added to your balance.`,
            relatedEntity: confirmedSession._id,
            relatedEntityType: "Session"
        });

        res.status(200).json({ success: true, message: "Session confirmed" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    } finally {
        await mongoSession.endSession();
    }
};

export const disputeSession = async (req, res) => {
    try {
        const { reason } = req.body;
        const session = await Session.findById(req.params.id);

        if (!session) return res.status(404).json({ success: false, message: "Session not found" });
        if (session.learner.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Only learner can dispute" });
        if (session.status !== "completed_pending_confirmation") return res.status(400).json({ success: false, message: "Cannot dispute this session" });

        session.status = "under_review";
        session.disputeReason = reason;
        await session.save();

        await createNotification({
            recipient: session.mentor,
            type: "session_disputed",
            title: "Session Disputed",
            message: `${req.user.name} has disputed the session completion. Status changed to under review.`,
            relatedEntity: session._id,
            relatedEntityType: "Session"
        });

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reportNoShow = async (req, res) => {
    const mongoSession = await mongoose.startSession();
    try {
        const { noShowBy } = req.body; // 'mentor' or 'learner'
        let updatedSession;

        await mongoSession.withTransaction(async () => {
            const session = await Session.findById(req.params.id).session(mongoSession);

            if (!session) throw new Error("Session not found");
            if (!["scheduled", "live"].includes(session.status)) throw new Error("Invalid status for no-show");

            // Refund escrow credits
            const learner = await User.findById(session.learner).session(mongoSession);
            if (learner && learner.lockedCredits >= session.creditCost) {
                learner.lockedCredits -= session.creditCost;
                learner.credits += session.creditCost;
                await learner.save({ session: mongoSession });
            }

            session.status = "no_show";
            session.noShowBy = noShowBy;
            await session.save({ session: mongoSession });
            updatedSession = session;
        });

        res.status(200).json({ success: true, session: updatedSession });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    } finally {
        await mongoSession.endSession();
    }
};

export const getAllDisputes = async (req, res) => {
    try {
        const disputes = await Session.find({ status: "under_review" })
            .populate("learner", "name email")
            .populate("mentor", "name email")
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, count: disputes.length, disputes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resolveDispute = async (req, res) => {
    const mongoSession = await mongoose.startSession();
    try {
        const { resolution } = req.body; // 'refund' or 'release'
        if (!['refund', 'release'].includes(resolution)) {
            return res.status(400).json({ success: false, message: "Invalid resolution" });
        }

        let resolvedSession;
        await mongoSession.withTransaction(async () => {
            const session = await Session.findById(req.params.id).session(mongoSession);
            if (!session) throw new Error("Session not found");
            if (session.status !== "under_review") throw new Error("Session is not under review");

            const learner = await User.findById(session.learner).session(mongoSession);
            const mentor = await User.findById(session.mentor).session(mongoSession);

            if (resolution === 'refund') {
                if (learner && learner.lockedCredits >= session.creditCost) {
                    learner.lockedCredits -= session.creditCost;
                    learner.credits += session.creditCost;
                    await learner.save({ session: mongoSession });
                }
                session.status = "resolved_for_learner";
                session.cancelledAt = new Date();
                
                await CreditTransaction.create([{
                    user: learner._id, session: session._id, type: "credit", reason: "dispute_refund",
                    amount: session.creditCost, balanceAfter: learner.credits, description: `Refunded ${session.creditCost} credits for disputed session`
                }], { session: mongoSession, ordered: true });

            } else if (resolution === 'release') {
                if (learner && learner.lockedCredits >= session.creditCost) {
                    learner.lockedCredits -= session.creditCost;
                    await learner.save({ session: mongoSession });
                }
                
                mentor.credits += session.creditCost;
                mentor.completedSessions += 1;
                await mentor.save({ session: mongoSession });

                session.status = "resolved_for_mentor";
                session.isPaid = true;
                session.completedAt = new Date();

                await CreditTransaction.create([{
                    user: learner._id, session: session._id, type: "debit", reason: "session_completed_payment",
                    amount: session.creditCost, balanceAfter: learner.credits, description: `Paid ${session.creditCost} credits for ${session.skill}`
                }, {
                    user: mentor._id, session: session._id, type: "credit", reason: "session_completed_earning",
                    amount: session.creditCost, balanceAfter: mentor.credits, description: `Earned ${session.creditCost} credits for teaching ${session.skill}`
                }], { session: mongoSession, ordered: true });
            }

            await session.save({ session: mongoSession });
            resolvedSession = session;
        });

        await createNotification({
            recipient: resolvedSession.learner,
            type: "dispute_resolved",
            title: "Dispute Resolved",
            message: `Your dispute for session ${resolvedSession.skill} has been resolved: ${resolution.toUpperCase()}`,
            relatedEntity: resolvedSession._id,
            relatedEntityType: "Session"
        });

        await createNotification({
            recipient: resolvedSession.mentor,
            type: "dispute_resolved",
            title: "Dispute Resolved",
            message: `The dispute for session ${resolvedSession.skill} has been resolved: ${resolution.toUpperCase()}`,
            relatedEntity: resolvedSession._id,
            relatedEntityType: "Session"
        });

        res.status(200).json({ success: true, message: `Dispute resolved: ${resolution}` });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    } finally {
        await mongoSession.endSession();
    }
};