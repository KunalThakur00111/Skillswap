import Availability from "../models/Availability.js";
import Session from "../models/Session.js";
import { generateAvailableSlots } from "../utils/slotGenerator.js";

// GET /api/availability/me
export const getMyAvailability = async (req, res) => {
    try {
        let availability = await Availability.findOne({ mentor: req.user._id });
        if (!availability) {
            // Return a default structure
            return res.status(200).json({
                success: true,
                availability: {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
                    defaultSessionDuration: 60,
                    schedule: [],
                    exceptions: []
                }
            });
        }
        res.status(200).json({ success: true, availability });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/availability/me
export const updateMyAvailability = async (req, res) => {
    try {
        const { timezone, defaultSessionDuration, schedule, exceptions } = req.body;
        
        let availability = await Availability.findOne({ mentor: req.user._id });
        
        if (availability) {
            availability.timezone = timezone || availability.timezone;
            availability.defaultSessionDuration = defaultSessionDuration || availability.defaultSessionDuration;
            if (schedule) availability.schedule = schedule;
            if (exceptions) availability.exceptions = exceptions;
            await availability.save();
        } else {
            availability = await Availability.create({
                mentor: req.user._id,
                timezone: timezone || "UTC",
                defaultSessionDuration: defaultSessionDuration || 60,
                schedule: schedule || [],
                exceptions: exceptions || []
            });
        }

        res.status(200).json({ success: true, availability });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/availability/slots/:mentorId
export const getAvailableSlots = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "startDate and endDate are required" });
        }

        // 30 days max horizon check
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 30) {
            return res.status(400).json({ success: false, message: "Maximum booking horizon is 30 days" });
        }

        const availability = await Availability.findOne({ mentor: mentorId });
        if (!availability) {
            return res.status(200).json({ success: true, slots: [] }); // No availability set
        }

        // Fetch overlapping sessions
        const bookedSessions = await Session.find({
            mentor: mentorId,
            status: { $in: ["scheduled", "live", "accepted"] },
            startTime: { $lte: new Date(new Date(endDate).setHours(23, 59, 59)) },
            endTime: { $gte: new Date(new Date(startDate).setHours(0, 0, 0)) }
        }).select("startTime endTime status");

        const slots = generateAvailableSlots(availability, startDate, endDate, bookedSessions);

        res.status(200).json({ success: true, count: slots.length, slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
