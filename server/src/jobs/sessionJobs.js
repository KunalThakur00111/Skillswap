import cron from 'node-cron';
import Session from '../models/Session.js';
import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import { createNotification } from '../services/notification.service.js';
import mongoose from 'mongoose';

const startSessionJobs = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // 1. Reminders for upcoming sessions
            const upcomingSessions = await Session.find({
                status: 'scheduled',
                startTime: { $gt: now }
            });

            for (const session of upcomingSessions) {
                const timeDiffMs = session.startTime - now;
                const hoursDiff = timeDiffMs / (1000 * 60 * 60);

                let reminderType = null;
                let reminderMessage = null;

                // We allow a small margin (e.g. 2 minutes) to prevent duplicate triggers
                // but since it runs every minute, checking strictly might miss if server was down.
                // A better approach is using fields like `notified24h`, but for simplicity:
                
                if (hoursDiff <= 24 && hoursDiff > 23.9) {
                    reminderType = '24h';
                    reminderMessage = 'Your session starts in 24 hours.';
                } else if (hoursDiff <= 1 && hoursDiff > 0.98) {
                    reminderType = '1h';
                    reminderMessage = 'Your session starts in 1 hour. Get ready!';
                } else if (hoursDiff <= 0.25 && hoursDiff > 0.23) {
                    reminderType = '15m';
                    reminderMessage = 'Your session starts in 15 minutes. Join now!';
                }

                if (reminderType) {
                    // Send to Learner
                    await createNotification({
                        recipient: session.learner,
                        type: `session_reminder_${reminderType}`,
                        title: `Session Reminder`,
                        message: reminderMessage,
                        relatedEntity: session._id,
                        relatedEntityType: "Session"
                    });

                    // Send to Mentor
                    await createNotification({
                        recipient: session.mentor,
                        type: `session_reminder_${reminderType}`,
                        title: `Session Reminder`,
                        message: reminderMessage,
                        relatedEntity: session._id,
                        relatedEntityType: "Session"
                    });
                }
            }

            // 2. Auto-Confirm completed sessions after 48 hours
            const autoConfirmTime = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            const pendingConfirmationSessions = await Session.find({
                status: 'completed_pending_confirmation',
                completedAt: { $lt: autoConfirmTime }
            });

            for (const session of pendingConfirmationSessions) {
                const mongoSession = await mongoose.startSession();
                try {
                    mongoSession.startTransaction();

                    const learner = await User.findById(session.learner).session(mongoSession);
                    if (learner && learner.lockedCredits >= session.creditCost) {
                        learner.lockedCredits -= session.creditCost;
                        await learner.save({ session: mongoSession });

                        const mentor = await User.findByIdAndUpdate(session.mentor, {
                            $inc: { credits: session.creditCost, completedSessions: 1 }
                        }, { new: true, session: mongoSession });

                        session.status = "completed";
                        session.isPaid = true;
                        await session.save({ session: mongoSession });

                        await CreditTransaction.create([{
                            user: learner._id, session: session._id, type: "debit", reason: "session_auto_completed",
                            amount: session.creditCost, balanceAfter: learner.credits, description: `Auto-confirmed: Paid ${session.creditCost} credits`
                        }, {
                            user: mentor._id, session: session._id, type: "credit", reason: "session_auto_completed",
                            amount: session.creditCost, balanceAfter: mentor.credits, description: `Auto-confirmed: Earned ${session.creditCost} credits`
                        }], { session: mongoSession, ordered: true });
                        
                        await createNotification({
                            recipient: session.mentor,
                            type: "credits_released",
                            title: "Credits Auto-Released",
                            message: `The session with learner was auto-confirmed after 48 hours. ${session.creditCost} credits have been added.`,
                            relatedEntity: session._id,
                            relatedEntityType: "Session"
                        });
                        
                        await createNotification({
                            recipient: session.learner,
                            type: "session_auto_confirmed",
                            title: "Session Auto-Confirmed",
                            message: `Your session was automatically confirmed after 48 hours.`,
                            relatedEntity: session._id,
                            relatedEntityType: "Session"
                        });
                    }

                    await mongoSession.commitTransaction();
                } catch (err) {
                    await mongoSession.abortTransaction();
                    console.error("Auto confirm error", err);
                } finally {
                    mongoSession.endSession();
                }
            }

        } catch (error) {
            console.error('Error in session jobs:', error);
        }
        
        try {
            const now = new Date();
            // 3. Auto-expire pending sessions after 24 hours
            const expireTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const expiredPendingSessions = await Session.find({
                status: 'pending',
                requestedAt: { $lt: expireTime }
            });

            for (const session of expiredPendingSessions) {
                session.status = 'expired';
                await session.save();

                // Notify Learner
                await createNotification({
                    recipient: session.learner,
                    type: "session_expired",
                    title: "Session Request Expired",
                    message: "Your session request was not accepted within 24 hours and has expired. The time slot is now open again.",
                    relatedEntity: session._id,
                    relatedEntityType: "Session"
                });

                // Notify Mentor
                await createNotification({
                    recipient: session.mentor,
                    type: "session_expired",
                    title: "Session Request Expired",
                    message: "A session request expired because you did not respond within 24 hours.",
                    relatedEntity: session._id,
                    relatedEntityType: "Session"
                });
            }

            // 4. Auto-cancel accepted sessions never scheduled (reached startTime)
            const acceptedStuckSessions = await Session.find({
                status: 'accepted',
                startTime: { $lt: now }
            });

            for (const session of acceptedStuckSessions) {
                const mongoSession = await mongoose.startSession();
                try {
                    mongoSession.startTransaction();

                    const learner = await User.findById(session.learner).session(mongoSession);
                    if (learner && learner.lockedCredits >= session.creditCost) {
                        learner.lockedCredits -= session.creditCost;
                        learner.credits += session.creditCost;
                        await learner.save({ session: mongoSession });
                    }

                    session.status = 'cancelled';
                    session.cancelledAt = new Date();
                    await session.save({ session: mongoSession });

                    await createNotification({
                        recipient: session.learner, type: "session_cancelled", title: "Session Auto-Cancelled",
                        message: `The mentor never scheduled the session. Your ${session.creditCost} credits have been refunded.`,
                        relatedEntity: session._id, relatedEntityType: "Session"
                    });
                    await createNotification({
                        recipient: session.mentor, type: "session_cancelled", title: "Session Auto-Cancelled",
                        message: `You did not schedule the session before its start time. It has been cancelled.`,
                        relatedEntity: session._id, relatedEntityType: "Session"
                    });

                    await mongoSession.commitTransaction();
                } catch (err) {
                    await mongoSession.abortTransaction();
                    console.error("Auto-cancel accepted error", err);
                } finally {
                    mongoSession.endSession();
                }
            }

            // 5. Auto-resolve scheduled sessions never started (endTime + 24h)
            const resolveTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const scheduledStuckSessions = await Session.find({
                status: 'scheduled',
                endTime: { $lt: resolveTime }
            });

            for (const session of scheduledStuckSessions) {
                const mongoSession = await mongoose.startSession();
                try {
                    mongoSession.startTransaction();

                    const learner = await User.findById(session.learner).session(mongoSession);
                    if (learner && learner.lockedCredits >= session.creditCost) {
                        learner.lockedCredits -= session.creditCost;
                        learner.credits += session.creditCost;
                        await learner.save({ session: mongoSession });
                    }

                    session.status = 'no_show';
                    session.noShowBy = 'both';
                    await session.save({ session: mongoSession });

                    await createNotification({
                        recipient: session.learner, type: "session_missed", title: "Session Missed",
                        message: `The scheduled session was never started. Your ${session.creditCost} credits have been refunded.`,
                        relatedEntity: session._id, relatedEntityType: "Session"
                    });
                    await createNotification({
                        recipient: session.mentor, type: "session_missed", title: "Session Missed",
                        message: `The scheduled session was never started. It has been marked as a no-show.`,
                        relatedEntity: session._id, relatedEntityType: "Session"
                    });

                    await mongoSession.commitTransaction();
                } catch (err) {
                    await mongoSession.abortTransaction();
                    console.error("Auto-resolve scheduled error", err);
                } finally {
                    mongoSession.endSession();
                }
            }

            // 6. Auto-complete forgotten live sessions (endTime + 2h)
            const autoCompleteTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            const liveStuckSessions = await Session.find({
                status: 'live',
                endTime: { $lt: autoCompleteTime }
            });

            for (const session of liveStuckSessions) {
                session.status = 'completed_pending_confirmation';
                session.completedAt = new Date();
                await session.save();

                await createNotification({
                    recipient: session.learner, type: "session_action_required", title: "Please Confirm Session",
                    message: `Your session was marked completed automatically. Please confirm it to release credits to the mentor.`,
                    relatedEntity: session._id, relatedEntityType: "Session"
                });
            }

        } catch (error) {
            console.error('Error in auto-expire job:', error);
        }
    });
};

export default startSessionJobs;
