import React from "react";

const NotificationSkeleton = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3 animate-pulse flex gap-4 items-start">
        <div className="w-10 h-10 bg-slate-800 rounded-full flex-shrink-0"></div>
        <div className="flex-1 w-full">
            <div className="flex justify-between mb-2">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-3 bg-slate-800 rounded w-16"></div>
            </div>
            <div className="h-4 bg-slate-800 rounded w-5/6 mb-1"></div>
            <div className="h-4 bg-slate-800 rounded w-2/3"></div>
        </div>
    </div>
  );
};

export default NotificationSkeleton;
