import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Check, CheckCircle2, ChevronRight } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { formatDistanceToNow } from "date-fns";

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { 
    unreadCount, 
    notifications, 
    markAsRead, 
    markAllAsRead 
  } = useSocket();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    
    // Navigate based on type
    if (["session_request", "session_accepted", "session_rejected", "session_cancelled", "session_completed"].includes(notification.type)) {
      navigate("/sessions");
    } else if (["review_received", "rating_received"].includes(notification.type)) {
      navigate("/reviews");
    } else if (["credit_earned", "credit_deducted", "insufficient_credit"].includes(notification.type)) {
      navigate("/credits");
    } else {
      navigate("/dashboard");
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/20">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-white/10 bg-[#0B1020]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                <CheckCircle2 size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.02] text-slate-500 mb-3">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-medium text-slate-400">No notifications yet</p>
                <p className="mt-1 text-xs text-slate-600">When you get notifications, they'll show up here</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {recentNotifications.map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex flex-col gap-1 border-b border-white/5 p-4 text-left transition-colors hover:bg-white/[0.03] ${
                      !notification.isRead ? "bg-blue-500/[0.03]" : ""
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <p className={`text-sm ${!notification.isRead ? "font-bold text-white" : "font-medium text-slate-300"}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold text-slate-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-white/10 bg-white/[0.02] p-3 text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-center gap-1 text-sm font-bold text-blue-400 hover:text-blue-300"
              >
                View all notifications
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
