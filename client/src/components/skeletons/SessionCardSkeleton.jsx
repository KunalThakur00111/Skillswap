import React from "react";

const SessionCardSkeleton = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 rounded-full"></div>
          <div>
            <div className="h-5 bg-slate-800 rounded w-24 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-16"></div>
          </div>
        </div>
        <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
            <div className="w-5 h-5 bg-slate-800 rounded"></div>
            <div className="h-5 bg-slate-800 rounded w-32"></div>
        </div>
        <div className="flex gap-2">
            <div className="w-5 h-5 bg-slate-800 rounded"></div>
            <div className="h-5 bg-slate-800 rounded w-48"></div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
        <div className="h-10 w-24 bg-slate-800 rounded-lg"></div>
        <div className="h-10 w-24 bg-slate-800 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SessionCardSkeleton;
