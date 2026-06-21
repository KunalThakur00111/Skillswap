// SkillSwap Email Service - Powered by Brevo Transactional API

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn(`[Brevo Service] BREVO_API_KEY missing. Email to ${toEmail} suppressed.`);
        return;
    }

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "SkillSwap", email: "kunalx2006@gmail.com" },
                to: [{ email: toEmail }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        // The response might be empty or JSON. Handle carefully.
        let data = {};
        const text = await response.text();
        if (text) {
            try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
        }

        if (!response.ok) {
            console.error(`[Brevo Service] API Error (${response.status}):`, data);
        } else {
            console.log(`[Brevo Service] Successfully sent email to ${toEmail}. MessageId: ${data.messageId || 'OK'}`);
        }
    } catch (error) {
        console.error(`[Brevo Service] Network Error - Failed to send email to ${toEmail}:`, error.message);
    }
};

export const sendVerificationEmail = async (email, code) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn(`[Email Service] BREVO_API_KEY missing. Verification code for ${email}: ${code}`);
    }

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
        <h2 style="color: #0f172a;">Verify your SkillSwap Campus account</h2>
        <p style="color: #334155; font-size: 15px;">Use the verification code below to complete your signup.</p>
        <div style="margin: 24px 0; padding: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
        <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2563eb; margin: 0;">${code}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
    </div>
    `;

    await sendBrevoEmail(email, "Verify your SkillSwap Campus account", html);
};

export const sendPasswordResetEmail = async (email, code) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn(`[Email Service] BREVO_API_KEY missing. Reset code for ${email}: ${code}`);
    }

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
        <h2 style="color: #0f172a;">Reset your SkillSwap Campus password</h2>
        <p style="color: #334155; font-size: 15px;">Use the code below to reset your password.</p>
        <div style="margin: 24px 0; padding: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
        <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2563eb; margin: 0;">${code}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
    </div>
    `;

    await sendBrevoEmail(email, "Reset your SkillSwap Campus password", html);
};

export const sendNotificationEmail = async (email, title, message) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn(`[Email Service] BREVO_API_KEY missing. Notification to ${email}: [${title}] ${message}`);
    }

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;">
        <h2 style="color: #0f172a;">${title}</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">${message}</p>
        <p style="color: #64748b; font-size: 14px; margin-top: 32px;">You can view your notifications in the SkillSwap Campus app.</p>
    </div>
    `;

    await sendBrevoEmail(email, title, html);
};