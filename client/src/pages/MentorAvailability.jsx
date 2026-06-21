import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";

const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

function MentorAvailability() {
  const token = localStorage.getItem("token");
  
  const [availability, setAvailability] = useState({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    defaultSessionDuration: 60,
    schedule: [],
    exceptions: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/availability/me", { token });
      if (data.availability) {
        setAvailability(data.availability);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleDayToggle = (dayIndex) => {
    const isDayEnabled = availability.schedule.some(s => s.dayOfWeek === dayIndex);
    let newSchedule = [...availability.schedule];

    if (isDayEnabled) {
      newSchedule = newSchedule.filter(s => s.dayOfWeek !== dayIndex);
    } else {
      newSchedule.push({
        dayOfWeek: dayIndex,
        startTime: "09:00",
        endTime: "17:00"
      });
    }

    setAvailability({ ...availability, schedule: newSchedule });
  };

  const handleTimeChange = (dayIndex, field, value) => {
    const newSchedule = availability.schedule.map(s => {
      if (s.dayOfWeek === dayIndex) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setAvailability({ ...availability, schedule: newSchedule });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate times
      for (const day of availability.schedule) {
        if (day.startTime >= day.endTime) {
          throw new Error(`Invalid time range on ${DAYS_OF_WEEK[day.dayOfWeek]}: Start time must be before end time.`);
        }
      }

      const data = await apiRequest("/availability/me", {
        method: "PUT",
        token,
        body: availability
      });

      toast.success("Availability updated successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex h-[50vh] items-center justify-center">
        <p className="text-slate-400">Loading your schedule...</p>
      </main>
    );
  }

  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="My Availability"
        description="Set your recurring weekly hours so learners can instantly book slots on your calendar."
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <SectionCard title="Weekly Recurring Hours">
            <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div>
                <p className="text-sm font-bold text-white">Your Timezone</p>
                <p className="text-xs text-slate-400">All times below are in this timezone.</p>
              </div>
              <p className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-bold text-blue-400">
                {availability.timezone}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                const daySchedule = availability.schedule.find(s => s.dayOfWeek === dayIndex);
                const isEnabled = !!daySchedule;

                return (
                  <div key={dayName} className={`flex flex-col gap-4 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${isEnabled ? 'border-white/20 bg-slate-900/50' : 'border-white/5 bg-transparent'}`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDayToggle(dayIndex)}
                        className={`flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors ${isEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                      <span className={`font-bold ${isEnabled ? 'text-white' : 'text-slate-500'}`}>{dayName}</span>
                    </div>

                    {isEnabled ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          value={daySchedule.startTime}
                          onChange={(e) => handleTimeChange(dayIndex, "startTime", e.target.value)}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                          type="time"
                          value={daySchedule.endTime}
                          onChange={(e) => handleTimeChange(dayIndex, "endTime", e.target.value)}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-slate-600">Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-2xl bg-blue-500 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Availability"}
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Date Exceptions" description="Block off specific dates for holidays or vacation.">
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/20 p-8 text-center">
              <div>
                <p className="text-sm font-bold text-slate-400">Exceptions feature coming soon</p>
                <p className="mt-1 text-xs text-slate-500">You will be able to override specific dates here.</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

export default MentorAvailability;
