import { useState, useEffect, useMemo } from "react";
import { apiRequest } from "../api/api";
import UserAvatar from "./ui/UserAvatar";

function BookingWidget({ mentor, onClose, onSuccess }) {
  const token = localStorage.getItem("token");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [requestSkill, setRequestSkill] = useState(mentor?.teachSkills?.[0] || "");
  const [requestMessage, setRequestMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");

  // Helper to get next 14 days
  const dateOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      options.push(d.toISOString().split("T")[0]);
    }
    return options;
  }, []);

  useEffect(() => {
    if (!mentor) return;
    
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        // Fetch slots for next 14 days
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 14);
        const endStr = endDate.toISOString().split("T")[0];
        const startStr = new Date().toISOString().split("T")[0];

        const data = await apiRequest(`/availability/slots/${mentor._id || mentor.id}?startDate=${startStr}&endDate=${endStr}`, { token });
        setSlots(data.slots || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    fetchSlots();
  }, [mentor, token]);

  const slotsForSelectedDate = useMemo(() => {
    return slots.filter(slot => {
      const slotDate = new Date(slot.startTime).toISOString().split("T")[0];
      return slotDate === selectedDate;
    });
  }, [slots, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!requestSkill) return setError("Please select a skill");
    if (!selectedSlot) return setError("Please select a time slot");
    if (!requestMessage.trim()) return setError("Please provide a message");

    try {
      setRequesting(true);
      const data = await apiRequest("/sessions/request", {
        method: "POST",
        token,
        body: {
          mentorId: mentor._id || mentor.id,
          skill: requestSkill,
          message: requestMessage.trim(),
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime
        }
      });
      onSuccess(data.message || "Session requested successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setRequesting(false);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Left Column: Details */}
      <div className="flex flex-col gap-6 md:w-1/2">
        <div className="rounded-3xl border border-white/10 bg-slate-950 p-5">
          <div className="flex items-center gap-4">
            <UserAvatar name={mentor.name} src={mentor.avatar} size="md" />
            <div>
              <h3 className="text-xl font-black">{mentor.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{mentor.email}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-slate-300">1. Select Skill</label>
          <div className="flex flex-wrap gap-2">
            {(mentor.teachSkills || []).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => setRequestSkill(skill)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  requestSkill === skill
                    ? "bg-blue-500 text-white"
                    : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">2. Message for Mentor</label>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            rows="3"
            placeholder="What do you want to learn in this session?"
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm font-semibold text-blue-200">Session cost</p>
          <p className="mt-1 text-2xl font-black text-white">10 credits</p>
        </div>
      </div>

      {/* Right Column: Calendar & Slots */}
      <div className="flex flex-col gap-6 md:w-1/2 rounded-3xl border border-white/10 bg-slate-900/50 p-5">
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-300">3. Select Date</label>
          <select
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
          >
            {dateOptions.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="mb-3 block text-sm font-medium text-slate-300">4. Select Time ({Intl.DateTimeFormat().resolvedOptions().timeZone})</label>
          {loadingSlots ? (
            <p className="text-sm text-slate-400">Loading available times...</p>
          ) : slotsForSelectedDate.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <p className="text-sm text-slate-400">No slots available on this date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {slotsForSelectedDate.map((slot, idx) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                      isSelected 
                        ? "border-blue-500 bg-blue-500/20 text-blue-400" 
                        : "border-white/10 bg-slate-950 text-slate-300 hover:border-white/30"
                    }`}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={requesting || !selectedSlot}
          className="mt-auto w-full rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50"
        >
          {requesting ? "Requesting..." : selectedSlot ? `Confirm for ${formatTime(selectedSlot.startTime)}` : "Select a time slot"}
        </button>
      </div>
    </div>
  );
}

export default BookingWidget;
