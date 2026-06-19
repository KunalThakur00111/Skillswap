import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import UserAvatar from "../components/ui/UserAvatar";

function Reviews() {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("received");
  const [profile, setProfile] = useState(null);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const profileData = await apiRequest("/users/profile", {
        token
      });

      const userId = profileData.user._id || profileData.user.id;

      const givenData = await apiRequest("/reviews/my-given", {
        token
      });

      const receivedData = await apiRequest(`/reviews/mentor/${userId}`, {
        token
      });

      setProfile(profileData.user);
      setGivenReviews(givenData.reviews || []);
      setReceivedReviews(receivedData.reviews || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReviews();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const summary = useMemo(() => {
    const totalRating = receivedReviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    const average =
      receivedReviews.length > 0
        ? (totalRating / receivedReviews.length).toFixed(1)
        : profile?.rating || 0;

    return {
      average,
      received: receivedReviews.length,
      given: givenReviews.length,
      total: receivedReviews.length + givenReviews.length
    };
  }, [receivedReviews, givenReviews, profile]);

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const renderStars = (rating) => {
    const safeRating = Number(rating || 0);
    return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
  };

  const getReviewPerson = (review, type) => {
    if (type === "received") {
      return {
        label: "Reviewed by",
        person: review.reviewer
      };
    }

    return {
      label: "Reviewed mentor",
      person: review.mentor
    };
  };

  const reviewsToShow =
    activeTab === "received" ? receivedReviews : givenReviews;

  return (
    <main>
      <PageHeader
        eyebrow="Reviews"
        title="Review center"
        description="Track feedback you received as a mentor and reviews you submitted after learning sessions."
        actions={
          <Link
            to="/sessions"
            className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-200"
          >
            Manage sessions
          </Link>
        }
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard
          label="Average rating"
          value={summary.average}
          helper="Based on received reviews"
          tone="yellow"
        />

        <StatCard
          label="Received"
          value={summary.received}
          helper="Learner feedback"
          tone="green"
        />

        <StatCard
          label="Given"
          value={summary.given}
          helper="Your submitted reviews"
          tone="purple"
        />

        <StatCard
          label="Total reviews"
          value={summary.total}
          helper="Overall review activity"
          tone="blue"
        />
      </section>

      <SectionCard
        className="mt-8"
        title="Review activity"
        description="Switch between feedback you received as a mentor and reviews you gave as a learner."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("received")}
              className={
                activeTab === "received"
                  ? "rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]"
              }
            >
              Received · {receivedReviews.length}
            </button>

            <button
              onClick={() => setActiveTab("given")}
              className={
                activeTab === "given"
                  ? "rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]"
              }
            >
              Given · {givenReviews.length}
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="text-slate-400">Loading reviews...</p>
        ) : reviewsToShow.length === 0 ? (
          <EmptyState
            title={
              activeTab === "received"
                ? "No reviews received yet"
                : "No reviews given yet"
            }
            description={
              activeTab === "received"
                ? "Complete teaching sessions to receive feedback from learners."
                : "After completing a session as a learner, submit your review from the Sessions page."
            }
            action={
              <Link
                to={activeTab === "received" ? "/profile" : "/sessions"}
                className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
              >
                {activeTab === "received" ? "Update profile" : "View sessions"}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {reviewsToShow.map((review) => {
              const personInfo = getReviewPerson(review, activeTab);
              const person = personInfo.person;

              return (
                <article
                  key={review._id}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <UserAvatar
                      name={person?.name}
                      src={person?.avatar}
                      size="md"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-black text-yellow-300">
                          {renderStars(review.rating)}
                        </p>

                        <StatusBadge status="completed">
                          {review.rating}/5
                        </StatusBadge>

                        {review.session?.skill && (
                          <StatusBadge status="default">
                            {review.session.skill}
                          </StatusBadge>
                        )}
                      </div>

                      <p className="mt-4 leading-7 text-slate-300">
                        {review.comment || "No comment added."}
                      </p>

                      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-sm text-slate-500">
                          {personInfo.label}
                        </p>

                        <p className="mt-1 font-semibold text-slate-200">
                          {person?.name || "Unknown user"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </main>
  );
}

export default Reviews;