function SectionCard({ title, description, action, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-xl shadow-black/5 ${className}`}
    >
      {(title || description || action) && (
        <div className="flex flex-col gap-5 border-b border-white/10 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-xl font-black sm:text-2xl">{title}</h2>}

            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
              {action}
            </div>
          )}
        </div>
      )}

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default SectionCard;
