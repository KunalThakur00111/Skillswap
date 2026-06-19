import { Link } from "react-router-dom";

function NotFound() {
  const token = localStorage.getItem("token");

  return (
    <main className="relative overflow-hidden bg-slate-950 px-5 py-24 text-white lg:px-10">
      <div className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute right-0 top-52 h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[100px]" />

      <section className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl md:p-14">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500 text-3xl font-black">
          404
        </div>

        <h1 className="mt-8 text-4xl font-black md:text-5xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to={token ? "/dashboard" : "/"}
            className="rounded-2xl bg-white px-6 py-4 font-bold text-slate-950 hover:bg-slate-200"
          >
            {token ? "Go to dashboard" : "Go home"}
          </Link>

          <Link
            to={token ? "/explore" : "/login"}
            className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-slate-300 hover:bg-white/[0.04]"
          >
            {token ? "Explore mentors" : "Login"}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFound;