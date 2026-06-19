import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import UserAvatar from "../components/ui/UserAvatar";

const SKILL_CATEGORIES = [
  {
    name: "Programming",
    skills: [
      "C",
      "C++",
      "Java",
      "Python",
      "JavaScript",
      "TypeScript",
      "Go",
      "Rust",
      "Kotlin",
      "Swift",
      "Dart",
      "R",
      "MATLAB",
      "Shell Scripting"
    ]
  },
  {
    name: "Web Development",
    skills: [
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Bootstrap",
      "React",
      "Next.js",
      "Vue.js",
      "Angular",
      "Node.js",
      "Express.js",
      "REST APIs",
      "GraphQL",
      "Redux",
      "React Router",
      "WebSockets",
      "Authentication"
    ]
  },
  {
    name: "Databases",
    skills: [
      "MongoDB",
      "MySQL",
      "PostgreSQL",
      "SQLite",
      "Firebase",
      "Redis",
      "Mongoose",
      "Prisma",
      "SQL",
      "Database Design",
      "Indexing",
      "Transactions"
    ]
  },
  {
    name: "CS Fundamentals",
    skills: [
      "DSA",
      "Arrays",
      "Strings",
      "Linked Lists",
      "Stacks",
      "Queues",
      "Trees",
      "Graphs",
      "Dynamic Programming",
      "Greedy",
      "Recursion",
      "Backtracking",
      "Sorting",
      "Searching",
      "Hashing",
      "Time Complexity",
      "OOP",
      "Operating Systems",
      "DBMS",
      "Computer Networks",
      "Compiler Design",
      "System Design"
    ]
  },
  {
    name: "AI, ML and Data",
    skills: [
      "Machine Learning",
      "Deep Learning",
      "Data Science",
      "Data Analysis",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Scikit-learn",
      "TensorFlow",
      "PyTorch",
      "NLP",
      "Computer Vision",
      "Statistics",
      "Probability",
      "Linear Algebra",
      "Power BI",
      "Tableau"
    ]
  },
  {
    name: "Cloud and DevOps",
    skills: [
      "Git",
      "GitHub",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "Google Cloud",
      "Linux",
      "CI/CD",
      "Nginx",
      "Render",
      "Vercel",
      "Netlify",
      "Postman",
      "API Testing"
    ]
  },
  {
    name: "Cybersecurity",
    skills: [
      "Cybersecurity Basics",
      "Network Security",
      "Cryptography",
      "Ethical Hacking",
      "OWASP",
      "JWT Security",
      "Password Hashing",
      "SQL Injection",
      "XSS",
      "Security Testing"
    ]
  },
  {
    name: "App Development",
    skills: [
      "Android Development",
      "iOS Development",
      "Flutter",
      "React Native",
      "Kotlin Android",
      "SwiftUI",
      "Firebase Auth",
      "Mobile UI",
      "App Deployment"
    ]
  },
  {
    name: "Electronics and Electrical",
    skills: [
      "Digital Electronics",
      "Analog Electronics",
      "Microprocessors",
      "Microcontrollers",
      "Arduino",
      "Raspberry Pi",
      "IoT",
      "Embedded Systems",
      "VLSI",
      "Control Systems",
      "Signals and Systems",
      "Power Electronics",
      "Electrical Machines",
      "Circuit Theory"
    ]
  },
  {
    name: "Mechanical and Civil",
    skills: [
      "Engineering Mechanics",
      "Thermodynamics",
      "Fluid Mechanics",
      "Strength of Materials",
      "Machine Design",
      "Manufacturing",
      "AutoCAD",
      "SolidWorks",
      "CATIA",
      "Civil Engineering Basics",
      "Surveying",
      "Structural Analysis",
      "Concrete Technology",
      "Building Planning"
    ]
  },
  {
    name: "Math and Aptitude",
    skills: [
      "Engineering Mathematics",
      "Calculus",
      "Discrete Mathematics",
      "Numerical Methods",
      "Aptitude",
      "Logical Reasoning",
      "Verbal Ability",
      "Placement Preparation",
      "Interview Preparation"
    ]
  },
  {
    name: "Project Skills",
    skills: [
      "MERN Stack",
      "Full Stack Development",
      "Backend Development",
      "Frontend Development",
      "UI Design",
      "Figma",
      "Project Documentation",
      "Resume Building",
      "Technical Writing",
      "Presentation Skills"
    ]
  }
];

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
    teachSkills: [],
    learnSkills: []
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeSkillMode, setActiveSkillMode] = useState("teachSkills");
  const [skillSearch, setSkillSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bookmarkedDoubts, setBookmarkedDoubts] = useState([]);

  const normalizeSkills = (skills) => {
    if (!Array.isArray(skills)) {
      return [];
    }

    return skills
      .map((skill) => String(skill).trim())
      .filter((skill) => skill.length > 0);
  };

  const loadProfile = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/users/profile", {
        token
      });

      const user = data.user;
      setProfile(user);

      // Fetch stats
      const statsData = await apiRequest("/auth/me/stats", { token });
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch bookmarked doubts
      const bookmarksData = await apiRequest("/doubts/bookmarked", { token });
      if (bookmarksData.success) {
        setBookmarkedDoubts(bookmarksData.doubts);
      }

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          isEmailVerified: user.isEmailVerified
        })
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const openEditProfile = () => {
    setMessage("");
    setError("");
    setSkillSearch("");
    setActiveSkillMode("teachSkills");

    setFormData({
      name: profile?.name || "",
      bio: profile?.bio || "",
      avatar: profile?.avatar || "",
      teachSkills: normalizeSkills(profile?.teachSkills),
      learnSkills: normalizeSkills(profile?.learnSkills)
    });

    setShowSettings(false);
    setShowEditProfile(true);
  };

  const closeEditProfile = () => {
    setShowEditProfile(false);
    setSkillSearch("");
    setFormData({
      name: "",
      bio: "",
      avatar: "",
      teachSkills: [],
      learnSkills: []
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const toggleSkill = (field, skill) => {
    setFormData((previous) => {
      const currentSkills = previous[field] || [];
      const exists = currentSkills.some(
        (item) => item.toLowerCase() === skill.toLowerCase()
      );

      return {
        ...previous,
        [field]: exists
          ? currentSkills.filter(
              (item) => item.toLowerCase() !== skill.toLowerCase()
            )
          : [...currentSkills, skill]
      };
    });
  };

  const isSkillSelected = (field, skill) => {
    return (formData[field] || []).some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );
  };

  const clearSelectedSkills = () => {
    setFormData({
      ...formData,
      [activeSkillMode]: []
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (formData.bio.length > 300) {
      setError("Bio cannot be more than 300 characters");
      return;
    }

    try {
      setSaving(true);

      const data = await apiRequest("/users/profile", {
        method: "PUT",
        token,
        body: {
          name: formData.name.trim(),
          bio: formData.bio.trim(),
          avatar: formData.avatar.trim(),
          teachSkills: formData.teachSkills,
          learnSkills: formData.learnSkills
        }
      });

      const user = data.user;
      setProfile(user);

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          isEmailVerified: user.isEmailVerified
        })
      );

      setMessage(data.message || "Profile updated successfully");
      closeEditProfile();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const searchValue = skillSearch.toLowerCase().trim();

    return SKILL_CATEGORIES.map((category) => ({
      ...category,
      skills: category.skills.filter((skill) =>
        skill.toLowerCase().includes(searchValue)
      )
    })).filter((category) => category.skills.length > 0);
  }, [skillSearch]);

  if (loading) {
    return (
      <main>
        <p className="text-slate-400">Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main>
        <EmptyState
          title="Profile not found"
          description="Please login again to view your profile."
          action={
            <Link
              to="/login"
              className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
            >
              Login
            </Link>
          }
        />
      </main>
    );
  }

  const teachSkills = normalizeSkills(profile.teachSkills);
  const learnSkills = normalizeSkills(profile.learnSkills);
  const selectedDraftSkills = formData[activeSkillMode] || [];

  return (
    <main>
      <PageHeader
        eyebrow="Profile"
        title={profile.name}
        description="Manage how other students see you, what you can teach, and what you want to learn."
        actions={
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-200"
          >
            Account settings
          </button>
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

      {showSettings && (
        <SectionCard
          className="mt-6"
          title="Account settings"
          description="Manage your profile, password, and credit wallet."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={openEditProfile}
              className="rounded-2xl bg-blue-500 px-5 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"
            >
              Edit profile
            </button>

            <Link
              to="/change-password"
              className="rounded-2xl border border-white/10 px-5 py-4 text-center font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Change password
            </Link>

            <Link
              to="/credits"
              className="rounded-2xl border border-white/10 px-5 py-4 text-center font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Credit wallet
            </Link>
          </div>
        </SectionCard>
      )}

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <UserAvatar name={profile.name} src={profile.avatar} size="lg" />

            <div className="min-w-0">
              <h2 className="text-3xl font-black">{profile.name}</h2>

              <p className="mt-2 break-all text-sm text-slate-400">
                {profile.email}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {profile.isEmailVerified && (
                  <StatusBadge status="verified">
                    Verified student
                  </StatusBadge>
                )}

                <StatusBadge status="default">
                  {profile.role || "student"}
                </StatusBadge>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm font-bold text-slate-300">About</p>

            <p className="mt-3 leading-7 text-slate-400">
              {profile.bio ||
                "No bio added yet. Add a short introduction from account settings."}
            </p>
          </div>
        </SectionCard>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Available Credits"
            value={stats?.availableCredits ?? profile.credits ?? 0}
            helper="Current balance to spend"
            tone="blue"
          />

          <StatCard
            label="Locked Credits"
            value={stats?.lockedCredits ?? 0}
            helper="In active escrow"
            tone="yellow"
          />

          <StatCard
            label="Total Earned"
            value={stats?.totalEarned ?? 0}
            helper="All-time earnings"
            tone="green"
          />

          <StatCard
            label="Total Spent"
            value={stats?.totalSpent ?? 0}
            helper="All-time spendings"
            tone="purple"
          />

          <StatCard
            label="Sessions Taught"
            value={stats?.sessionsTaught ?? profile.completedSessions ?? 0}
            helper="As a mentor"
            tone="blue"
          />

          <StatCard
            label="Sessions Learned"
            value={stats?.sessionsLearned ?? 0}
            helper="As a student"
            tone="purple"
          />

          <StatCard
            label="Rating"
            value={stats?.averageRating ?? profile.rating ?? 0}
            helper="Average mentor rating"
            tone="yellow"
          />

          <StatCard
            label="Reputation"
            value={stats?.reputation ?? profile.reputation ?? 0}
            helper="Community points"
            tone="green"
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Skills I can teach"
          description="These skills make you visible in mentor search."
          action={
            <button
              onClick={openEditProfile}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Edit
            </button>
          }
        >
          {teachSkills.length === 0 ? (
            <EmptyState
              title="No teaching skills yet"
              description="Add skills you can teach to become discoverable as a mentor."
              action={
                <button
                  onClick={openEditProfile}
                  className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
                >
                  Add skills
                </button>
              }
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {teachSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Skills I want to learn"
          description="Topics you want help with from other students."
          action={
            <button
              onClick={openEditProfile}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Edit
            </button>
          }
        >
          {learnSkills.length === 0 ? (
            <EmptyState
              title="No learning goals yet"
              description="Add skills you want to learn from peer mentors."
              action={
                <button
                  onClick={openEditProfile}
                  className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
                >
                  Add goals
                </button>
              }
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {learnSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </SectionCard>
      </section>

      <SectionCard
        className="mt-8"
        title="Ready to learn something?"
        description="Explore students who can help you with your next skill."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/explore"
              className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-200"
            >
              Explore mentors
            </Link>

            <Link
              to="/sessions"
              className="rounded-2xl border border-white/10 px-5 py-3 font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              View sessions
            </Link>
          </div>
        }
      >
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm leading-7 text-slate-400">
            A complete profile improves mentor discovery and makes your session
            requests more trustworthy.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        className="mt-8"
        title="Bookmarked Doubts"
        description="Questions and discussions you have saved for later."
      >
        {bookmarkedDoubts.length === 0 ? (
            <EmptyState
              title="No bookmarks yet"
              description="When you bookmark a doubt in the community, it will appear here."
              action={
                <Link
                  to="/community"
                  className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
                >
                  Explore Community
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bookmarkedDoubts.map(doubt => (
                <Link 
                  key={doubt._id} 
                  to={`/community/${doubt._id}`}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04]"
                >
                  <h3 className="font-bold text-white line-clamp-1">{doubt.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{doubt.description}</p>
                  <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{doubt.upvotes?.length || 0} votes</span>
                    <span>{doubt.replies?.length || 0} replies</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </SectionCard>

      <Modal
        open={showEditProfile}
        eyebrow="Edit profile"
        title="Update your details"
        description="Changes appear on your profile only after saving."
        onClose={closeEditProfile}
        maxWidth="max-w-6xl"
        footer={
          <div className="modal-action-row flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={closeEditProfile}
              className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="edit-profile-form"
              disabled={saving}
              className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
            >
              {saving ? "Saving profile..." : "Save changes"}
            </button>
          </div>
        }
      >
        <form id="edit-profile-form" onSubmit={handleSubmit}>
          <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
            <section className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">
                    Full name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-300">
                    Avatar URL
                  </label>

                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="Optional image URL"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-300">
                    Bio
                  </label>

                  <span className="text-xs text-slate-500">
                    {formData.bio.length}/300
                  </span>
                </div>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Example: I can help beginners with React, JavaScript basics, and GitHub project setup."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black">
                      {activeSkillMode === "teachSkills"
                        ? "Selected teaching skills"
                        : "Selected learning skills"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {selectedDraftSkills.length} selected
                    </p>
                  </div>

                  {selectedDraftSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSelectedSkills}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.04]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {selectedDraftSkills.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    Select skills from the list.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedDraftSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(activeSkillMode, skill)}
                        className={
                          activeSkillMode === "teachSkills"
                            ? "rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-300"
                            : "rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-bold text-purple-300"
                        }
                      >
                        {skill} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-950 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-black">Choose skills</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Select from common B.Tech and placement skills.
                  </p>
                </div>

                <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                  <button
                    type="button"
                    onClick={() => setActiveSkillMode("teachSkills")}
                    className={
                      activeSkillMode === "teachSkills"
                        ? "rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                        : "rounded-xl px-4 py-2 text-sm font-bold text-slate-400 hover:text-white"
                    }
                  >
                    Teach
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSkillMode("learnSkills")}
                    className={
                      activeSkillMode === "learnSkills"
                        ? "rounded-xl bg-purple-500 px-4 py-2 text-sm font-bold text-white"
                        : "rounded-xl px-4 py-2 text-sm font-bold text-slate-400 hover:text-white"
                    }
                  >
                    Learn
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={skillSearch}
                onChange={(event) => setSkillSearch(event.target.value)}
                placeholder="Search skills like React, DSA, DBMS..."
                className="mt-5 w-full rounded-2xl border border-white/10 bg-[#0B1020] px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
              />

              <div className="mt-5 max-h-[420px] space-y-5 overflow-y-auto pr-2">
                {filteredCategories.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm text-slate-400">
                      No skill found for this search.
                    </p>
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <div key={category.name}>
                      <p className="mb-3 text-sm font-black text-slate-300">
                        {category.name}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill) => {
                          const selected = isSkillSelected(
                            activeSkillMode,
                            skill
                          );

                          return (
                            <button
                              key={`${category.name}-${skill}`}
                              type="button"
                              onClick={() =>
                                toggleSkill(activeSkillMode, skill)
                              }
                              className={
                                selected
                                  ? activeSkillMode === "teachSkills"
                                    ? "rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                                    : "rounded-full bg-purple-500 px-4 py-2 text-sm font-bold text-white"
                                  : "rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white"
                              }
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </form>
      </Modal>
    </main>
  );
}

export default Profile;
