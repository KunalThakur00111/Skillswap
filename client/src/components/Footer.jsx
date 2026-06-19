import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-5 py-10 text-white lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-black shadow-lg shadow-blue-500/20">
              S
            </div>

            <div>
              <p className="text-lg font-black leading-none">SkillSwap</p>
              <p className="mt-1 text-xs text-slate-500">
                Campus learning network
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            Learn from students around your campus, teach what you know, and
            grow through credit-based peer learning.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Product</h3>

          <div className="mt-4 space-y-3 text-sm">
            <Link to="/" className="block text-slate-400 hover:text-white">
              Home
            </Link>

            <Link to="/signup" className="block text-slate-400 hover:text-white">
              Create account
            </Link>

            <Link to="/login" className="block text-slate-400 hover:text-white">
              Login
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold">For students</h3>

          <div className="mt-4 space-y-3 text-sm">
            <p className="text-slate-400">Find peer mentors</p>
            <p className="text-slate-400">Earn credits by teaching</p>
            <p className="text-slate-400">Build mentor reputation</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} SkillSwap Campus.</p>
        <p>Built for peer-to-peer campus learning.</p>
      </div>
    </footer>
  );
}

export default Footer;