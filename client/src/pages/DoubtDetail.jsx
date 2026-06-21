import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowUp, ArrowDown, MessageSquare, Eye, Bookmark, 
  CheckCircle, Loader2, Share2, MoreHorizontal, Users, Plus, Trash2
} from "lucide-react";
import { apiRequest } from "../api/api";
import CommunitySidebar from "../components/CommunitySidebar";

function DoubtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState("");
  const [similarDoubts, setSimilarDoubts] = useState([]);
  const [communityStats, setCommunityStats] = useState({ students: 0, doubts: 0, answers: 0 });
  const [showDoubtMenu, setShowDoubtMenu] = useState(false);
  
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDoubt();
    fetchCommunityStats();
  }, [id]);

  const fetchDoubt = async () => {
    try {
      const data = await apiRequest(`/doubts/${id}`, { token });
      if (data && data.success && data.doubt) {
        setDoubt(data.doubt);
        // Fetch similar doubts after we have the main doubt
        fetchSimilarDoubts();
      } else {
        setDoubt(null);
      }
    } catch (error) {
      console.error("Failed to fetch doubt", error);
      setDoubt(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarDoubts = async () => {
    try {
      const data = await apiRequest(`/doubts/${id}/similar`, { token });
      if (data && data.success) {
        setSimilarDoubts(data.doubts || []);
      }
    } catch (error) {
      console.error("Failed to fetch similar doubts", error);
    }
  };

  const fetchCommunityStats = async () => {
    try {
      const data = await apiRequest(`/doubts/stats`, { token });
      if (data && data.success) {
        setCommunityStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch community stats", error);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleUpvoteDoubt = async () => {
    if (!currentUser) return;
    try {
      const data = await apiRequest(`/doubts/${id}/upvote`, { method: "PUT", token });
      if (data.success) {
        setDoubt(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            upvotes: data.hasUpvoted 
              ? [...(prev.upvotes || []), currentUser.id] 
              : (prev.upvotes || []).filter(uid => uid !== currentUser.id),
            downvotes: data.hasUpvoted
              ? (prev.downvotes || []).filter(uid => uid !== currentUser.id)
              : prev.downvotes
          };
        });
        showToast(data.hasUpvoted ? "Upvoted!" : "Upvote removed");
      } else if (data.message) {
        showToast(data.message);
      }
    } catch (error) {
      console.error("Failed to upvote", error);
      showToast("Cannot upvote your own doubt");
    }
  };

  const handleDownvoteDoubt = async () => {
    if (!currentUser) return;
    try {
      const data = await apiRequest(`/doubts/${id}/downvote`, { method: "PUT", token });
      if (data.success) {
        setDoubt(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            downvotes: data.hasDownvoted 
              ? [...(prev.downvotes || []), currentUser.id] 
              : (prev.downvotes || []).filter(uid => uid !== currentUser.id),
            upvotes: data.hasDownvoted
              ? (prev.upvotes || []).filter(uid => uid !== currentUser.id)
              : prev.upvotes
          };
        });
        showToast(data.hasDownvoted ? "Downvoted!" : "Downvote removed");
      } else if (data.message) {
        showToast(data.message);
      }
    } catch (error) {
      console.error("Failed to downvote", error);
      showToast("Cannot downvote your own doubt");
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) return;
    try {
      const data = await apiRequest(`/doubts/${id}/bookmark`, { method: "PUT", token });
      if (data.success) {
        setIsBookmarked(data.isBookmarked);
        showToast(data.isBookmarked ? "Bookmarked!" : "Bookmark removed");
      }
    } catch (error) {
      console.error("Failed to bookmark", error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link copied to clipboard!");
    }).catch(() => {
      showToast("Failed to copy link");
    });
  };

  const handleDeleteDoubt = async () => {
    if (!window.confirm("Are you sure you want to delete this doubt? This action cannot be undone.")) return;
    try {
      const data = await apiRequest(`/doubts/${id}`, { method: "DELETE", token });
      if (data.success) {
        navigate("/community");
      } else {
        showToast(data.message || "Failed to delete doubt");
      }
    } catch (error) {
      console.error("Failed to delete doubt", error);
      showToast("An error occurred");
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const data = await apiRequest(`/doubts/replies/${replyId}`, { method: "DELETE", token });
      if (data.success) {
        setDoubt(prev => {
          if (!prev) return prev;
          // Filter out the reply from the list
          const newReplies = (prev.replies || []).filter(r => r._id !== replyId);
          return { ...prev, replies: newReplies };
        });
        showToast("Reply deleted");
      } else {
        showToast(data.message || "Failed to delete reply");
      }
    } catch (error) {
      console.error("Failed to delete reply", error);
      showToast("An error occurred");
    }
  };

  const handleUpvoteReply = async (replyId) => {
    if (!currentUser) return;
    try {
      const data = await apiRequest(`/doubts/replies/${replyId}/upvote`, { method: "PUT", token });
      if (data.success) {
        setDoubt(prev => {
          if (!prev) return prev;
          const newReplies = (prev.replies || []).map(r => {
            if (r._id === replyId) {
              return {
                ...r,
                upvotes: data.hasUpvoted 
                  ? [...(r.upvotes || []), currentUser.id] 
                  : (r.upvotes || []).filter(uid => uid !== currentUser.id),
                downvotes: data.hasUpvoted
                  ? (r.downvotes || []).filter(uid => uid !== currentUser.id)
                  : r.downvotes
              };
            }
            return r;
          });
          return { ...prev, replies: newReplies };
        });
      }
    } catch (error) {
      console.error("Failed to upvote reply", error);
    }
  };

  const handleDownvoteReply = async (replyId) => {
    if (!currentUser) return;
    try {
      const data = await apiRequest(`/doubts/replies/${replyId}/downvote`, { method: "PUT", token });
      if (data.success) {
        setDoubt(prev => {
          if (!prev) return prev;
          const newReplies = (prev.replies || []).map(r => {
            if (r._id === replyId) {
              return {
                ...r,
                downvotes: data.hasDownvoted 
                  ? [...(r.downvotes || []), currentUser.id] 
                  : (r.downvotes || []).filter(uid => uid !== currentUser.id),
                upvotes: data.hasDownvoted
                  ? (r.upvotes || []).filter(uid => uid !== currentUser.id)
                  : r.upvotes
              };
            }
            return r;
          });
          return { ...prev, replies: newReplies };
        });
      }
    } catch (error) {
      console.error("Failed to downvote reply", error);
    }
  };

  const handleAcceptAnswer = async (replyId) => {
    if (!currentUser || doubt?.author?._id !== currentUser.id) return;
    try {
      const data = await apiRequest(`/doubts/${id}/replies/${replyId}/accept`, { method: "PUT", token });
      if (data.success) {
        setDoubt(prev => {
          if (!prev) return prev;
          const newReplies = (prev.replies || []).map(r => ({
            ...r,
            isAccepted: r._id === replyId
          }));
          return { ...prev, replies: newReplies, acceptedAnswer: replyId };
        });
      }
    } catch (error) {
      console.error("Failed to accept answer", error);
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setIsReplying(true);
      const formData = new FormData();
      formData.append("content", replyContent);
      if (replyingTo) {
        formData.append("parentReplyId", replyingTo);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/doubts/${id}/replies`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setReplyContent("");
        setReplyingTo(null);
        fetchDoubt();
      }
    } catch (error) {
      console.error("Failed to post reply", error);
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!doubt || typeof doubt !== 'object') {
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-2xl font-bold">Doubt not found</h2>
        <Link to="/community" className="mt-4 inline-block text-blue-400 hover:underline">Go back to Community</Link>
      </div>
    );
  }

  const hasUpvotedDoubt = currentUser && (doubt.upvotes || []).includes(currentUser?.id);
  const hasDownvotedDoubt = currentUser && (doubt.downvotes || []).includes(currentUser?.id);
  const doubtNetScore = (doubt.upvotes || []).length - (doubt.downvotes || []).length;
  const topLevelReplies = (doubt.replies || []).filter(r => r && !r.parentReply);
  const nestedReplies = (doubt.replies || []).filter(r => r && r.parentReply);

  topLevelReplies.sort((a, b) => {
    if (a.isAccepted) return -1;
    if (b.isAccepted) return 1;
    const aVotes = (a.upvotes || []).length - (a.downvotes || []).length;
    const bVotes = (b.upvotes || []).length - (b.downvotes || []).length;
    if (bVotes !== aVotes) return bVotes - aVotes;
    
    const aDate = a.createdAt ? new Date(a.createdAt) : new Date();
    const bDate = b.createdAt ? new Date(b.createdAt) : new Date();
    return bDate - aDate;
  });

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return typeof avatar === 'string' && avatar.startsWith('http') 
      ? avatar 
      : `http://localhost:5000/uploads/avatars/${avatar}`;
  };

  const safeTags = doubt.tags || [];
  const safeImages = doubt.images || [];

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-2xl animate-bounce">
          {toast}
        </div>
      )}
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8 flex items-start gap-8">
      {/* Left Sidebar */}
      <div className="hidden lg:block">
        <CommunitySidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl min-w-0">
        <Link to="/community" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
          <span>&larr;</span> Back to all doubts
        </Link>

        {/* Doubt Card */}
        <div className="rounded-2xl border border-white/5 bg-[#0B1020] p-6 lg:p-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white leading-snug">{doubt.title || "Untitled"}</h1>
          
          <div className="mt-4 flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {doubt.author?.avatar ? (
                  <img src={getAvatarUrl(doubt.author.avatar)} alt="Avatar" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white">
                    {doubt.author?.name?.charAt(0) || "A"}
                  </div>
                )}
                <span className="text-sm font-bold text-white">{doubt.author?.name || "Anonymous"}</span>
              </div>
              <span className="text-sm text-slate-500">•</span>
              <span className="text-sm text-slate-400">
                {doubt.createdAt ? formatDistanceToNow(new Date(doubt.createdAt), { addSuffix: true }) : "just now"}
              </span>
              <span className="text-sm text-slate-500">•</span>
              <span className="text-sm font-semibold text-blue-400">{safeTags[0] || "General"}</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-1.5 text-sm">
                <Eye size={16} /> {doubt.views || 0} views
              </div>
              <button onClick={handleBookmark} className={`hover:text-white transition-colors ${isBookmarked ? 'text-blue-400' : ''}`}>
                <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              
              <div className="relative">
                <button onClick={() => setShowDoubtMenu(!showDoubtMenu)} className="hover:text-white transition-colors">
                  <MoreHorizontal size={16} />
                </button>
                {showDoubtMenu && (
                  <div className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#0B1020] shadow-xl z-10">
                    <div className="py-1">
                      {currentUser?.id === doubt.author?._id ? (
                        <button onClick={handleDeleteDoubt} className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-white/[0.04]">
                          <Trash2 size={14} /> Delete
                        </button>
                      ) : (
                        <button onClick={() => setShowDoubtMenu(false)} className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-white/[0.04]">
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap">
            {doubt.description}
          </div>

          {safeImages.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {safeImages.map((img, idx) => (
                <a key={idx} href={img} target="_blank" rel="noreferrer" className="block max-w-full">
                  <img src={img} alt={`Attachment ${idx}`} className="max-h-80 rounded-xl border border-white/10 object-cover" />
                </a>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {safeTags.map(tag => (
              <Link key={tag} to={`/community?tag=${tag}`} className="rounded-full bg-white/[0.03] border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/[0.06] transition-colors cursor-pointer">
                {String(tag).toLowerCase()}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center gap-3 rounded-full bg-white/[0.03] border border-white/5 px-1 py-1">
              <button onClick={handleUpvoteDoubt} className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${hasUpvotedDoubt ? 'bg-orange-500/20 text-orange-500' : 'text-slate-500 hover:bg-white/5'}`}>
                <ArrowUp size={16} strokeWidth={3} />
              </button>
              <span className="text-sm font-bold text-white">{doubtNetScore}</span>
              <button onClick={handleDownvoteDoubt} className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${hasDownvotedDoubt ? 'bg-blue-500/20 text-blue-500' : 'text-slate-500 hover:bg-white/5'}`}>
                <ArrowDown size={16} strokeWidth={3} />
              </button>
            </div>
            
            <button onClick={() => document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              <MessageSquare size={18} />
              {(doubt.replies || []).length}
            </button>
            
            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>

        {/* Answers Header */}
        <div className="mt-8 mb-4 flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-white">{(doubt.replies || []).length} Answers</h2>
          <button className="text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            Oldest <ArrowDown size={14} />
          </button>
        </div>

        {/* Replies List */}
        <div className="flex flex-col gap-4">
          {topLevelReplies.map(reply => (
            <ReplyItem 
              key={reply._id}
              reply={reply}
              isDoubtAuthor={currentUser?.id === doubt.author?._id}
              currentUser={currentUser}
              nestedReplies={nestedReplies.filter(r => r.parentReply?._id === reply._id)}
              onUpvote={() => handleUpvoteReply(reply._id)}
              onDownvote={() => handleDownvoteReply(reply._id)}
              onNestedUpvote={(nestedId) => handleUpvoteReply(nestedId)}
              onNestedDownvote={(nestedId) => handleDownvoteReply(nestedId)}
              onAccept={() => handleAcceptAnswer(reply._id)}
              onDelete={() => handleDeleteReply(reply._id)}
              onReplyClick={() => {
                setReplyingTo(reply._id);
                document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onShare={handleShare}
              getAvatarUrl={getAvatarUrl}
            />
          ))}
        </div>

        {/* Reply Form */}
        <div id="reply-form" className="mt-8 rounded-2xl border border-white/5 bg-[#0B1020] p-6 lg:p-8">
          <h3 className="mb-4 text-base font-bold text-white">
            {replyingTo ? "Replying to comment" : "Your Answer"}
          </h3>
          
          <form onSubmit={submitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your answer here..."
              className="h-32 w-full resize-none rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none custom-scrollbar"
              required
            />
            <div className="mt-4 flex justify-end gap-3">
              {replyingTo && (
                <button type="button" onClick={() => setReplyingTo(null)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-400 hover:text-white">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={isReplying || !replyContent.trim()} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {isReplying ? <Loader2 size={16} className="animate-spin" /> : "Post Answer"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:flex w-80 shrink-0 flex-col gap-6">
        
        {/* About this question */}
        <div className="rounded-2xl border border-white/5 bg-[#0B1020] p-5">
          <h3 className="mb-4 text-sm font-bold text-white">About this question</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Asked</span>
              <span className="font-semibold text-white">
                {doubt.createdAt ? formatDistanceToNow(new Date(doubt.createdAt), { addSuffix: true }) : "just now"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category</span>
              <span className="font-semibold text-white">{safeTags[0] || "General"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Views</span>
              <span className="font-semibold text-white">{doubt.views || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Net Score</span>
              <span className="font-semibold text-white">{doubtNetScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Answers</span>
              <span className="font-semibold text-white">{(doubt.replies || []).length}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-3">
              <span className="text-slate-400">Last activity</span>
              <span className="font-semibold text-white">just now</span>
            </div>
          </div>
        </div>

        {/* Related Tags */}
        <div className="rounded-2xl border border-white/5 bg-[#0B1020] p-5">
          <h3 className="mb-4 text-sm font-bold text-white">Related Tags</h3>
          <div className="flex flex-wrap gap-2">
            {safeTags.map(tag => (
              <Link key={tag} to={`/community?tag=${tag}`} className="rounded-full bg-white/[0.03] border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors">
                {String(tag).toLowerCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="rounded-2xl border border-white/5 bg-[#0B1020] p-5">
          <h3 className="mb-4 text-sm font-bold text-white">Community Stats</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <Users size={16} className="text-slate-400 mb-1" />
              <span className="text-sm font-bold text-white">{communityStats.students}</span>
              <span className="text-[10px] text-slate-500">Students</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageSquare size={16} className="text-slate-400 mb-1" />
              <span className="text-sm font-bold text-white">{communityStats.doubts}</span>
              <span className="text-[10px] text-slate-500">Doubts</span>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle size={16} className="text-slate-400 mb-1" />
              <span className="text-sm font-bold text-white">{communityStats.answers}</span>
              <span className="text-[10px] text-slate-500">Answers</span>
            </div>
          </div>
        </div>

        {/* Similar Doubts */}
        {similarDoubts.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-[#0B1020] p-5">
            <h3 className="mb-4 text-sm font-bold text-white">Similar Doubts</h3>
            <div className="flex flex-col gap-4">
              {similarDoubts.map((d, idx) => (
                <Link key={d._id} to={`/community/${d._id}`} className="flex flex-col gap-1 group">
                  <span className="text-sm text-slate-300 group-hover:text-blue-400 transition-colors line-clamp-2">{idx + 1}. {d.title}</span>
                  <span className="text-xs text-slate-500">{d.replyCount || 0} answers</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
}

function ReplyItem({ reply, isDoubtAuthor, currentUser, nestedReplies, onUpvote, onDownvote, onNestedUpvote, onNestedDownvote, onAccept, onReplyClick, onShare, onDelete, getAvatarUrl }) {
  const hasUpvoted = currentUser && (reply.upvotes || []).includes(currentUser.id);
  const hasDownvoted = currentUser && (reply.downvotes || []).includes(currentUser.id);
  const replyNetScore = (reply.upvotes || []).length - (reply.downvotes || []).length;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`relative flex gap-4 rounded-2xl bg-[#0B1020] p-4 lg:p-6 ${reply.isAccepted ? 'border border-green-500/30' : 'border border-white/5'}`}>
      
      {/* Left Vote Bar */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button onClick={onUpvote} className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${hasUpvoted ? 'text-orange-500 bg-orange-500/10' : 'text-slate-500 hover:bg-white/5'}`}>
          <ArrowUp size={18} strokeWidth={3} />
        </button>
        <span className="text-sm font-bold text-white">{replyNetScore}</span>
        <button onClick={onDownvote} className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${hasDownvoted ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500 hover:bg-white/5'}`}>
          <ArrowDown size={18} strokeWidth={3} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {reply.author?.avatar ? (
                <img src={getAvatarUrl(reply.author.avatar)} alt="Avatar" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-[10px] font-black text-white">
                  {reply.author?.name?.charAt(0) || "A"}
                </div>
              )}
              <span className="text-sm font-bold text-white">{reply.author?.name || "Anonymous"}</span>
            </div>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">
              {reply.createdAt ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true }) : "just now"}
            </span>
            
            {reply.isAccepted && (
              <span className="ml-2 flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold text-green-400">
                <CheckCircle size={12} /> Accepted Answer
              </span>
            )}
          </div>
          
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-slate-500 hover:text-white transition-colors">
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#0B1020] shadow-xl z-10">
                <div className="py-1">
                  {currentUser?.id === reply.author?._id ? (
                    <button onClick={onDelete} className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-white/[0.04]">
                      <Trash2 size={14} /> Delete
                    </button>
                  ) : (
                    <button onClick={() => setShowMenu(false)} className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-white/[0.04]">
                      Report
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {reply.content}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-4">
          <button onClick={onUpvote} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${hasUpvoted ? 'text-orange-500' : 'text-slate-400 hover:text-white'}`}>
            <ArrowUp size={14} /> {replyNetScore}
          </button>
          <button onClick={onDownvote} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${hasDownvoted ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>
            <ArrowDown size={14} />
          </button>
          <button onClick={onReplyClick} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <MessageSquare size={14} /> Reply
          </button>
          <button onClick={onShare} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <Share2 size={14} /> Share
          </button>

          {isDoubtAuthor && !reply.isAccepted && currentUser?.id !== reply.author?._id && (
            <button onClick={onAccept} className="ml-auto text-xs font-bold text-slate-500 hover:text-green-400 transition-colors">
              Accept
            </button>
          )}
        </div>

        {/* Nested Replies */}
        {nestedReplies && nestedReplies.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 border-l border-white/10 pl-4">
            {nestedReplies.map(nested => (
              <div key={nested._id} className="text-sm flex gap-3">
                {/* Nested Vote */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button onClick={() => onNestedUpvote(nested._id)} className={`rounded-full p-0.5 transition-colors ${currentUser && (nested.upvotes || []).includes(currentUser.id) ? 'text-orange-500 bg-orange-500/10' : 'text-slate-500 hover:bg-white/5'}`}>
                    <ArrowUp size={12} strokeWidth={3} />
                  </button>
                  <span className="text-[10px] font-bold text-white">{(nested.upvotes || []).length - (nested.downvotes || []).length}</span>
                  <button onClick={() => onNestedDownvote(nested._id)} className={`rounded-full p-0.5 transition-colors ${currentUser && (nested.downvotes || []).includes(currentUser.id) ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500 hover:bg-white/5'}`}>
                    <ArrowDown size={12} strokeWidth={3} />
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {nested.author?.avatar ? (
                        <img src={getAvatarUrl(nested.author.avatar)} alt="Avatar" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[10px] font-black text-white">
                          {nested.author?.name?.charAt(0) || "K"}
                        </div>
                      )}
                      <span className="text-xs font-bold text-white">{nested.author?.name || "Anonymous"}</span>
                      <span className="text-[10px] text-slate-500">
                        {nested.createdAt ? formatDistanceToNow(new Date(nested.createdAt), { addSuffix: true }) : "just now"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">{nested.content}</div>
                  <div className="mt-2 flex items-center gap-4">
                    <button onClick={() => {
                        onReplyClick();
                    }} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-white transition-colors">
                      <MessageSquare size={12} /> Reply
                    </button>
                    <button onClick={onShare} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-white transition-colors">
                      <Share2 size={12} /> Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default DoubtDetail;
