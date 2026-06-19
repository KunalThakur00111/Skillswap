import { Link, useLocation } from "react-router-dom";
import { MessageSquare, TrendingUp, ArrowUpCircle, CheckCircle, HelpCircle, Bookmark, Plus } from "lucide-react";

const CATEGORIES = [
  { name: "DSA", color: "bg-purple-500" },
  { name: "Web Development", color: "bg-pink-500" },
  { name: "Database", color: "bg-green-500" },
  { name: "Operating Systems", color: "bg-yellow-500" },
  { name: "AI / ML", color: "bg-blue-500" },
  { name: "Mobile Development", color: "bg-cyan-500" },
  { name: "Networking", color: "bg-indigo-500" },
];

const POPULAR_TAGS = ["Arrays", "React", "Python", "Java", "Tree", "DP", "MongoDB", "CSS"];

function CommunitySidebar() {
  const location = useLocation();

  const navItems = [
    { label: "All Doubts", icon: MessageSquare, path: "/community" },
    { label: "Top This Week", icon: TrendingUp, path: "/community?filter=top" },
    { label: "Most Upvoted", icon: ArrowUpCircle, path: "/community?sort=most_upvoted" },
    { label: "Most Answered", icon: CheckCircle, path: "/community?sort=most_replied" },
    { label: "No Answers", icon: HelpCircle, path: "/community?filter=unanswered" },
    { label: "Bookmarks", icon: Bookmark, path: "/community/bookmarks" },
  ];

  return (
    <div className="w-64 shrink-0 flex flex-col gap-8">
      <Link
        to="/community/create"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
      >
        <Plus size={18} />
        Ask a Doubt
      </Link>

      <div>
        <h3 className="mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Browse</h3>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            // Very simple active check
            const isActive = location.pathname === item.path || (item.path !== '/community' && location.search.includes(item.path.split('?')[1]));
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Categories</h3>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/community?tag=${cat.name}`}
              className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-1 rounded-full ${cat.color}`}></div>
                <span className="text-slate-300 group-hover:text-white">{cat.name}</span>
              </div>
            </Link>
          ))}
          <button className="mt-2 text-left text-xs font-semibold text-slate-500 hover:text-slate-300 px-3">
            Show more ∨
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Tags</h3>
        <div className="flex flex-wrap gap-2 px-1">
          {POPULAR_TAGS.map((tag) => (
            <Link
              key={tag}
              to={`/community?search=${tag}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-white"
            >
              {tag}
            </Link>
          ))}
          <button className="mt-2 text-left text-xs font-semibold text-slate-500 hover:text-slate-300 px-1 block w-full">
            Show more ∨
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunitySidebar;
