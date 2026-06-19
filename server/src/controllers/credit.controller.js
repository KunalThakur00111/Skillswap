import CreditTransaction from "../models/CreditTransaction.js";

export const getMyCreditTransactions = async(req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = { user: req.user._id };
        const total = await CreditTransaction.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const transactions = await CreditTransaction.find(query)
            .populate("session", "skill status creditCost")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};