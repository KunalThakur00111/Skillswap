import { useState, useEffect } from "react";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatusBadge from "../components/ui/StatusBadge";
import UserAvatar from "../components/ui/UserAvatar";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";

function MentorCalendar() {
  const token = localStorage.getItem("token");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/sessions", { token });
      const user = JSON.parse(localStorage.getItem("user"));
      const myMentoring = (data.sessions || []).filter(s => s.mentor?._id === user.id || s.mentor?._id === user._id);
      setSessions(myMentoring);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const handleAccept = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      await apiRequest(`/sessions/${sessionId}/accept`, { method: "PATCH", token });
      fetchSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      await apiRequest(`/sessions/${sessionId}/reject`, { method: "PATCH", token });
      fetchSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleAddLinkClick = (sessionId) => {
    setSelectedSessionId(sessionId);
    setMeetingLink("");
    setIsLinkModalOpen(true);
  };

  const submitMeetingLink = async (e) => {
    e.preventDefault();
    if (!meetingLink) return;

    try {
      setActionLoading(selectedSessionId);
      // We reuse the schedule endpoint or create a simpler add-link endpoint.
      // Assuming the backend still requires startTime/endTime for PUT /:id/schedule
      // Let's just use PATCH /sessions/:id/link if available, or we just pass the existing times.
      // Wait, in my session controller I only have PUT /sessions/:id/schedule. Let's pass the existing times.
      const session = sessions.find(s => s._id === selectedSessionId);
      await apiRequest(`/sessions/${selectedSessionId}/schedule`, {
        method: "PATCH",
        token,
        body: {
          startTime: session.startTime,
          endTime: session.endTime,
          meetingPlatform: meetingLink.includes("meet.google.com") ? "Google Meet" : meetingLink.includes("zoom.us") ? "Zoom" : meetingLink.includes("teams.microsoft.com") ? "Microsoft Teams" : "Other",
          meetingLink: meetingLink,
          timezone: session.timezone || "UTC"
        }
      });
      fetchSessions();
      setIsLinkModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const upcomingSessions = sessions.filter(s => ["accepted", "scheduled", "live"].includes(s.status));
  const pastSessions = sessions.filter(s => !["accepted", "scheduled", "live", "pending"].includes(s.status));
  const pendingRequests = sessions.filter(s => s.status === "pending");

  const formatTime = (isoString) => {
    if (!isoString) return "TBD";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "TBD";
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const SessionCard = ({ session, type }) => (
    <div className="flex flex-col gap-4 md:flex-row items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition-colors hover:border-white/20">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="flex flex-col items-center justify-center rounded-xl bg-purple-500/10 px-4 py-2 min-w-[80px]">
          <span className="text-xs font-bold uppercase text-purple-400">{new Date(session.startTime).toLocaleDateString([], { month: 'short' })}</span>
          <span className="text-2xl font-black text-white">{new Date(session.startTime).getDate()}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-lg">{session.skill}</h4>
            <StatusBadge status={session.status} />
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <UserAvatar name={session.learner?.name} size="xs" />
              {session.learner?.name}
            </span>
          </p>
        </div>
      </div>
      <div className="flex w-full md:w-auto flex-col gap-2">

        {(session.status === "scheduled" || session.status === "accepted") && !session.meetingLink && (
           <button 
             onClick={() => handleAddLinkClick(session._id)}
             disabled={actionLoading === session._id}
             className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[0.05]"
           >
             {actionLoading === session._id ? "Adding..." : "+ Add Meeting Link"}
           </button>
        )}
        {session.meetingLink && ["scheduled", "live"].includes(session.status) && (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-purple-500 px-4 py-2 text-center text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-600"
          >
            Start Meeting
          </a>
        )}
      </div>
    </div>
  );

  return (
    <main>
      <PageHeader
        eyebrow="My Mentoring"
        title="Mentor Calendar"
        description="Manage your upcoming teaching schedule, add meeting links, and review requests."
      />

      {error && <p className="text-red-400">{error}</p>}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <SectionCard title="Upcoming Mentoring">
            {loading ? <p className="text-slate-400">Loading...</p> : upcomingSessions.length === 0 ? (
              <EmptyState title="No upcoming sessions" description="You have no mentoring sessions scheduled right now." />
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map(s => <SessionCard key={s._id} session={s} type="upcoming" />)}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Mentoring History">
             {loading ? <p className="text-slate-400">Loading...</p> : pastSessions.length === 0 ? (
              <p className="text-slate-400">No past sessions.</p>
            ) : (
              <div className="space-y-4">
                {pastSessions.map(s => <SessionCard key={s._id} session={s} type="history" />)}
              </div>
            )}
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Action Required" className="sticky top-24">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-slate-400">All caught up!</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(s => (
                  <div key={s._id} className="rounded-xl border border-white/10 bg-slate-900 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-lg">{s.skill}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm text-slate-400 mt-3 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <UserAvatar name={s.learner?.name} size="xs" />
                        {s.learner?.name}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatDate(s.startTime)} • {formatTime(s.startTime)} - {formatTime(s.endTime)}
                    </p>
                    {s.message && (
                      <p className="mt-3 text-sm italic text-slate-400 border-t border-white/10 pt-3">"{s.message}"</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleReject(s._id)}
                        disabled={actionLoading === s._id}
                        className="flex-1 rounded-xl border border-red-500/30 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {actionLoading === s._id ? "Rejecting..." : "Reject"}
                      </button>
                      <button
                        onClick={() => handleAccept(s._id)}
                        disabled={actionLoading === s._id}
                        className="flex-1 rounded-xl bg-purple-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-600 disabled:opacity-50"
                      >
                        {actionLoading === s._id ? "Accepting..." : "Accept"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <Modal
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Add Meeting Link"
        description="Enter the URL where the session will take place (Google Meet, Zoom, etc.)."
        maxWidth="max-w-md"
      >
        <form onSubmit={submitMeetingLink} className="space-y-4 mt-2">
          <div>
            <label htmlFor="meetingLink" className="block text-sm font-medium text-slate-300 mb-1">
              Meeting URL
            </label>
            <input
              type="url"
              id="meetingLink"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!meetingLink || actionLoading === selectedSessionId}
              className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50"
            >
              {actionLoading === selectedSessionId ? "Saving..." : "Save Link"}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}

export default MentorCalendar;
