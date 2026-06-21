import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Search, MessageSquare, ArrowUp, CheckCircle, Eye, X } from "lucide-react";
import { useDoubts } from "../hooks/queries/useDoubts";
import CommunitySidebar from "../components/CommunitySidebar";
import DoubtCardSkeleton from "../components/skeletons/DoubtCardSkeleton";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most_upvoted", label: "Most Upvoted" },
  { value: "most_replied", label: "Most Replied" },
  { value: "most_viewed", label: "Most Viewed" },
  { value: "trending", label: "Trending" },
];

function Community({ isBookmarksPage = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  // URL derived state
  const tagFilter = searchParams.get("tag") || "";
  const sortFilter = searchParams.get("sort") || "newest";
  const searchFilter = searchParams.get("search") || "";
  
  const [search, setSearch] = useState(searchFilter);
  const [sort, setSort] = useState(sortFilter);
  const [page, setPage] = useState(1);

  const activeTags = tagFilter ? tagFilter.split(",") : [];

  const clearFilter = (type) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(type);
    setSearchParams(newParams);
    if (type === "search") setSearch("");
  };

  const removeTagFilter = (tagToRemove) => {
    const newTags = activeTags.filter((t) => t !== tagToRemove);
    const newParams = new URLSearchParams(searchParams);
    if (newTags.length > 0) {
      newParams.set("tag", newTags.join(","));
    } else {
      newParams.delete("tag");
    }
    setSearchParams(newParams);
  };

  const { data: response, isLoading: loading, error, isError } = useDoubts({
    page,
    limit: 10,
    sort,
    search,
    tag: tagFilter,
    bookmarked: isBookmarksPage ? "true" : undefined
  });

  const doubts = response?.data || [];
  const meta = response?.meta || { totalPages: 1, page: 1 };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8 flex items-start gap-8">
      {/* Left Sidebar */}
      <div className="hidden lg:block">
        <CommunitySidebar />
      </div>

      {/* Main Feed Content */}
      <div className="flex-1 min-w-0 max-w-4xl">
        {isBookmarksPage && (
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">Your Bookmarks</h1>
            <p className="text-sm text-slate-400 mt-1">Saved doubts for quick reference</p>
          </div>
        )}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search doubts, topics, users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0B1020] px-4 py-2.5 text-sm font-semibold text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Filters Header (Optional) */}
        {(activeTags.length > 0 || searchFilter) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-400">Filtering by:</span>
            {activeTags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                Tag: {tag}
                <button onClick={() => removeTagFilter(tag)} className="ml-1 rounded-full p-0.5 hover:bg-blue-500/20 text-blue-400 transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
            {searchFilter && (
              <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                Search: {searchFilter}
                <button onClick={() => clearFilter("search")} className="ml-1 rounded-full p-0.5 hover:bg-blue-500/20 text-blue-400 transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Doubts List */}
        <div className="flex flex-col gap-4">
          {isError && (
             <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error?.message || "Failed to load doubts"}
             </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-4">
               {[1, 2, 3, 4].map(i => <DoubtCardSkeleton key={i} />)}
            </div>
          ) : doubts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-white/5 bg-[#0B1020]">
              <MessageSquare size={48} className="mb-4 text-slate-600" />
              <h3 className="text-xl font-bold text-white">No doubts found</h3>
              <p className="mt-2 text-slate-400">Try adjusting your filters or ask a new doubt!</p>
            </div>
          ) : (
            doubts.map(doubt => (
              <Link 
                key={doubt._id} 
                to={`/community/${doubt._id}`}
                className="flex gap-4 sm:gap-6 rounded-2xl border border-white/5 bg-[#0B1020] p-5 sm:p-6 transition-all hover:bg-white/[0.03] hover:border-white/10"
              >
                {/* Stats Column (Desktop) */}
                <div className="hidden sm:flex flex-col items-center gap-3 shrink-0 pt-1">
                  <div className="text-center">
                    <span className="block text-base font-bold text-slate-300">{(doubt.upvotes || []).length - (doubt.downvotes || []).length}</span>
                    <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">votes</span>
                  </div>
                  <div className={`text-center rounded-lg px-3 py-1.5 ${doubt.acceptedAnswer ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'text-slate-400 border border-transparent'}`}>
                    <span className="block text-base font-bold">{(doubt.replies || []).length}</span>
                    <span className="text-[10px] font-semibold tracking-wide uppercase">answers</span>
                  </div>
                  <div className="text-center mt-1">
                    <span className="block text-[11px] font-semibold text-orange-400/80">{doubt.views || 0} views</span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-blue-400 line-clamp-2 leading-snug hover:text-blue-300 transition-colors">{doubt.title}</h2>
                  <p className="mt-2 text-sm text-slate-300 line-clamp-2 leading-relaxed">{doubt.description}</p>
                  
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(doubt.tags || []).map(tag => (
                        <span key={tag} className="rounded-md bg-white/[0.04] border border-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-white">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doubt.author?.avatar ? (
                        <img src={doubt.author.avatar.startsWith('http') ? doubt.author.avatar : `http://localhost:5000/uploads/avatars/${doubt.author.avatar}`} alt="Avatar" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[9px] font-black text-white">
                          {doubt.author?.name?.charAt(0) || "A"}
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-blue-400">
                        {doubt.author?.name}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        asked {formatDistanceToNow(new Date(doubt.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="mt-4 flex items-center gap-4 sm:hidden border-t border-white/5 pt-3">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <ArrowUp size={14} /> {(doubt.upvotes || []).length - (doubt.downvotes || []).length}
                      </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${doubt.acceptedAnswer ? 'text-green-400' : 'text-slate-400'}`}>
                      {doubt.acceptedAnswer ? <CheckCircle size={14} /> : <MessageSquare size={14} />} {(doubt.replies || []).length}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-orange-400/80">
                      <Eye size={14} /> {doubt.views || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
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
      </div>
    </div>
  );
}

export default Community;
