import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSessions } from "../hooks/queries/useSessions";
import { sessionApi } from "../api/sessionApi";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import UserAvatar from "../components/ui/UserAvatar";
import SessionCardSkeleton from "../components/skeletons/SessionCardSkeleton";

function Sessions() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = user?.id || user?._id;

  const [activeFilter, setActiveFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reviewSession, setReviewSession] = useState(null);
  const [scheduleSession, setScheduleSession] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    meetingPlatform: "Google Meet",
    meetingLink: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ""
  });
  const [cancelSessionItem, setCancelSessionItem] = useState(null);
  const [cancelReason, setCancelReason] = useState("");


  const [page, setPage] = useState(1);

  const { data: response, isLoading: loading, error: queryError, refetch } = useSessions({
      page,
      limit: 20
  });

  const sessions = response?.data || [];
  const meta = response?.meta || { totalPages: 1, page: 1 };


  const stats = useMemo(() => {
    return {
      total: sessions.length,
      pending: sessions.filter((session) => session.status === "pending").length,
      accepted: sessions.filter((session) => session.status === "accepted").length,
      scheduled: sessions.filter((session) => session.status === "scheduled").length,
      live: sessions.filter((session) => session.status === "live").length,
      awaiting_confirm: sessions.filter((session) => session.status === "completed_pending_confirmation").length,
      completed: sessions.filter((session) => session.status === "completed").length,
      under_review: sessions.filter((session) => session.status === "under_review").length,
      no_show: sessions.filter((session) => session.status === "no_show").length,
      cancelled: sessions.filter((session) => session.status === "cancelled").length,
      rejected: sessions.filter((session) => session.status === "rejected").length
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (activeFilter === "all") {
      return sessions;
    }

    return sessions.filter((session) => session.status === activeFilter);
  }, [activeFilter, sessions]);

  const filters = [
    { label: "All", value: "all", count: stats.total },
    { label: "Pending", value: "pending", count: stats.pending },
    { label: "Accepted", value: "accepted", count: stats.accepted },
    { label: "Scheduled", value: "scheduled", count: stats.scheduled },
    { label: "Live", value: "live", count: stats.live },
    { label: "To Confirm", value: "completed_pending_confirmation", count: stats.awaiting_confirm },
    { label: "Completed", value: "completed", count: stats.completed },
    { label: "Reviewing", value: "under_review", count: stats.under_review },
    { label: "No Show", value: "no_show", count: stats.no_show },
    { label: "Cancelled", value: "cancelled", count: stats.cancelled },
    { label: "Rejected", value: "rejected", count: stats.rejected }
  ];

  const getId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    return value._id || value.id || "";
  };

  const getOtherPerson = (session) => {
    const learnerId = getId(session.learner);
    const mentorId = getId(session.mentor);

    if (learnerId === currentUserId) {
      return {
        label: "Mentor",
        person: session.mentor
      };
    }

    if (mentorId === currentUserId) {
      return {
        label: "Learner",
        person: session.learner
      };
    }

    return {
      label: "Participant",
      person: session.mentor || session.learner
    };
  };

  const isLearner = (session) => {
    return getId(session.learner) === currentUserId;
  };

  const isMentor = (session) => {
    return getId(session.mentor) === currentUserId;
  };

  const canChat = (session) => {
    const invalidStatuses = ["cancelled", "rejected", "expired", "no_show"];
    return !invalidStatuses.includes(session.status);
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const runSessionAction = async (sessionId, action, body = null) => {
    try {
      setActionLoading(`${sessionId}-${action}`);
      setError("");
      setMessage("");

      const options = {
        method: "PATCH",
        token
      };
      
      if (body) {
        options.body = body;
      }

      const data = await apiRequest(`/sessions/${sessionId}/${action}`, options);

      setMessage(data.message || "Session updated successfully");
      await refetch();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  const openCancelModal = (session) => {
    setCancelSessionItem(session);
    setCancelReason("");
    setError("");
    setMessage("");
  };

  const submitCancel = async (event) => {
    event.preventDefault();
    if (!cancelSessionItem) return;

    if (cancelReason.trim().length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }

    try {
      setActionLoading(`${cancelSessionItem._id}-cancel`);
      setError("");
      setMessage("");

      const data = await apiRequest(`/sessions/${cancelSessionItem._id}/cancel`, {
        method: "PATCH",
        token,
        body: { reason: cancelReason.trim() }
      });

      setMessage(data.message || "Session cancelled successfully");
      setCancelSessionItem(null);
      await refetch();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };


  const openReviewModal = (session) => {
    setReviewSession(session);
    setReviewForm({
      rating: 5,
      comment: ""
    });
    setError("");
    setMessage("");
  };

  const closeReviewModal = () => {
    setReviewSession(null);
    setReviewForm({
      rating: 5,
      comment: ""
    });
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!reviewSession) {
      return;
    }

    if (!reviewForm.rating) {
      setError("Rating is required");
      return;
    }

    try {
      setActionLoading(`${reviewSession._id}-review`);
      setError("");
      setMessage("");

      const data = await apiRequest("/reviews", {
        method: "POST",
        token,
        body: {
          sessionId: reviewSession._id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim()
        }
      });

      setMessage(data.message || "Review submitted successfully");
      closeReviewModal();
      await refetch();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  const openScheduleModal = (session) => {
    setScheduleSession(session);
    setScheduleForm({
      date: "",
      startTime: "",
      endTime: "",
      meetingPlatform: "Google Meet",
      meetingLink: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    setError("");
    setMessage("");
  };

  const submitSchedule = async (event) => {
    event.preventDefault();
    if (!scheduleSession) return;

    try {
      setActionLoading(`${scheduleSession._id}-schedule`);
      setError("");
      setMessage("");

      // Combine date and time
      const startDateTime = new Date(`${scheduleForm.date}T${scheduleForm.startTime}:00`);
      const endDateTime = new Date(`${scheduleForm.date}T${scheduleForm.endTime}:00`);

      const data = await apiRequest(`/sessions/${scheduleSession._id}/schedule`, {
        method: "PATCH",
        token,
        body: {
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          meetingPlatform: scheduleForm.meetingPlatform,
          meetingLink: scheduleForm.meetingLink,
          timezone: scheduleForm.timezone
        }
      });

      setMessage(data.message || "Session scheduled successfully");
      setScheduleSession(null);
      await refetch();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleJoinSession = async (session) => {
    try {
      setActionLoading(`${session._id}-join`);
      await apiRequest(`/sessions/${session._id}/start`, {
        method: "PATCH",
        token
      });
      window.open(session.meetingLink, "_blank", "noopener,noreferrer");
      await refetch();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  const canAcceptReject = (session) => {
    return isMentor(session) && session.status === "pending";
  };

  const canCancel = (session) => {
    return (isLearner(session) || isMentor(session)) && ["pending", "accepted", "scheduled"].includes(session.status);
  };

  const canReportNoShow = (session) => {
    if (!["scheduled", "live"].includes(session.status)) return false;
    // Check if end time passed
    if (session.endTime) {
      const isPast = new Date() > new Date(session.endTime);
      return isPast && (isLearner(session) || isMentor(session));
    }
    return false;
  };

  const canSchedule = (session) => {
    return isMentor(session) && session.status === "accepted";
  };

  const canJoin = (session) => {
    return ["scheduled", "live"].includes(session.status);
  };

  const canComplete = (session) => {
    return isMentor(session) && ["accepted", "scheduled", "live"].includes(session.status);
  };

  const canConfirm = (session) => {
    return isLearner(session) && session.status === "completed_pending_confirmation";
  };

  const canReview = (session) => {
    return (
      isLearner(session) &&
      session.status === "completed" &&
      !session.isReviewed
    );
  };

  const renderActions = (session) => {
    const sessionId = session._id || session.id;

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap 2xl:justify-end">
        {canAcceptReject(session) && (
          <>
            <button
              onClick={() => runSessionAction(sessionId, "accept")}
              disabled={actionLoading === `${sessionId}-accept`}
              className="rounded-2xl bg-green-500 px-4 py-3 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60"
            >
              {actionLoading === `${sessionId}-accept` ? "Accepting..." : "Accept"}
            </button>
            <button
              onClick={() => runSessionAction(sessionId, "reject")}
              disabled={actionLoading === `${sessionId}-reject`}
              className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
            >
              {actionLoading === `${sessionId}-reject` ? "Rejecting..." : "Reject"}
            </button>
          </>
        )}

        {canSchedule(session) && (
          <button
            onClick={() => openScheduleModal(session)}
            className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-600"
          >
            Schedule
          </button>
        )}

        {canJoin(session) && (
          <button
            onClick={() => handleJoinSession(session)}
            disabled={actionLoading === `${sessionId}-join`}
            className="rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {actionLoading === `${sessionId}-join` ? "Joining..." : "Join Meeting"}
          </button>
        )}

        {canComplete(session) && (
          <button
            onClick={() => runSessionAction(sessionId, "complete")}
            disabled={actionLoading === `${sessionId}-complete`}
            className="rounded-2xl border border-blue-500/40 px-4 py-3 text-sm font-bold text-blue-300 hover:bg-blue-500/10 disabled:opacity-60"
          >
            {actionLoading === `${sessionId}-complete` ? "Completing..." : "Mark Complete"}
          </button>
        )}

        {canConfirm(session) && (
          <>
            <button
              onClick={() => runSessionAction(sessionId, "confirm")}
              disabled={actionLoading === `${sessionId}-confirm`}
              className="rounded-2xl bg-green-500 px-4 py-3 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60"
            >
              {actionLoading === `${sessionId}-confirm` ? "Confirming..." : "Confirm Completion"}
            </button>
            <button
              onClick={() => runSessionAction(sessionId, "dispute")}
              disabled={actionLoading === `${sessionId}-dispute`}
              className="rounded-2xl border border-yellow-500/40 px-4 py-3 text-sm font-bold text-yellow-500 hover:bg-yellow-500/10 disabled:opacity-60"
            >
              {actionLoading === `${sessionId}-dispute` ? "Disputing..." : "Dispute"}
            </button>
          </>
        )}

        {canCancel(session) && (
          <button
            onClick={() => openCancelModal(session)}
            disabled={actionLoading === `${sessionId}-cancel`}
            className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
          >
            {actionLoading === `${sessionId}-cancel` ? "Cancelling..." : "Cancel"}
          </button>
        )}

        {canReportNoShow(session) && (
          <button
            onClick={() => runSessionAction(sessionId, "report-no-show", { noShowBy: isLearner(session) ? "mentor" : "learner" })}
            disabled={actionLoading === `${sessionId}-report-no-show`}
            className="rounded-2xl border border-orange-500/40 px-4 py-3 text-sm font-bold text-orange-400 hover:bg-orange-500/10 disabled:opacity-60"
          >
            {actionLoading === `${sessionId}-report-no-show` ? "Reporting..." : "Report No Show"}
          </button>
        )}

        {canChat(session) && (
          <Link
            to={`/sessions/${sessionId}/chat`}
            className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700 text-center"
          >
            💬 Open Chat
          </Link>
        )}

        {canReview(session) && (
          <button
            onClick={() => openReviewModal(session)}
            className="rounded-2xl bg-purple-500 px-4 py-3 text-sm font-bold text-white hover:bg-purple-600"
          >
            Review
          </button>
        )}

        {!canAcceptReject(session) &&
          !canSchedule(session) &&
          !canJoin(session) &&
          !canComplete(session) &&
          !canConfirm(session) &&
          !canCancel(session) &&
          !canReportNoShow(session) &&
          !canReview(session) && (
            <span className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-bold text-slate-500">
              No action needed
            </span>
          )}
      </div>
    );
  };

  return (
    <main>
      <PageHeader
        eyebrow="Sessions"
        title="Your learning sessions"
        description="Manage session requests, accepted sessions, completed sessions, credit transfers, and reviews from one place."
        actions={
          <Link
            to="/explore"
            className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-200"
          >
            Find mentors
          </Link>
        }
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

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          helper="All session records"
          tone="blue"
        />

        <StatCard
          label="Pending"
          value={stats.pending}
          helper="Waiting for mentor"
          tone="yellow"
        />

        <StatCard
          label="Accepted"
          value={stats.accepted}
          helper="Ready to complete"
          tone="purple"
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          helper="Finished sessions"
          tone="green"
        />
      </section>

      <SectionCard
        className="mt-8"
        title="Session history"
        description="Filter by status and take actions based on your role in each session."
        action={
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={
                  activeFilter === filter.value
                    ? "rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                    : "rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.08]"
                }
              >
                {filter.label} · {filter.count}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <SessionCardSkeleton key={i} />
             ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            title="No sessions found"
            description="Try another filter, or explore mentors and request your first learning session."
            action={
              <Link
                to="/explore"
                className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
              >
                Explore mentors
              </Link>
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {filteredSessions.map((session) => {
              const personInfo = getOtherPerson(session);
              const person = personInfo.person;
              const sessionId = session._id || session.id;

              return (
                <article
                  key={sessionId}
                  className="card-hover rounded-3xl border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                      <UserAvatar
                        name={person?.name}
                        src={person?.avatar}
                        size="md"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black">
                            {session.skill} session
                          </h3>

                          <StatusBadge status={session.status} />

                          {session.isPaid && (
                            <StatusBadge status="credit">Paid</StatusBadge>
                          )}

                          {session.isReviewed && (
                            <StatusBadge status="verified">
                              Reviewed
                            </StatusBadge>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {personInfo.label}: {person?.name || "Unknown"}
                        </p>

                        {session.message && (
                          <p className="mt-4 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                            {session.message}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                          <span>{session.creditCost || 10} credits</span>
                          <span>Created {formatDate(session.createdAt)}</span>
                          {session.startTime && (
                            <span className="font-medium text-blue-400">
                              Scheduled for {formatDate(session.startTime)}
                            </span>
                          )}
                          {session.completedAt && (
                            <span>
                              Completed {formatDate(session.completedAt)}
                            </span>
                          )}
                          {session.cancelledAt && (
                            <span className="text-red-400">
                              Cancelled at {formatDate(session.cancelledAt)}
                            </span>
                          )}
                        </div>

                        {session.cancellationReason && (
                          <div className="mt-4 max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm leading-6">
                            <span className="font-bold text-red-400 block mb-1">
                              Cancelled by {session.cancelledBy}
                            </span>
                            <p className="text-red-200">
                              Reason: {session.cancellationReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="2xl:min-w-64 2xl:text-right">
                      {renderActions(session)}
                    </div>
                  </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-slate-400 flex items-center">
                  Page {page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      <Modal
        open={Boolean(reviewSession)}
        eyebrow="Review session"
        title="Rate your mentor"
        description="Your review helps other students choose the right mentor."
        onClose={closeReviewModal}
        maxWidth="max-w-2xl"
        footer={
          <div className="modal-action-row flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={closeReviewModal}
              className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="review-session-form"
              disabled={
                reviewSession &&
                actionLoading === `${reviewSession._id}-review`
              }
              className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
            >
              {reviewSession && actionLoading === `${reviewSession._id}-review`
                ? "Submitting..."
                : "Submit review"}
            </button>
          </div>
        }
      >
        {reviewSession && (
          <form
            id="review-session-form"
            onSubmit={submitReview}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-white/10 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">Session</p>
              <h3 className="mt-1 text-xl font-black">
                {reviewSession.skill} session
              </h3>
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold text-slate-300">
                Rating
              </label>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setReviewForm({
                        ...reviewForm,
                        rating
                      })
                    }
                    className={
                      reviewForm.rating === rating
                        ? "rounded-2xl bg-yellow-500 px-5 py-3 font-black text-slate-950"
                        : "rounded-2xl border border-white/10 px-5 py-3 font-black text-slate-300 hover:bg-white/[0.04]"
                    }
                  >
                    {rating} ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Comment
              </label>

              <textarea
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm({
                    ...reviewForm,
                    comment: event.target.value
                  })
                }
                rows="5"
                placeholder="How was the session? What did the mentor help you understand?"
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(scheduleSession)}
        eyebrow="Schedule Session"
        title="Set Meeting Details"
        description="Choose a date, time, and provide a meeting link for your student."
        onClose={() => setScheduleSession(null)}
        maxWidth="max-w-2xl"
        footer={
          <div className="modal-action-row flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={() => setScheduleSession(null)}
              className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="schedule-session-form"
              disabled={scheduleSession && actionLoading === `${scheduleSession._id}-schedule`}
              className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
            >
              {scheduleSession && actionLoading === `${scheduleSession._id}-schedule` ? "Scheduling..." : "Schedule Session"}
            </button>
          </div>
        }
      >
        {scheduleSession && (
          <form id="schedule-session-form" onSubmit={submitSchedule} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">Start Time</label>
                <input
                  type="time"
                  required
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">End Time</label>
                <input
                  type="time"
                  required
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">Platform</label>
                <select
                  value={scheduleForm.meetingPlatform}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingPlatform: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-blue-500"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-300">Meeting Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/..."
                  value={scheduleForm.meetingLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(cancelSessionItem)}
        eyebrow="Cancel session"
        title="Are you sure you want to cancel?"
        description="Please provide a reason for cancelling this session. If you cancel an accepted or scheduled session, escrowed credits will be fully refunded to the learner."
        onClose={() => setCancelSessionItem(null)}
        maxWidth="max-w-2xl"
        footer={
          <div className="modal-action-row flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={() => setCancelSessionItem(null)}
              className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Close
            </button>
            <button
              type="submit"
              form="cancel-session-form"
              disabled={cancelSessionItem && actionLoading === `${cancelSessionItem._id}-cancel`}
              className="rounded-2xl bg-red-500 px-6 py-4 font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 disabled:opacity-60"
            >
              {cancelSessionItem && actionLoading === `${cancelSessionItem._id}-cancel` ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        }
      >
        {cancelSessionItem && (
          <form id="cancel-session-form" onSubmit={submitCancel} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Cancellation Reason</label>
              <textarea
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="4"
                placeholder="E.g., Emergency came up, internet issue, need to reschedule..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-red-500"
              />
              <p className="mt-2 text-xs text-slate-500">Minimum 10 characters required.</p>
            </div>
          </form>
        )}
      </Modal>
    </main>
  );
}

export default Sessions;
