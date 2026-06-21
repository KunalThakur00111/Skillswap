import nodemailer from "nodemailer";
import { Resend } from "resend";

// Initialize Resend
// Note: We use process.env.RESEND_API_KEY.
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

// =========================================================
// DIAGNOSTICS: Run SMTP Verify to prove Render blocks it
// =========================================================
if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    const diagnosticTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        family: 4
    });

    console.log(`\n[SMTP Diagnostics] Verifying connection to ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}...`);
    diagnosticTransporter.verify((error, success) => {
        if (error) {
            console.error("\n[SMTP Diagnostics] ❌ Connection failed!");
            console.error("This confirms the hosting provider (Render) is blocking the outbound SMTP connection.");
            console.error("Full Error Stack:");
            console.error(error.stack);
            console.error("\n=========================================================\n");
        } else {
            console.log("[SMTP Diagnostics] ✅ Connection successful! (SMTP is working in this environment)\n");
        }
    });
}

// =========================================================
// NEW EMAIL SERVICE: Using Resend
// =========================================================

export const sendVerificationEmail = async (email, code) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn(`[Email Service] RESEND_API_KEY missing. Verification code for ${email}: ${code}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "SkillSwap <onboarding@resend.dev>", // Default for Resend free tier
            to: email,
            subject: "Verify your SkillSwap Campus account",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #0f172a;">Verify your SkillSwap Campus account</h2>
            <p style="color: #334155; font-size: 15px;">Use the verification code below to complete your signup.</p>
            <div style="margin: 24px 0; padding: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
            <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2563eb; margin: 0;">${code}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
        `
        });

        if (error) {
            console.error(`[Resend Service] Error sending verification email:`, error);
        } else {
            console.log(`[Resend Service] Successfully sent verification email to ${email}. ID: ${data.id}`);
        }
    } catch (error) {
        console.error(`[Resend Service] Failed to send verification email to ${email}:`, error.message);
    }
};

export const sendPasswordResetEmail = async (email, code) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn(`[Email Service] RESEND_API_KEY missing. Reset code for ${email}: ${code}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "SkillSwap <onboarding@resend.dev>",
            to: email,
            subject: "Reset your SkillSwap Campus password",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #0f172a;">Reset your SkillSwap Campus password</h2>
            <p style="color: #334155; font-size: 15px;">Use the code below to reset your password.</p>
            <div style="margin: 24px 0; padding: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
            <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2563eb; margin: 0;">${code}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
        `
        });

        if (error) {
            console.error(`[Resend Service] Error sending reset email:`, error);
        } else {
            console.log(`[Resend Service] Successfully sent reset email to ${email}. ID: ${data.id}`);
        }
    } catch (error) {
        console.error(`[Resend Service] Failed to send reset email to ${email}:`, error.message);
    }
};

export const sendNotificationEmail = async (email, title, message) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn(`[Email Service] RESEND_API_KEY missing. Notification to ${email}: [${title}] ${message}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "SkillSwap Notifications <onboarding@resend.dev>",
            to: email,
            subject: title,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #0f172a;">${title}</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">${message}</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 32px;">You can view your notifications in the SkillSwap Campus app.</p>
        </div>
        `
        });

        if (error) {
            console.error(`[Resend Service] Error sending notification email:`, error);
        } else {
            console.log(`[Resend Service] Successfully sent notification email to ${email}. ID: ${data.id}`);
        }
    } catch (error) {
        console.error(`[Resend Service] Failed to send notification email to ${email}:`, error.message);
    }
};