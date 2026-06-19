function Modal({
  open,
  title,
  eyebrow,
  description,
  onClose,
  children,
  footer,
  maxWidth = "max-w-3xl"
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <div
        className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0B1020] text-white shadow-2xl sm:rounded-[2rem]`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-400">
                {eyebrow}
              </p>
            )}

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2>

            {description && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-white/10 bg-[#0B1020] p-4 sm:p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
