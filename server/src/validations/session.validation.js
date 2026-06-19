import { z } from "zod";

export const requestSessionSchema = z.object({
    body: z.object({
        mentorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid mentor ID"),
        skill: z.string().min(1, "Skill is required"),
        message: z.string().max(500, "Message too long").optional(),
        startTime: z.string().datetime("Invalid start time format"),
        endTime: z.string().datetime("Invalid end time format")
    })
});

export const scheduleSessionSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID")
    }),
    body: z.object({
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        meetingPlatform: z.enum(["Google Meet", "Zoom", "Microsoft Teams", "Other"]),
        meetingLink: z.string().url("Must be a valid URL").optional(),
        timezone: z.string().min(1)
    })
});

export const sessionActionSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID")
    })
});

export const disputeSessionSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID")
    }),
    body: z.object({
        reason: z.string().min(10, "Reason must be at least 10 characters").max(500)
    })
});
