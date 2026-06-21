import mongoose from "mongoose";
import dotenv from "dotenv";
import Doubt from "./src/models/Doubt.js";

dotenv.config();

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // We will simulate the aggregate query for most_upvoted
    const limit = 5;
    const skip = 0;

    const aggResult = await Doubt.aggregate([
        { $match: { isDeleted: false } },
        { $addFields: { 
            upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
            replyCount: { $size: { $ifNull: ["$replies", []] } },
            viewCount: { $size: { $ifNull: ["$viewers", []] } }
        }},
        { $sort: { upvoteCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { title: 1, upvoteCount: 1, createdAt: 1 } }
    ]);

    console.log("MOST UPVOTED ORDER:");
    console.log(JSON.stringify(aggResult, null, 2));

    const aggTrending = await Doubt.aggregate([
        { $match: { isDeleted: false } },
        { $addFields: { 
            upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
            replyCount: { $size: { $ifNull: ["$replies", []] } },
            viewCount: { $size: { $ifNull: ["$viewers", []] } }
        }},
        { $sort: { viewCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { title: 1, viewCount: 1, createdAt: 1 } }
    ]);

    console.log("\nTRENDING (MOST VIEWED) ORDER:");
    console.log(JSON.stringify(aggTrending, null, 2));

    process.exit(0);
}

runTests();
