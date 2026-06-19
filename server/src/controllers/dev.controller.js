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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};