import { Link } from "react-router-dom";

function AuthLayout({
  badge,
  title,
  subtitle,
  children,
  sideTitle,
  sideText,
  footerText,
  footerLinkText,
  footerLinkTo
}) {
  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-950 px-5 py-12 text-white lg:px-10">
      <div className="absolute left-1/2 top-0 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[130px]" />
      <div className="absolute right-0 top-52 h-[340px] w-[340px] rounded-full bg-purple-500/10 blur-[110px]" />

      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl lg:grid-cols-[1fr_0.9fr]">
        <section className="p-6 sm:p-8 lg:p-10">
          <div className="max-w-md">
            <div className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-200">
              {badge}
            </div>

            <h1 className="mt-7 text-4xl font-black tracking-tight md:text-5xl">
              {title}
            </h1>

            <p className="mt-4 leading-7 text-slate-400">{subtitle}</p>
          </div>

          <div className="mt-8 max-w-md">{children}</div>

          <p className="mt-7 text-sm text-slate-400">
            {footerText}{" "}
            <Link
              to={footerLinkTo}
              className="font-bold text-blue-400 hover:text-blue-300"
            >
              {footerLinkText}
            </Link>
          </p>
        </section>

        <section className="hidden border-l border-white/10 bg-[#0B1020] p-10 lg:block">
          <div className="flex h-full flex-col">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-xl font-black shadow-lg shadow-blue-500/20">
                S
              </div>

              <h2 className="mt-8 text-4xl font-black leading-tight">
                {sideTitle}
              </h2>

              <p className="mt-4 leading-7 text-slate-400">{sideText}</p>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-300">
                    Sample session
                  </p>
                  <h3 className="mt-1 text-xl font-black">React basics</h3>
                </div>

                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300">
                  10 credits
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Request help from a peer mentor and learn through a focused
                one-to-one session.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs font-bold text-green-200">
                    Mentor earns
                  </p>
                  <p className="mt-2 text-2xl font-black">+10</p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-xs font-bold text-red-200">
                    Learner spends
                  </p>
                  <p className="mt-2 text-2xl font-black">-10</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm font-bold text-blue-300">
                How SkillSwap works
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-400" />
                  <p className="text-sm leading-6 text-slate-300">
                    Verify your student email and create your profile.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-green-400" />
                  <p className="text-sm leading-6 text-slate-300">
                    Add skills you can teach and skills you want to learn.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-purple-400" />
                  <p className="text-sm leading-6 text-slate-300">
                    Request sessions, exchange credits, and review mentors.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
                <p className="text-sm font-bold text-blue-200">
                  Built for peer learning
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Learn from students who recently solved the same doubts,
                  assignments, and projects.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;