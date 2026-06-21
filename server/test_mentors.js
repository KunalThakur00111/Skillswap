import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected successfully.");

        console.log("\n--- 1. Total users count in MongoDB ---");
        const totalUsers = await User.countDocuments();
        console.log(`Total Users: ${totalUsers}`);

        console.log("\n--- 2. Total users with verified/not blocked/has skills ---");
        const validUsers = await User.countDocuments({
            isEmailVerified: true,
            isBlocked: false,
            "teachSkills.0": { $exists: true }
        });
        console.log(`Valid Users: ${validUsers}`);

        console.log("\n--- 3. Exact MongoDB query executed by GET /api/users/mentors ---");
        const query = {
            isEmailVerified: true,
            isBlocked: false,
            $expr: { $gt: [{ $size: "$teachSkills" }, 0] }
        };
        console.log(JSON.stringify(query, null, 2));

        console.log("\n--- 4. Raw array returned by MongoDB BEFORE any filtering ---");
        const rawUsers = await User.find({}).lean();
        console.log(`Raw Users length: ${rawUsers.length}`);

        console.log("\n--- 5. Array returned by the API response ---");
        const apiUsers = await User.find(query).select("-password -__v -resetPasswordToken -resetPasswordExpire").lean();
        console.log(`API Users length: ${apiUsers.length}`);

        console.log("\n--- 8. Print for every excluded user ---");
        // Mock current user ID to test "excluded because current user"
        const mockCurrentUserId = rawUsers.length > 0 ? rawUsers[0]._id.toString() : "none";

        rawUsers.forEach(user => {
            const reasons = [];
            if (user._id.toString() === mockCurrentUserId) reasons.push("excluded because current user (MOCK)");
            if (!user.isEmailVerified) reasons.push("excluded because isEmailVerified=false");
            if (user.isBlocked) reasons.push("excluded because isBlocked=true");
            if (!user.teachSkills || user.teachSkills.length === 0) reasons.push("excluded because teachSkills empty");
            // Assuming frontend filter requires rating > 0 or something? The user mentioned "excluded because frontend filter"
            // We'll just list backend exclusions here.
            
            if (reasons.length > 0) {
                console.log(`ID: ${user._id} | Name: ${user.name} | Excluded for: ${reasons.join(", ")}`);
            } else {
                console.log(`ID: ${user._id} | Name: ${user.name} | INCLUDED`);
            }
        });

        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err.message);
        process.exit(1);
    }
}

run();
