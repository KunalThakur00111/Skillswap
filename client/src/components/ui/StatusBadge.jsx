const statusStyles = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  accepted: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  completed: "border-green-500/30 bg-green-500/10 text-green-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-300",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-300",
  verified: "border-green-500/30 bg-green-500/10 text-green-300",
  blocked: "border-red-500/30 bg-red-500/10 text-red-300",
  active: "border-green-500/30 bg-green-500/10 text-green-300",
  credit: "border-green-500/30 bg-green-500/10 text-green-300",
  debit: "border-red-500/30 bg-red-500/10 text-red-300",
  default: "border-white/10 bg-white/[0.04] text-slate-300"
};

function StatusBadge({ status, children }) {
  const key = String(status || "default").toLowerCase();
  const label = children || status || "Status";

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-xs font-bold capitalize leading-none ${
        statusStyles[key] || statusStyles.default
      }`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

export default StatusBadge;
