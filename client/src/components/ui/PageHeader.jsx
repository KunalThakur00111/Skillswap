function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/15 via-white/[0.04] to-purple-500/10 p-6 shadow-xl shadow-black/10 md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-20 h-52 w-52 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap gap-3 xl:justify-end">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}

export default PageHeader;
