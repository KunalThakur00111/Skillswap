import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://skillswap_user:Kunal%40252006@cluster0.au6znx9.mongodb.net/test?retryWrites=true&w=majority";

async function clearDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB Atlas.");

        const db = mongoose.connection.db;

        // 1. Delete all users except kunal
        const usersCol = db.collection("users");
        const userRes = await usersCol.deleteMany({ email: { $ne: "kunalx2006@gmail.com" } });
        console.log(`Deleted ${userRes.deletedCount} extra users.`);

        // 2. Find Kunal's ID
        const kunal = await usersCol.findOne({ email: "kunalx2006@gmail.com" });
        
        if (kunal) {
            const sessionsCol = db.collection("sessions");
            const sessionRes = await sessionsCol.deleteMany({
                $and: [
                    { mentor: { $ne: kunal._id } },
                    { learner: { $ne: kunal._id } }
                ]
            });
            console.log(`Deleted ${sessionRes.deletedCount} unrelated sessions.`);
        } else {
            const sessionsCol = db.collection("sessions");
            const sessionRes = await sessionsCol.deleteMany({});
            console.log(`Deleted ${sessionRes.deletedCount} sessions (Kunal not found).`);
        }

        // 3. Clear all other test data completely to avoid broken references
        const txCol = db.collection("credittransactions");
        if (txCol) await txCol.deleteMany({});
        
        const notifCol = db.collection("notifications");
        if (notifCol) await notifCol.deleteMany({});
        
        const revCol = db.collection("reviews");
        if (revCol) await revCol.deleteMany({});

        console.log("Cleaned up transactions, notifications, and reviews.");
        console.log("Database cleanup complete!");

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Failed to clean database:", err);
        process.exit(1);
    }
}

clearDatabase();
