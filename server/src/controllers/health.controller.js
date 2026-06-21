import mongoose from "mongoose";

export const getHealth = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend connected successfully"
    });
};

export const nukeDatabase = async (req, res) => {
    try {
        const db = mongoose.connection.db;

        // 1. Delete all users except kunal
        const usersCol = db.collection("users");
        const userRes = await usersCol.deleteMany({ email: { $ne: "kunalx2006@gmail.com" } });
        
        // 2. Find Kunal's ID
        const kunal = await usersCol.findOne({ email: "kunalx2006@gmail.com" });
        
        let sessionRes;
        if (kunal) {
            const sessionsCol = db.collection("sessions");
            sessionRes = await sessionsCol.deleteMany({
                $and: [
                    { mentor: { $ne: kunal._id } },
                    { learner: { $ne: kunal._id } }
                ]
            });
        } else {
            const sessionsCol = db.collection("sessions");
            sessionRes = await sessionsCol.deleteMany({});
        }

        // 3. Clear all other test data completely to avoid broken references
        const txCol = db.collection("credittransactions");
        if (txCol) await txCol.deleteMany({});
        
        const notifCol = db.collection("notifications");
        if (notifCol) await notifCol.deleteMany({});
        
        const revCol = db.collection("reviews");
        if (revCol) await revCol.deleteMany({});

        res.status(200).json({
            success: true,
            message: `Cleanup successful! Deleted ${userRes.deletedCount} extra users and ${sessionRes.deletedCount} unrelated sessions.`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};