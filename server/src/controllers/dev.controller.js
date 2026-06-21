import User from "../models/User.js";

export const createTestUser = async(req, res) => {
    try {
        const testUser = await User.create({
            name: "Test Student",
            email: `test${Date.now()}@college.edu`,
            password: "temporary-password",
            collegeDomain: "college.edu",
            isEmailVerified: true,
            teachSkills: ["React", "GitHub"],
            learnSkills: ["Node.js", "MongoDB"]
        });

        res.status(201).json({
            success: true,
            message: "Test user created successfully",
            user: testUser
        });
export const mentorDiagnostic = async(req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        
        const validUsers = await User.countDocuments({
            isEmailVerified: true,
            isBlocked: false,
            "teachSkills.0": { $exists: true }
        });

        const query = {
            isEmailVerified: true,
            isBlocked: false,
            $expr: { $gt: [{ $size: "$teachSkills" }, 0] }
        };

        const rawUsers = await User.find({}).lean();
        const apiUsers = await User.find(query).select("-password -__v -resetPasswordToken -resetPasswordExpire").lean();

        const excluded = [];
        rawUsers.forEach(user => {
            const reasons = [];
            // We do not have req.user since this is public, so mock it for frontend
            if (!user.isEmailVerified) reasons.push("excluded because isEmailVerified=false");
            if (user.isBlocked) reasons.push("excluded because isBlocked=true");
            if (!user.teachSkills || user.teachSkills.length === 0) reasons.push("excluded because teachSkills empty");
            
            if (reasons.length > 0) {
                excluded.push({
                    _id: user._id,
                    name: user.name,
                    reason: reasons.join(", ")
                });
            }
        });

        res.status(200).json({
            success: true,
            totalUsers,
            validUsers,
            queryExecuted: query,
            rawArrayLength: rawUsers.length,
            apiReturnedLength: apiUsers.length,
            excludedLog: excluded
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};