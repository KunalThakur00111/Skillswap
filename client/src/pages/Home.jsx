import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import UserAvatar from "../components/ui/UserAvatar";
import StatusBadge from "../components/ui/StatusBadge";

const PRIMARY_SKILLS = [
  "DSA", "React", "Node.js", "Python", "MongoDB", "AI/ML", "DevOps"
];

function Home() {
  const [stats, setStats] = useState({ students: 0, mentors: 0, sessions: 0, doubts: 0 });
  const [topMentors, setTopMentors] = useState([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const statsData = await apiRequest("/public/stats");
        if (statsData.success) setStats(statsData.stats);

        const mentorsData = await apiRequest("/public/mentors/top");
        if (mentorsData.success) setTopMentors(mentorsData.mentors);
      } catch (err) {
        console.error("Failed to fetch public data:", err);
      }
    };
    fetchPublicData();
  }, []);

  return (
    <main className="min-h-screen bg-[#070B14] text-white selection:bg-blue-500/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden px-5 py-24 lg:px-10 lg:py-32">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute right-0 top-32 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            The Campus Mentorship Marketplace
          </div>

          <h1 className="mt-8 text-6xl font-black leading-[1.1] tracking-tight md:text-8xl">
            Learn from students. <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Teach what you know.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            SkillSwap connects you with peer mentors for focused 1:1 sessions. Earn credits by helping others, and spend them to master new skills.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="w-full rounded-2xl bg-blue-500 px-8 py-4 text-center font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:bg-blue-600 sm:w-auto"
            >
              Get Started for Free
            </Link>
            <Link
              to="/explore"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-center font-bold text-slate-300 transition-all hover:bg-white/[0.08] sm:w-auto"
            >
              Browse Mentors
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {PRIMARY_SKILLS.map((skill) => (
              <span key={skill} className="rounded-full border border-white/5 bg-white/[0.02] px-4 py-2 text-sm font-medium text-slate-400">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="border-y border-white/5 bg-white/[0.01] px-5 py-12 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Students", value: stats.students },
            { label: "Expert Mentors", value: stats.mentors },
            { label: "Sessions Completed", value: stats.sessions },
            { label: "Doubts Resolved", value: stats.doubts }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-black text-white">{stat.value.toLocaleString()}+</p>
              <p className="mt-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURES BENTO GRID */}
      <section className="px-5 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black md:text-5xl">Everything you need to grow.</h2>
            <p className="mt-4 text-lg text-slate-400">A complete ecosystem designed for peer-to-peer campus learning.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
            <div className="group rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 transition-colors hover:border-blue-500/30 md:col-span-2">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Skill Exchange</h3>
              <p className="mt-2 text-slate-400 leading-relaxed">Find students who have mastered exactly what you are trying to learn. Book a 1:1 session and get personalized help over Google Meet or Zoom.</p>
            </div>

            <div className="group rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 transition-colors hover:border-green-500/30">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white">Credit Economy</h3>
              <p className="mt-2 text-slate-400">Earn credits by teaching what you know. Use your balance to learn new skills.</p>
            </div>

            <div className="group rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 transition-colors hover:border-purple-500/30">
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white">Smart Scheduling</h3>
              <p className="mt-2 text-slate-400">Mentors set their availability. Learners book time slots. No back-and-forth emails.</p>
            </div>

            <div className="group rounded-[2rem] border border-white/10 bg-slate-900/50 p-8 transition-colors hover:border-yellow-500/30 md:col-span-2">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Reputation Engine</h3>
              <p className="mt-2 text-slate-400 leading-relaxed">Build credibility on campus. After every session, learners leave reviews. High-rated mentors rise to the top and get more booking requests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TOP MENTORS SECTION */}
      {topMentors.length > 0 && (
        <section className="border-t border-white/5 bg-slate-950/50 px-5 py-24 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-black md:text-5xl">Learn from the best.</h2>
                <p className="mt-4 text-lg text-slate-400">Top-rated mentors currently active on SkillSwap.</p>
              </div>
              <Link to="/explore" className="text-blue-400 font-bold hover:text-blue-300">View all mentors →</Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topMentors.map((mentor) => (
                <div key={mentor._id} className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 transition hover:border-blue-500/30">
                  <div className="flex items-center gap-4">
                    <UserAvatar name={mentor.name} src={mentor.avatar} size="lg" />
                    <div>
                      <h3 className="text-lg font-bold">{mentor.name}</h3>
                      <div className="flex gap-2 text-sm mt-1">
                        <span className="text-yellow-400 font-bold">★ {mentor.rating ? mentor.rating.toFixed(1) : "New"}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{mentor.completedSessions} sessions</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {mentor.teachSkills?.slice(0, 3).map(skill => (
                       <span key={skill} className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. TESTIMONIALS SECTION */}
      <section className="px-5 py-24 lg:px-10">
         <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-black md:text-5xl mb-12">Loved by students.</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8">
                <p className="text-slate-300 italic">"I was struggling with React Hooks for a week. Booked a 1-hour session with a senior and finally understood it completely. The peer-to-peer aspect makes it so much less intimidating."</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">R</div>
                  <div><p className="font-bold text-sm">Rahul S.</p><p className="text-xs text-slate-500">Learner</p></div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8">
                <p className="text-slate-300 italic">"Teaching DSA to juniors on SkillSwap not only solidified my own concepts for placements but also helped me earn credits to learn DevOps."</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center font-bold">A</div>
                  <div><p className="font-bold text-sm">Aditi M.</p><p className="text-xs text-slate-500">Top Mentor</p></div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8">
                <p className="text-slate-300 italic">"The scheduling system is flawless. I set my availability on weekends, and students just pick a slot. The credits escrow ensures no one wastes time."</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center font-bold">V</div>
                  <div><p className="font-bold text-sm">Varun K.</p><p className="text-xs text-slate-500">Mentor</p></div>
                </div>
              </div>
            </div>
         </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="px-5 pb-24 lg:px-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-[#0B1020] to-purple-600/10 p-10 md:p-16 text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <h2 className="text-4xl font-black md:text-6xl text-white">Ready to join the community?</h2>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-slate-400">Join thousands of students exchanging skills, growing their network, and building their reputation.</p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/signup" className="rounded-2xl bg-blue-500 px-8 py-4 font-black text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-all hover:scale-105">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

export default Home;