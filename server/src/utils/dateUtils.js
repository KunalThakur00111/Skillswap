import Session from "../models/Session.js";

/**
 * Checks if a mentor has any overlapping sessions with the proposed timeframe.
 * @param {String} mentorId - The ID of the mentor.
 * @param {Date|String} startTime - The proposed start time.
 * @param {Date|String} endTime - The proposed end time.
 * @param {String} [excludeSessionId] - Optional session ID to exclude from the check (useful for rescheduling).
 * @returns {Promise<Object|null>} - Returns the conflicting session object if a conflict exists, otherwise null.
 */
export const checkTimeConflict = async (mentorId, startTime, endTime, excludeSessionId = null) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const query = {
        mentor: mentorId,
        status: { $in: ["scheduled", "live", "accepted"] }, // Check accepted if they have locked dates? Currently accepted don't have dates. So scheduled/live.
        startTime: { $lt: end },
        endTime: { $gt: start }
    };

    if (excludeSessionId) {
        query._id = { $ne: excludeSessionId };
    }

    const conflictingSession = await Session.findOne(query);

    return conflictingSession;
};
