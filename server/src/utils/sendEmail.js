import nodemailer from "nodemailer";

const isEmailConfigured = () => {
    return (
        process.env.EMAIL_HOST &&
        process.env.EMAIL_PORT &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        process.env.EMAIL_FROM
    );
};

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
    });
};

export const sendVerificationEmail = async(email, code) => {
    if (!isEmailConfigured()) {
        if (process.env.NODE_ENV !== "production") {
            console.log(`Email not configured. Verification code for ${email}: ${code}`);
            return;
        }

        throw new Error("Email service is not configured");
    }

    const transporter = createTransporter();

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Verify your SkillSwap Campus account",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #0f172a;">Verify your SkillSwap Campus account</h2>

            <p style="color: #334155; font-size: 15px;">
            Use the verification code below to complete your signup.
            </p>

            <div style="margin: 24px 0; padding: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
            <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2563eb; margin: 0;">
                ${code}
            </p>
            </div>

            <p style="color: #64748b; font-size: 14px;">
            This code will expire in 10 minutes.
            </p>

            <p style="color: #64748b; font-size: 14px;">
            If you did not request this, you can safely ignore this email.
            </p>
        </div>
        `
        });
    } catch (error) {
        console.error(`[Email Service] Failed to send verification email to ${email}:`, error.message);
    }
};

export const sendPasswordResetEmail = async(email, code) => {
    console.log(`[Email Service] sendPasswordResetEmail called for ${email}`);
    if (!isEmailConfigured()) {
        console.error(`[Email Service] Configuration missing. HOST: ${!!process.env.EMAIL_HOST}, PORT: ${!!process.env.EMAIL_PORT}, USER: ${!!process.env.EMAIL_USER}, PASS: ${!!process.env.EMAIL_PASS}, FROM: ${!!process.env.EMAIL_FROM}`);
        if (process.env.NODE_ENV !== "production") {
            console.log(`Email not configured. Password reset code for ${email}: ${code}`);
            return;
        }

        throw new Error("Email service is not configured");
    }

    console.log(`[Email Service] Creating transporter...`);
    const transporter = createTransporter();

    try {
        console.log(`[Email Service] Awaiting transporter.sendMail()...`);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Reset your SkillSwap Campus password",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #0f172a;">Reset your SkillSwap Campus password</h2>

            <p style="color: #334155; font-size: 15px;">
            Use the code below to reset your password.
            </p>

            <div style="margin: 24px 0; padding: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
            <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2563eb; margin: 0;">
                ${code}
            </p>
            </div>

            <p style="color: #64748b; font-size: 14px;">
            This code will expire in 10 minutes.
            </p>

            <p style="color: #64748b; font-size: 14px;">
            If you did not request this, you can safely ignore this email.
            </p>
        </div>
        `
        });
        console.log(`[Email Service] sendMail() success. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error(`[Email Service] sendMail() failure! Error:`, error.message);
    }
};

export const sendNotificationEmail = async (email, title, message) => {
    if (!isEmailConfigured()) {
        if (process.env.NODE_ENV !== "production") {
            console.log(`Email not configured. Notification to ${email}: [${title}] ${message}`);
            return;
        }

        console.warn("Email service is not configured, skipping notification email.");
        return;
    }

    const transporter = createTransporter();

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: title,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #0f172a;">${title}</h2>

            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            ${message}
            </p>

            <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
            You can view your notifications in the SkillSwap Campus app.
            </p>
        </div>
        `
        });
    } catch (error) {
        console.error(`[Email Service] Failed to send notification email to ${email}:`, error.message);
    }
};