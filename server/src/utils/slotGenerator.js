import { addMinutes, isBefore, parseISO, startOfDay, addDays, format, differenceInMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

/**
 * Generates available slots based on recurring schedule, exceptions, and existing sessions.
 * @param {Object} availability - The mentor's Availability document
 * @param {String} startDateStr - YYYY-MM-DD
 * @param {String} endDateStr - YYYY-MM-DD 
 * @param {Array} bookedSessions - Array of Session objects { startTime, endTime }
 * @returns {Array} - Array of { startTime: Date, endTime: Date }
 */
export const generateAvailableSlots = (availability, startDateStr, endDateStr, bookedSessions) => {
    const slots = [];
    const timezone = availability.timezone || "UTC";
    const duration = availability.defaultSessionDuration || 60;
    
    // Parse start and end dates
    const startRange = startOfDay(parseISO(startDateStr));
    const endRange = startOfDay(parseISO(endDateStr));
    
    // Now + 30 mins (Booking rule: cannot book within 30 mins)
    const cutoffTime = addMinutes(new Date(), 30);

    let currentDate = startRange;
    
    while (!isBefore(endRange, currentDate)) {
        const dateString = format(currentDate, "yyyy-MM-dd"); // e.g., "2026-06-14"
        const dayOfWeek = currentDate.getDay(); // 0-6

        // Check exceptions
        const exception = availability.exceptions?.find(ex => ex.date === dateString);
        
        let dailySchedules = [];
        if (exception) {
            if (exception.isAvailable && exception.customSlots?.length > 0) {
                dailySchedules = exception.customSlots;
            } else {
                // Not available on this day
                currentDate = addDays(currentDate, 1);
                continue;
            }
        } else {
            // Find recurring schedule for this day of week
            dailySchedules = availability.schedule?.filter(s => s.dayOfWeek === dayOfWeek) || [];
        }

        // Generate slots for each schedule block
        for (const block of dailySchedules) {
            // block.startTime "09:00", block.endTime "17:00"
            const [startHour, startMin] = block.startTime.split(":").map(Number);
            const [endHour, endMin] = block.endTime.split(":").map(Number);
            
            // Construct the Date object in the mentor's timezone for that specific date
            // Note: currentDate is midnight local. We just need the string YYYY-MM-DD + time + Timezone
            const blockStartTz = `${dateString}T${block.startTime}:00`;
            const blockEndTz = `${dateString}T${block.endTime}:00`;
            
            let currentSlotStart = fromZonedTime(blockStartTz, timezone);
            const blockEndUtc = fromZonedTime(blockEndTz, timezone);

            while (differenceInMinutes(blockEndUtc, currentSlotStart) >= duration) {
                const currentSlotEnd = addMinutes(currentSlotStart, duration);
                
                // Rule: Must be > 30 mins in future
                if (isBefore(cutoffTime, currentSlotStart)) {
                    // Rule: Check overlapping booked sessions
                    const isOverlapping = bookedSessions.some(session => {
                        const sessionStart = new Date(session.startTime);
                        const sessionEnd = new Date(session.endTime);
                        return currentSlotStart < sessionEnd && currentSlotEnd > sessionStart;
                    });

                    if (!isOverlapping) {
                        slots.push({
                            startTime: currentSlotStart.toISOString(),
                            endTime: currentSlotEnd.toISOString()
                        });
                    }
                }
                
                currentSlotStart = currentSlotEnd;
            }
        }

        currentDate = addDays(currentDate, 1);
    }

    return slots;
};
