const tones = {
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-200",
  green: "border-green-500/20 bg-green-500/10 text-green-200",
  yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
  red: "border-red-500/20 bg-red-500/10 text-red-200",
  purple: "border-purple-500/20 bg-purple-500/10 text-purple-200",
  slate: "border-white/10 bg-white/[0.03] text-slate-300"
};

function StatCard({ label, value, helper, tone = "slate" }) {
  return (
    <div
      className={`card-hover rounded-3xl border p-5 shadow-xl shadow-black/5 sm:p-6 ${
        tones[tone] || tones.slate
      }`}
    >
      <p className="text-sm font-bold">{label}</p>

      <p className="mt-4 text-3xl font-black text-white sm:text-4xl">
        {value}
      </p>

      {helper && (
        <p className="mt-3 text-sm leading-6 text-slate-400">{helper}</p>
      )}
    </div>
  );
}

export default StatCard;
