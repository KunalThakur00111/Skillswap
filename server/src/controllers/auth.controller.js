import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";
import CreditTransaction from "../models/CreditTransaction.js";
import {
    sendVerificationEmail,
    sendPasswordResetEmail
} from "../utils/sendEmail.js";
import { createNotification } from "../services/notification.service.js";

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const getCollegeDomain = (email) => {
    const emailParts = email.split("@");

    if (emailParts.length !== 2) {
        return "";
    }

    return emailParts[1].toLowerCase().trim();
};

const isAllowedCollegeDomain = (domain) => {
    const domainsFromEnv = process.env.ALLOWED_COLLEGE_DOMAINS || "";

    const allowedDomains = domainsFromEnv
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length > 0);

    return allowedDomains.includes(domain);
};

const createToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

const createVerificationData = () => {
    return {
        verificationCode: generateVerificationCode(),
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
        verificationCodeLastSentAt: new Date()
    };
};

const createPasswordResetData = () => {
    return {
        passwordResetCode: generateVerificationCode(),
        passwordResetCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
        passwordResetCodeLastSentAt: new Date()
    };
};

const logVerificationCodeInDevelopment = (email, code, label) => {
    if (process.env.NODE_ENV !== "production") {
        console.log(`${label} for ${email}: ${code}`);
    }
};

const logPasswordResetCodeInDevelopment = (email, code) => {
    if (process.env.NODE_ENV !== "production") {
        console.log(`Password reset code for ${email}: ${code}`);
    }
};

