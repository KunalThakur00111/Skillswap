import mongoose from "mongoose";

const creditTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session"
    },

    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true
    },

    reason: {
        type: String,
        enum: [
            "session_completed_payment",
            "session_completed_earning",
            "signup_bonus",
            "refund", "session_refund", "session_auto_completed", "dispute_resolved", "session_completed"
        ],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    balanceAfter: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const CreditTransaction = mongoose.model(
    "CreditTransaction",
    creditTransactionSchema
);

export default CreditTransaction;
