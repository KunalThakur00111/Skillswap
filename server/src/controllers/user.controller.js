import User from "../models/User.js";

const cleanSkills = (skills) => {
    if (!skills) {
        return [];
    }

    if (Array.isArray(skills)) {
        return skills
            .map((skill) => String(skill).trim())
            .filter((skill) => skill.length > 0);
    }

    return String(skills)
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);
};

export const getMyProfile = async(req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};

export const updateMyProfile = async(req, res) => {
    try {
        const { name, bio, avatar, teachSkills, learnSkills } = req.body;

        const updateData = {};

        if (name !== undefined) {
            updateData.name = name.trim();
        }

        if (bio !== undefined) {
            if (bio.length > 300) {
                return res.status(400).json({
                    success: false,
                    message: "Bio cannot be more than 300 characters"
                });
            }

            updateData.bio = bio.trim();
        }

        if (avatar !== undefined) {
            updateData.avatar = avatar.trim();
        }

        if (teachSkills !== undefined) {
            updateData.teachSkills = cleanSkills(teachSkills);
        }

        if (learnSkills !== undefined) {
            updateData.learnSkills = cleanSkills(learnSkills);
        }

        const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
            new: true,
            runValidators: true
        }).select("-password -verificationCode -verificationCodeExpires");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMentors = async(req, res) => {
    try {
        const { skill, search, sort, minRating } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const query = {
            _id: { $ne: req.user._id.toString() },
            isEmailVerified: true,
            isBlocked: false,
            teachSkills: { $exists: true, $ne: [] }
        };

        if (skill) {
            query.teachSkills = {
                $regex: skill.trim(),
                $options: "i"
            };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { bio: { $regex: search.trim(), $options: "i" } },
                { teachSkills: { $regex: search.trim(), $options: "i" } }
            ];
        }

        if (minRating) {
            query.rating = { $gte: Number(minRating) };
        }

        console.log("[DIAG] Final MongoDB query:", JSON.stringify(query, null, 2));

        let mentors = await User.find(query)
            .select(
                "name email bio avatar teachSkills learnSkills rating totalReviews completedSessions credits reputation createdAt"
            )
            .lean();

        console.log("[DIAG] Step 6 - Mentors returned by query:", mentors.length);

        // Calculate Ranking Score
        // Formula: (Rating * 10) + (Reputation * 5) + (Completed Sessions * 2)
        mentors = mentors.map(mentor => {
            const score = ((mentor.rating || 0) * 10) + ((mentor.reputation || 0) * 5) + ((mentor.completedSessions || 0) * 2);
            return { ...mentor, rankingScore: score };
        });

        // Apply Sorting
        if (sort === "rating") {
            mentors.sort((a, b) => b.rating - a.rating);
        } else if (sort === "sessions") {
            mentors.sort((a, b) => b.completedSessions - a.completedSessions);
        } else if (sort === "reputation") {
            mentors.sort((a, b) => b.reputation - a.reputation);
        } else if (sort === "newest") {
            mentors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            // Default: highest rankingScore (Most Active / Recommended)
            mentors.sort((a, b) => b.rankingScore - a.rankingScore);
        }
        const total = mentors.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const paginatedMentors = mentors.slice(startIndex, endIndex);

        const responsePayload = {
            success: true,
            data: paginatedMentors,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        };

        console.log("[DIAG] Step 7 - Final response length:", paginatedMentors.length);
        console.log("[DIAG] Full response payload:", JSON.stringify(responsePayload, null, 2));
        console.log("========== END DIAGNOSTIC ==========\n");

        res.status(200).json(responsePayload);
    } catch (error) {
        console.error("[DIAG] getMentors ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};