export const signup = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const collegeDomain = getCollegeDomain(normalizedEmail);

        if (!collegeDomain || !isAllowedCollegeDomain(collegeDomain)) {
            return res.status(400).json({
                success: false,
                message: "Only approved college email addresses are allowed"
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser && existingUser.isEmailVerified) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationData = createVerificationData();

        let user;

        if (existingUser && !existingUser.isEmailVerified) {
            existingUser.name = name.trim();
            existingUser.password = hashedPassword;
            existingUser.collegeDomain = collegeDomain;
            existingUser.verificationCode = verificationData.verificationCode;
            existingUser.verificationCodeExpires =
                verificationData.verificationCodeExpires;
            existingUser.verificationCodeLastSentAt =
                verificationData.verificationCodeLastSentAt;

            user = await existingUser.save();
        } else {
            user = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                collegeDomain,
                verificationCode: verificationData.verificationCode,
                verificationCodeExpires: verificationData.verificationCodeExpires,
                verificationCodeLastSentAt: verificationData.verificationCodeLastSentAt,
                isEmailVerified: false
            });
        }

        await sendVerificationEmail(
            normalizedEmail,
            verificationData.verificationCode
        );

        logVerificationCodeInDevelopment(
            normalizedEmail,
            verificationData.verificationCode,
            "Verification code"
        );

        res.status(201).json({
            success: true,
            message: "Signup successful. Please verify your college email.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                collegeDomain: user.collegeDomain,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const resendVerificationCode = async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        if (user.verificationCodeLastSentAt) {
            const secondsSinceLastCode =
                (Date.now() - user.verificationCodeLastSentAt.getTime()) / 1000;

            if (secondsSinceLastCode < 60) {
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${Math.ceil(
            60 - secondsSinceLastCode
          )} seconds before requesting a new code`
                });
            }
        }

        const verificationData = createVerificationData();

        user.verificationCode = verificationData.verificationCode;
        user.verificationCodeExpires = verificationData.verificationCodeExpires;
        user.verificationCodeLastSentAt =
            verificationData.verificationCodeLastSentAt;

        await user.save();

        await sendVerificationEmail(
            normalizedEmail,
            verificationData.verificationCode
        );

        logVerificationCodeInDevelopment(
            normalizedEmail,
            verificationData.verificationCode,
            "New verification code"
        );

        res.status(200).json({
            success: true,
            message: "New verification code generated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyEmail = async(req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            const token = createToken(user._id);

            return res.status(200).json({
                success: true,
                message: "Email is already verified.",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    isEmailVerified: user.isEmailVerified
                }
            });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code"
            });
        }

        if (user.verificationCodeExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Verification code has expired"
            });
        }

        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.verificationCodeLastSentAt = undefined;

        await user.save();

        const token = createToken(user._id);

        await createNotification({
            recipient: user._id,
            type: "otp_verified",
            title: "Welcome to SkillSwap Campus!",
            message: "Your email has been successfully verified. You can now start requesting and hosting sessions.",
            relatedEntityType: "User",
            relatedEntity: user._id
        });

        res.status(200).json({
            success: true,
            message: "Email verified successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                credits: user.credits,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your college email before logging in"
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            });
        }

        const token = createToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                credits: user.credits,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const forgotPassword = async(req, res) => {
    try {
        console.log(`[Forgot Password] Request received for email: ${req.body.email}`);
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        console.log(`[Forgot Password] User found: ${!!user}, IsVerified: ${user ? user.isEmailVerified : 'N/A'}`);

        if (!user || !user.isEmailVerified) {
            console.log(`[Forgot Password] Early return. User doesn't exist or isn't verified.`);
            return res.status(200).json({
                success: true,
                message: "If this email exists, a password reset code has been sent"
            });
        }

        if (user.passwordResetCodeLastSentAt) {
            const secondsSinceLastCode =
                (Date.now() - user.passwordResetCodeLastSentAt.getTime()) / 1000;

            if (secondsSinceLastCode < 60) {
                console.log(`[Forgot Password] Rate limit hit for ${normalizedEmail}. Seconds since last: ${secondsSinceLastCode}`);
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${Math.ceil(
            60 - secondsSinceLastCode
          )} seconds before requesting a new reset code`
                });
            }
        }

        const resetData = createPasswordResetData();
        console.log(`[Forgot Password] OTP generated for ${normalizedEmail}`);

        user.passwordResetCode = resetData.passwordResetCode;
        user.passwordResetCodeExpires = resetData.passwordResetCodeExpires;
        user.passwordResetCodeLastSentAt = resetData.passwordResetCodeLastSentAt;

        await user.save();

        console.log(`[Forgot Password] Calling sendPasswordResetEmail...`);
        await sendPasswordResetEmail(normalizedEmail, resetData.passwordResetCode);
        console.log(`[Forgot Password] sendPasswordResetEmail completed successfully.`);

        logPasswordResetCodeInDevelopment(
            normalizedEmail,
            resetData.passwordResetCode
        );

        res.status(200).json({
            success: true,
            message: "If this email exists, a password reset code has been sent"
        });
    } catch (error) {
        console.error(`[Forgot Password] Catch block hit! Stack trace:`, error.stack);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const resetPassword = async(req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, reset code, and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.passwordResetCode || user.passwordResetCode !== code) {
            return res.status(400).json({
                success: false,
                message: "Invalid reset code"
            });
        }

        if (user.passwordResetCodeExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Reset code has expired"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetCode = undefined;
        user.passwordResetCodeExpires = undefined;
        user.passwordResetCodeLastSentAt = undefined;

        await user.save();

        const token = createToken(user._id);

        await createNotification({
            recipient: user._id,
            type: "password_reset",
            title: "Password Reset Successful",
            message: "Your password has been successfully reset.",
            relatedEntityType: "User",
            relatedEntity: user._id
        });

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                credits: user.credits,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const changePassword = async(req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        await createNotification({
            recipient: user._id,
            type: "profile_update",
            title: "Password Changed",
            message: "Your password was recently changed.",
            relatedEntityType: "User",
            relatedEntity: user._id
        });

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMe = async(req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};

export const getMyStats = async(req, res) => {
    try {
        const userId = req.user._id;

        // Fetch User directly for real-time balances
        const user = await User.findById(userId);

        // Aggregate earned credits
        const earnedResult = await CreditTransaction.aggregate([
            { $match: { user: userId, type: "credit" } },
            { $group: { _id: null, totalEarned: { $sum: "$amount" } } }
        ]);
        const totalEarned = earnedResult.length > 0 ? earnedResult[0].totalEarned : 0;

        // Aggregate spent credits
        const spentResult = await CreditTransaction.aggregate([
            { $match: { user: userId, type: "debit" } },
            { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
        ]);
        const totalSpent = spentResult.length > 0 ? spentResult[0].totalSpent : 0;

        // Count Sessions Learned
        const sessionsLearned = await Session.countDocuments({
            learner: userId,
            status: "completed"
        });

        // The mentor taught sessions is already cached in user.completedSessions but let's be sure
        const sessionsTaught = await Session.countDocuments({
            mentor: userId,
            status: "completed"
        });

        res.status(200).json({
            success: true,
            stats: {
                availableCredits: user.credits,
                lockedCredits: user.lockedCredits || 0,
                totalEarned,
                totalSpent,
                sessionsTaught,
                sessionsLearned,
                averageRating: user.rating,
                reputation: user.reputation || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};