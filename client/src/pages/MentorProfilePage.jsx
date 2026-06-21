import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import UserAvatar from "../components/ui/UserAvatar";
import BookingWidget from "../components/BookingWidget";

function MentorProfilePage() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  
  const [mentor, setMentor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true);
        // Using the public endpoint we created
        const data = await apiRequest(`/public/mentors/${id}`);
        setMentor(data.mentor);
        setReviews(data.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-white/10 mb-4" />
          <div className="h-6 w-48 rounded bg-white/10 mb-2" />
          <div className="h-4 w-32 rounded bg-white/10" />
        </div>
      </main>
    );
  }

  if (error || !mentor) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-xl font-bold text-red-400">{error || "Mentor not found"}</p>
        <Link to="/explore" className="mt-4 text-blue-400 hover:underline">← Back to Explore</Link>
      </main>
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSelf = user.id === mentor._id || user._id === mentor._id;

  if (isSelf) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-xl font-bold text-red-400">You cannot view your own mentor profile.</p>
        <Link to="/dashboard" className="mt-4 text-blue-400 hover:underline">← Back to Dashboard</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
      <Link to="/explore" className="mb-8 inline-block text-sm font-bold text-slate-400 hover:text-white transition-colors">
        ← Back to Marketplace
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_450px]">
        {/* Left Column: Profile Info */}
        <div className="space-y-10">
          
          {/* Header Profile */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <UserAvatar name={mentor.name} src={mentor.avatar} size="xl" />
            <div>
              <h1 className="text-4xl font-black text-white">{mentor.name}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-bold">
                <span className="flex items-center gap-1 text-yellow-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {mentor.rating ? mentor.rating.toFixed(1) : "New"}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-300">{mentor.completedSessions || 0} Sessions</span>
                <span className="text-slate-500">•</span>
                <span className="text-green-300">{mentor.reputation || 0} Reputation</span>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                {mentor.bio || "This mentor is ready to help you learn and grow!"}
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Teaching Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(mentor.teachSkills || []).map((skill) => (
                <span key={skill} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">
                  {skill}
                </span>
              ))}
              {mentor.teachSkills?.length === 0 && <p className="text-slate-500 italic">No skills listed yet.</p>}
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Student Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-slate-500 italic">No reviews yet. Be the first to book a session!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} className="rounded-2xl border border-white/5 bg-slate-900/50 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                         <UserAvatar name={review.learner?.name} size="sm" />
                         <span className="font-bold">{review.learner?.name}</span>
                         <span className="text-xs text-slate-500">for {review.skill}</span>
                      </div>
                      <span className="flex text-yellow-400 text-xs">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span>
                    </div>
                    <p className="mt-3 text-slate-300 italic">"{review.review}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="relative">
          <div className="sticky top-24 rounded-[2rem] border border-blue-500/20 bg-[#0B1020] shadow-2xl p-6">
             <h2 className="text-2xl font-black mb-6">Book a Session</h2>
             
             {(() => {
               const user = JSON.parse(localStorage.getItem("user") || "{}");
               const isSelf = user.id === mentor._id || user._id === mentor._id;
               
               if (isSelf) {
                 return (
                   <div className="text-center py-8">
                     <p className="text-slate-400 mb-4 font-bold text-red-400">You cannot book a session with yourself.</p>
                   </div>
                 );
               }
               
               if (bookingSuccess) {
                 return (
                   <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400 mb-4">
                       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <h3 className="font-bold text-green-400 mb-2">Request Sent!</h3>
                     <p className="text-sm text-green-200">{bookingSuccess}</p>
                     <button onClick={() => setBookingSuccess("")} className="mt-6 rounded-xl bg-green-500/20 px-4 py-2 text-sm font-bold text-green-400 hover:bg-green-500/30">Book Another</button>
                   </div>
                 );
               }
               
               if (token) {
                 return (
                   <BookingWidget 
                     mentor={mentor} 
                     onClose={() => {}} 
                     onSuccess={(msg) => setBookingSuccess(msg)} 
                   />
                 );
               }
               
               return (
                 <div className="text-center py-8">
                   <p className="text-slate-400 mb-4">You must be logged in to book sessions.</p>
                   <Link to="/login" className="rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600">Login to Book</Link>
                 </div>
               );
             })()}
          </div>
        </div>

      </div>
    </main>
  );
}

export default MentorProfilePage;
