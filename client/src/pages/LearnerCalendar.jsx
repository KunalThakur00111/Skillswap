import { useState, useEffect } from "react";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatusBadge from "../components/ui/StatusBadge";
import UserAvatar from "../components/ui/UserAvatar";
import EmptyState from "../components/ui/EmptyState";

function LearnerCalendar() {
  const token = localStorage.getItem("token");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/sessions", { token });
        // Filter only where user is the learner
        const user = JSON.parse(localStorage.getItem("user"));
        const myLearning = (data.sessions || []).filter(s => s.learner?._id === user.id || s.learner?._id === user._id);
        setSessions(myLearning);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [token]);

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
        <div className="flex flex-col items-center justify-center rounded-xl bg-blue-500/10 px-4 py-2 min-w-[80px]">
          <span className="text-xs font-bold uppercase text-blue-400">{new Date(session.startTime).toLocaleDateString([], { month: 'short' })}</span>
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
              <UserAvatar name={session.mentor?.name} size="xs" />
              {session.mentor?.name}
            </span>
          </p>
        </div>
      </div>
      <div className="flex w-full md:w-auto flex-col gap-2">
        {session.meetingLink && (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-blue-500 px-4 py-2 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"
          >
            Join Meeting
          </a>
        )}
      </div>
    </div>
  );

  return (
    <main>
      <PageHeader
        eyebrow="My Learning"
        title="Learner Calendar"
        description="Track your upcoming mentoring sessions and review your past learning history."
      />

      {error && <p className="text-red-400">{error}</p>}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <SectionCard title="Upcoming Sessions">
            {loading ? <p className="text-slate-400">Loading...</p> : upcomingSessions.length === 0 ? (
              <EmptyState title="No upcoming sessions" description="You have no scheduled sessions right now." />
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map(s => <SessionCard key={s._id} session={s} type="upcoming" />)}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Session History">
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
          <SectionCard title="Pending Requests" className="sticky top-24">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-slate-400">No pending requests.</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(s => (
                  <div key={s._id} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <p className="font-bold">{s.skill}</p>
                    <p className="text-xs text-slate-400">Requested for: {formatDate(s.startTime)} at {formatTime(s.startTime)}</p>
                    <p className="text-xs text-yellow-500 mt-2">Awaiting mentor approval</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

export default LearnerCalendar;
