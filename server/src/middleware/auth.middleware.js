import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select(
            "-password -verificationCode -verificationCodeExpires -verificationCodeLastSentAt -passwordResetCode -passwordResetCodeExpires -passwordResetCodeLastSentAt"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user not found"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            });
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

export const optionalProtect = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select(
            "-password -verificationCode -verificationCodeExpires -verificationCodeLastSentAt -passwordResetCode -passwordResetCodeExpires -passwordResetCodeLastSentAt"
        );

        if (user && !user.isBlocked) {
            req.user = user;
        }

        next();
    } catch (error) {
        // Ignore token errors for optional routes
        next();
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};