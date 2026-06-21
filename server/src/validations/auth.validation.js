import { z } from "zod";

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(50),
        email: z.string().email("Invalid email format").refine((val) => {
            const allowedDomains = process.env.ALLOWED_COLLEGE_DOMAINS
                ? process.env.ALLOWED_COLLEGE_DOMAINS.split(",").map(d => d.trim())
                : [".edu"];
            
            return allowedDomains.some(domain => {
                const cleanDomain = domain.startsWith(".") ? domain : `@${domain}`;
                return val.endsWith(cleanDomain) || val.endsWith(`.${domain}`);
            });
        }, "Must use an approved college email domain"),
        password: z.string().min(6, "Password must be at least 6 characters")
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required")
    })
});

export const verifyEmailSchema = z.object({
    body: z.object({
        email: z.string().email(),
        code: z.string().length(6, "Verification code must be exactly 6 digits")
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email()
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, "Token is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters")
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters")
    })
});
