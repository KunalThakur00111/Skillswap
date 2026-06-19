import User from "../models/User.js";
import Session from "../models/Session.js";
import Doubt from "../models/Doubt.js";

// GET /api/public/stats
export const getPlatformStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: "learner" });
        const totalMentors = await User.countDocuments({ teachSkills: { $exists: true, $ne: [] } });
        const totalSessions = await Session.countDocuments({ status: { $in: ["completed", "completed_pending_confirmation", "resolved_for_mentor"] } });
        const totalDoubts = await Doubt.countDocuments({ status: "resolved" });

        // Add some base numbers so the platform doesn't look completely empty on day 1
        res.status(200).json({
            success: true,
            stats: {
                students: totalStudents + 120, // baseline
                mentors: totalMentors + 15,
                sessions: totalSessions + 340,
                doubts: totalDoubts + 89
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/public/mentors/top
export const getTopMentors = async (req, res) => {
    try {
        const mentors = await User.find({
            isEmailVerified: true,
            isBlocked: false,
            teachSkills: { $exists: true, $ne: [] }
        })
        .select("name avatar teachSkills rating completedSessions reputation bio")
        .sort({ rating: -1, completedSessions: -1, reputation: -1 })
        .limit(6);

        res.status(200).json({
            success: true,
            mentors
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/public/mentors/:id
export const getMentorProfile = async (req, res) => {
    try {
        const mentor = await User.findById(req.params.id)
            .select("name avatar bio teachSkills rating completedSessions reputation credits createdAt");

        if (!mentor) {
            return res.status(404).json({ success: false, message: "Mentor not found" });
        }

        // Ideally, we fetch reviews here as well, but Session schema has 'rating' and 'review' fields.
        const reviews = await Session.find({
            mentor: mentor._id,
            rating: { $exists: true, $gt: 0 }
        })
        .select("rating review createdAt learner skill")
        .populate("learner", "name avatar")
        .sort({ createdAt: -1 })
        .limit(10);

        res.status(200).json({
            success: true,
            mentor,
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
