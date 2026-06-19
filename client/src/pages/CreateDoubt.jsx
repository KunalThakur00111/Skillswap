import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { apiRequest } from "../api/api";

const CATEGORIES = ["DSA", "Web Development", "AI/ML", "DBMS", "Operating Systems", "Networking", "Java", "C++", "JavaScript"];

function CreateDoubt() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024); // 5MB limit
    if (validFiles.length !== files.length) {
      setError("Some files exceed the 5MB limit");
    }

    setImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleTag = (tag) => {
    setTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isAnonymous", isAnonymous);
      formData.append("tags", JSON.stringify(tags));
      
      images.forEach(img => {
        formData.append("images", img);
      });

      // Using fetch directly because we need to send FormData
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/doubts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/community/${data.doubt._id}`);
      } else {
        setError(data.message || "Failed to create doubt");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          to="/community"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Ask a Doubt</h1>
          <p className="text-slate-400">Get help from the community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        {error && (
          <div className="rounded-2xl bg-red-500/10 p-4 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-white">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., How does Dijkstra's algorithm work?"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            maxLength={200}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-white">Description <span className="text-red-500">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your doubt in detail..."
            className="h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:border-blue-500 focus:outline-none custom-scrollbar"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-white">Images (Optional, Max 5)</label>
          
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-2">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/10">
                  <img src={preview} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < 5 && (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] py-6 text-slate-400 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-400 transition-colors">
              <ImageIcon size={24} />
              <span className="font-semibold">Click to upload images</span>
              <input 
                type="file" 
                multiple 
                accept="image/jpeg,image/png,image/jpg,image/webp" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-white">Tags</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleTag(cat)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                  tags.includes(cat)
                    ? "border-blue-500 bg-blue-500/10 text-blue-400" 
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 pt-6">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-5 w-5 rounded border-white/20 bg-white/[0.03] text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-950"
          />
          <label htmlFor="anonymous" className="text-sm font-bold text-slate-300 select-none">
            Post Anonymously (Admins can still see your identity)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 py-4 font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : "Post Doubt"}
        </button>
      </form>
    </div>
  );
}

export default CreateDoubt;
