import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from "../hooks/queries/useNotifications";
import { useSocket } from "../context/SocketContext";
import NotificationSkeleton from "../components/skeletons/NotificationSkeleton";

function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { unreadCount } = useSocket();

  const { data: response, isLoading: loading, error, isError } = useNotifications({
    page,
    limit: 15
  });

  const dbNotifications = response?.data || [];
  const meta = response?.meta || { totalPages: 1, page: 1 };
  const totalPages = meta.totalPages;

  const markAllMutation = useMarkAllAsRead();
  const markMutation = useMarkAsRead();

  const isMarkingAll = markAllMutation.isPending;

  const handleMarkAllRead = () => {
    markAllMutation.mutate();
  };

  const handleMarkAsRead = (id, currentReadStatus) => {
    if (!currentReadStatus) {
      markMutation.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Notifications</h1>
            <p className="text-slate-400">Stay updated on your learning journey</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
          >
            {isMarkingAll ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
        {isError && (
          <div className="p-4 bg-red-500/10 text-red-200 text-sm">
            {error?.message || "Failed to load notifications"}
          </div>
        )}

        {loading ? (
          <div className="p-4">
             {[1, 2, 3, 4, 5].map(i => <NotificationSkeleton key={i} />)}
          </div>
        ) : dbNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.02] text-slate-500 mb-4">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">No notifications yet</h3>
            <p className="mt-1 text-slate-400">When you get notifications, they'll show up here</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/10">
            {dbNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                className={`flex items-start gap-4 p-5 transition-colors sm:p-6 ${
                  !notification.isRead ? "bg-blue-500/[0.05]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className={`mt-1 flex h-2 w-2 flex-shrink-0 rounded-full ${!notification.isRead ? "bg-blue-500" : "bg-transparent"}`} />
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h4 className={`text-base ${!notification.isRead ? "font-bold text-white" : "font-medium text-slate-200"}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-500 flex-shrink-0">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${!notification.isRead ? "text-slate-300" : "text-slate-400"}`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="p-6 flex justify-center gap-2 border-t border-white/10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-slate-400 flex items-center">
                  Page {page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 hover:bg-slate-700"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
