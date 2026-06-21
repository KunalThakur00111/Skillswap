import { Link, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTags = searchParams.get("tag") ? searchParams.get("tag").split(",") : [];

  const handleTagToggle = (tagName) => {
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter((t) => t !== tagName)
      : [...currentTags, tagName];

    const newParams = new URLSearchParams(searchParams);
    if (newTags.length > 0) {
      newParams.set("tag", newTags.join(","));
    } else {
      newParams.delete("tag");
    }
    // We navigate by setting search params
    setSearchParams(newParams);
  };

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
        <h3 className="mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Categories</h3>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const isActive = currentTags.includes(cat.name);
            return (
              <button
                key={cat.name}
                onClick={() => handleTagToggle(cat.name)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-1 rounded-full ${cat.color}`}></div>
                  <span className={`transition-colors ${isActive ? "text-white font-semibold" : "text-slate-300 group-hover:text-white"}`}>
                    {cat.name}
                  </span>
                </div>
              </button>
            );
          })}
          <button className="mt-2 text-left text-xs font-semibold text-slate-500 hover:text-slate-300 px-3">
            Show more ∨
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Tags</h3>
        <div className="flex flex-wrap gap-2 px-1">
          {POPULAR_TAGS.map((tag) => {
            const isActive = currentTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  isActive
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-400 font-bold"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {tag}
              </button>
            );
          })}
          <button className="mt-2 text-left text-xs font-semibold text-slate-500 hover:text-slate-300 px-1 block w-full">
            Show more ∨
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunitySidebar;
