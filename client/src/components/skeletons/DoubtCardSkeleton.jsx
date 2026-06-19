import React from "react";

const DoubtCardSkeleton = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full"></div>
          <div>
            <div className="h-4 bg-slate-800 rounded w-24 mb-1"></div>
            <div className="h-3 bg-slate-800 rounded w-16"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <div className="h-5 bg-slate-800 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-full mb-1"></div>
        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
        <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center gap-6 pt-3 border-t border-slate-800">
        <div className="h-4 w-12 bg-slate-800 rounded"></div>
        <div className="h-4 w-12 bg-slate-800 rounded"></div>
        <div className="h-4 w-12 bg-slate-800 rounded"></div>
      </div>
    </div>
  );
};

export default DoubtCardSkeleton;
