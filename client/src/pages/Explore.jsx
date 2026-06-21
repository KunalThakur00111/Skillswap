import { useState } from "react";
import { Link } from "react-router-dom";
import { useMentors } from "../hooks/queries/useMentors";
import PageHeader from "../components/ui/PageHeader";
import UserAvatar from "../components/ui/UserAvatar";
import EmptyState from "../components/ui/EmptyState";
import MentorCardSkeleton from "../components/skeletons/MentorCardSkeleton";

// Phase 4: Primary Skills Catalog
const PRIMARY_SKILLS = [
  "DSA", "C++", "Java", "Python", "JavaScript", "React", "Node.js", "MongoDB", 
  "DBMS", "Operating Systems", "Computer Networks", "System Design", 
  "AI/ML", "Data Science", "DevOps", "Cloud Computing", "Android Development", "Web Development"
];

function Explore() {
  const token = localStorage.getItem("token");
  
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [sort, setSort] = useState("recommended");
  const [minRating, setMinRating] = useState("0");
  const [page, setPage] = useState(1);

  const { data: response, isLoading: loading, error, isError } = useMentors({
      search,
      skill: selectedSkill,
      sort,
      minRating: minRating !== "0" ? minRating : undefined,
      page,
      limit: 12
  });

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser.id || storedUser._id;
  
  console.log("CURRENT USER", currentUserId);

  const rawMentors = response?.data || [];
  
  console.log(
    "MENTORS",
    rawMentors.map(m => ({
      id: m._id,
      name: m.name,
      email: m.email
    }))
  );

  const filteredMentors = rawMentors.filter(m => m._id !== currentUserId);

  console.log(
    "FILTERED",
    filteredMentors.map(m => ({
      id: m._id,
      name: m.name
    }))
  );
  
  const mentors = filteredMentors;
  
  const meta = response?.meta || { totalPages: 1, page: 1 };

  return (
    <main>
      <PageHeader
        eyebrow="Marketplace"
        title="Discover Mentors"
        description="Search by skill, filter by reputation, and find the perfect campus peer to help you learn."
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[280px_1fr] items-start">
        
        {/* Left Sidebar: Filters */}
        <aside className="sticky top-24 space-y-8 rounded-[2rem] border border-white/5 bg-slate-900/50 p-6">
          <div>
            <h3 className="font-bold text-white mb-4">Search</h3>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Name, bio, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Categories</h3>
              {selectedSkill && (
                <button onClick={() => setSelectedSkill("")} className="text-xs text-blue-400 hover:text-blue-300">Clear</button>
              )}
            </div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {PRIMARY_SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill === selectedSkill ? "" : skill)}
                  className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedSkill === skill 
                      ? "bg-blue-500/20 text-blue-400 font-bold" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
             <h3 className="font-bold text-white mb-4">Sort By</h3>
             <select 
               value={sort}
               onChange={(e) => setSort(e.target.value)}
               className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-blue-500"
             >
               <option value="recommended">Recommended (Ranking Score)</option>
               <option value="rating">Highest Rated</option>
               <option value="sessions">Most Sessions Taught</option>
               <option value="reputation">Highest Reputation</option>
               <option value="newest">Newest Mentors</option>
             </select>
          </div>

          <div>
             <h3 className="font-bold text-white mb-4">Minimum Rating</h3>
             <input 
               type="range" 
               min="0" max="5" step="0.5" 
               value={minRating}
               onChange={(e) => setMinRating(e.target.value)}
               className="w-full accent-blue-500"
             />
             <div className="mt-2 text-xs font-bold text-slate-400 text-center">
               {minRating === "0" ? "Any Rating" : `${minRating} Stars & Up`}
             </div>
          </div>
        </aside>

        {/* Right Content: Mentors Grid */}
        <section>
          {isError && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-200">{error?.message || "Failed to load mentors"}</p>
            </div>
          )}

          {loading ? (
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <MentorCardSkeleton key={i} />
                ))}
             </div>
          ) : mentors.length === 0 ? (
            <EmptyState
              title="No mentors found"
              description="Try adjusting your filters or search terms."
              action={<button onClick={() => { setSearch(""); setSelectedSkill(""); setMinRating("0"); setPage(1); }} className="rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600">Clear all filters</button>}
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {mentors.map((mentor) => (
                <div key={mentor._id} className="group relative flex flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-blue-500/40 hover:bg-white/[0.04]">
                  
                  <div>
                    <div className="flex items-start justify-between">
                      <UserAvatar name={mentor.name} src={mentor.avatar} size="lg" />
                      {mentor.rating >= 4.8 && mentor.completedSessions > 5 && (
                        <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-bold text-yellow-400">Top Rated</span>
                      )}
                    </div>
                    
                    <h3 className="mt-4 text-xl font-black text-white">{mentor.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        {mentor.rating ? mentor.rating.toFixed(1) : "New"}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-blue-300">{mentor.completedSessions || 0} sessions</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-green-300">{mentor.reputation || 0} rep</span>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-400">
                      {mentor.bio || "This mentor is ready to help you learn!"}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(mentor.teachSkills || []).slice(0, 3).map((skill) => (
                        <span key={skill} className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">
                          {skill}
                        </span>
                      ))}
                      {(mentor.teachSkills?.length > 3) && (
                        <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-500">
                          +{mentor.teachSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link 
                    to={`/mentors/${mentor._id}`}
                    className="mt-6 block w-full rounded-xl bg-white/[0.05] px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-blue-500"
                  >
                    View Profile
                  </Link>

                </div>
              ))}
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
                  <span className="px-4 py-2 text-slate-400">
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
        </section>

      </div>
    </main>
  );
}

export default Explore;
