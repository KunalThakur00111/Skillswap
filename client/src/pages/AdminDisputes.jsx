import { useState, useEffect } from "react";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import UserAvatar from "../components/ui/UserAvatar";

function AdminDisputes() {
  const token = localStorage.getItem("token");
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDisputes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/sessions/disputes/all", { token });
      setDisputes(data.disputes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolve = async (sessionId, resolution) => {
    if (!window.confirm(`Are you sure you want to resolve this dispute by: ${resolution.toUpperCase()}?`)) return;

    try {
      setActionLoading(`${sessionId}-${resolution}`);
      setError("");
      setMessage("");

      const data = await apiRequest(`/sessions/${sessionId}/resolve-dispute`, {
        method: "PATCH",
        token,
        body: { resolution }
      });

      setMessage(data.message || "Dispute resolved successfully");
      await loadDisputes();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <main>
      <PageHeader
        eyebrow="Admin"
        title="Dispute Resolution"
        description="Review and resolve sessions that have been disputed by learners."
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-200">{message}</p>
        </div>
      )}

      <SectionCard className="mt-8" title="Active Disputes">
        {loading ? (
          <p className="text-slate-400">Loading disputes...</p>
        ) : disputes.length === 0 ? (
          <EmptyState
            title="No Active Disputes"
            description="There are currently no sessions under review. Great job everyone!"
          />
        ) : (
          <div className="space-y-6">
            {disputes.map((session) => (
              <article key={session._id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black">{session.skill} Session</h3>
                      <StatusBadge status={session.status} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Learner (Buyer)</p>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={session.learner?.name} size="sm" />
                          <div>
                            <p className="font-bold">{session.learner?.name}</p>
                            <p className="text-xs text-slate-400">{session.learner?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Mentor (Seller)</p>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={session.mentor?.name} size="sm" />
                          <div>
                            <p className="font-bold">{session.mentor?.name}</p>
                            <p className="text-xs text-slate-400">{session.mentor?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-yellow-500">Dispute Reason</p>
                      <p className="text-sm text-yellow-100">{session.disputeReason || "No reason provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 sm:grid-cols-4">
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase text-slate-500">Credits in Escrow</p>
                        <p className="font-bold text-white">{session.creditCost} credits</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase text-slate-500">Meeting Platform</p>
                        <p className="text-white">{session.meetingPlatform || "N/A"}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase text-slate-500">Scheduled For</p>
                        <p className="text-white">{formatDate(session.startTime)}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-4">
                        <p className="mb-1 text-xs font-bold uppercase text-slate-500">Meeting Link</p>
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                          {session.meetingLink || "N/A"}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:w-64 lg:shrink-0 lg:justify-center">
                    <button
                      onClick={() => handleResolve(session._id, "refund")}
                      disabled={actionLoading.startsWith(session._id)}
                      className="w-full rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {actionLoading === `${session._id}-refund` ? "Refunding..." : "Refund Learner"}
                    </button>
                    
                    <button
                      onClick={() => handleResolve(session._id, "release")}
                      disabled={actionLoading.startsWith(session._id)}
                      className="w-full rounded-2xl bg-green-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/20 hover:bg-green-600 disabled:opacity-50"
                    >
                      {actionLoading === `${session._id}-release` ? "Releasing..." : "Release to Mentor"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </main>
  );
}

export default AdminDisputes;
