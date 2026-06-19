import React from "react";

const MentorCardSkeleton = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-slate-800 rounded-full flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-slate-800 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
      
      {/* Bio */}
      <div className="mb-4 space-y-2">
        <div className="h-4 bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
        <div className="h-4 bg-slate-800 rounded w-4/6"></div>
      </div>
      
      {/* Skills */}
      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
          <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
          <div className="h-6 w-14 bg-slate-800 rounded-full"></div>
        </div>
        
        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <div className="h-8 w-24 bg-slate-800 rounded"></div>
            <div className="h-10 w-28 bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default MentorCardSkeleton;
