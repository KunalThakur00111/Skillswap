import { Router } from "express";
import {
    signup,
    resendVerificationCode,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    changePassword,
    getMe,
    getMyStats
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} from "../validations/auth.validation.js";
import {
    authLimiter,
    loginLimiter,
    otpLimiter
} from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/resend-verification-code", otpLimiter, resendVerificationCode);
router.post("/verify-email", otpLimiter, validate(verifyEmailSchema), verifyEmail);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/forgot-password", otpLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", otpLimiter, validate(resetPasswordSchema), resetPassword);
router.patch("/change-password", protect, validate(changePasswordSchema), changePassword);
router.get("/me", protect, getMe);
router.get("/me/stats", protect, getMyStats);

export default router;