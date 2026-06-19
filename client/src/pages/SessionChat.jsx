import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { apiRequest, API_BASE_URL } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import UserAvatar from "../components/ui/UserAvatar";
import StatusBadge from "../components/ui/StatusBadge";

function SessionChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  
  // Notes State
  const [mentorNotes, setMentorNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 1. Fetch Session and Messages
    const fetchChatData = async () => {
      try {
        setLoading(true);
        const [sessionData, msgData] = await Promise.all([
          apiRequest("/sessions", { token }),
          apiRequest(`/sessions/${id}/chat/messages`, { token })
        ]);
        
        const currentSession = sessionData.sessions?.find(s => s._id === id);
        if (!currentSession) throw new Error("Session not found or unauthorized");
        
        setSession(currentSession);
        setMentorNotes(currentSession.notes?.mentorNotes || "");
        setMessages(msgData.messages || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChatData();
  }, [id, token]);

  useEffect(() => {
    // 2. Initialize Socket
    if (!token || !user.id || !session) return;

    const newSocket = io(API_BASE_URL.replace("/api", ""), {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      newSocket.emit("register", user.id);
      newSocket.emit("join_session_chat", id);
      // Immediately mark as read
      newSocket.emit("mark_as_read", { sessionId: id, userId: user.id });
    });

    newSocket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
      newSocket.emit("mark_as_read", { sessionId: id, userId: user.id });
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave_session_chat", id);
      newSocket.disconnect();
    };
  }, [id, token, user.id, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const isPending = session.status === "pending" || session.status === "requested";

    if (file) {
      if (isPending) {
         alert("File sharing is disabled until the session is scheduled.");
         return;
      }
      if (file.size > 5 * 1024 * 1024) {
         alert("File size exceeds 5MB limit.");
         return;
      }

      // Handle File Upload
      const formData = new FormData();
      formData.append("file", file);
      if (newMessage.trim()) formData.append("content", newMessage.trim());

      try {
        await fetch(`${API_BASE_URL}/sessions/${id}/chat/messages/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        setFile(null);
        setNewMessage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        alert("Failed to upload file");
      }
    } else {
      // Handle Text Message
      socket.emit("send_message", {
        sessionId: id,
        senderId: user.id,
        content: newMessage.trim()
      });
      setNewMessage("");
    }
  };

  const handleSaveNotes = async () => {
    try {
      setNotesLoading(true);
      await apiRequest(`/sessions/${id}/chat/notes`, {
        method: "PUT",
        token,
        body: { mentorNotes }
      });
      setIsEditingNotes(false);
      
      // Refresh session timeline if needed
      const data = await apiRequest("/sessions", { token });
      const currentSession = data.sessions?.find(s => s._id === id);
      if (currentSession) setSession(currentSession);
      
    } catch (err) {
      alert(err.message);
    } finally {
      setNotesLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-slate-400">Loading chat...</div>;
  if (error || !session) return <div className="p-10 text-red-400">{error || "Chat not available"}</div>;

  const isMentor = session.mentor._id === user.id;
  const isPending = session.status === "pending" || session.status === "requested";

  return (
    <main className="h-[calc(100vh-80px)] flex flex-col p-4">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">← Back</button>
        <h1 className="text-xl font-bold">Session Chat: {session.skill}</h1>
        <StatusBadge status={session.status} />
      </div>

      <div className="flex-1 min-h-0 grid gap-4 lg:grid-cols-[1fr_350px]">
        
        {/* LEFT COLUMN: CHAT */}
        <div className="flex flex-col rounded-[2rem] border border-white/10 bg-slate-900/50 overflow-hidden">
          
          {/* Chat Header Warning */}
          {isPending && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-3 text-center text-xs font-bold text-yellow-400">
              Limited Chat Mode: Only text messages allowed to coordinate scheduling.
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
               <div className="text-center text-slate-500 mt-10">Start the conversation!</div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender._id === user.id;
                return (
                  <div key={idx} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <UserAvatar name={msg.sender.name} src={msg.sender.avatar} size="sm" />
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                      <span className="text-xs text-slate-500 mb-1">{msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      
                      {/* Text Content */}
                      {msg.content && (
                        <div className={`px-4 py-2 rounded-2xl ${isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white/10 text-slate-200 rounded-tl-sm"}`}>
                          {msg.content}
                        </div>
                      )}

                      {/* File Content */}
                      {msg.fileUrl && (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`mt-2 block p-3 rounded-xl border ${isMe ? "border-blue-400/30 bg-blue-500/20" : "border-white/10 bg-white/5"} hover:opacity-80 transition`}>
                          <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            <span className="text-sm font-bold truncate max-w-[200px]">{msg.fileName}</span>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-950 border-t border-white/10">
            {file && (
              <div className="mb-2 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">
                <span className="text-xs font-bold text-blue-300 truncate">📎 {file.name}</span>
                <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-300">✕</button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                 type="file"
                 ref={fileInputRef}
                 className="hidden"
                 onChange={(e) => setFile(e.target.files[0])}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                title={isPending ? "File sharing disabled until scheduled" : "Attach file"}
              >
                📎
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim() && !file}
                className="p-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:opacity-50 transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS & NOTES */}
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6">
            <h3 className="font-bold mb-4">Session Info</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-400">Mentor:</span> {session.mentor.name}</p>
              <p><span className="text-slate-400">Learner:</span> {session.learner.name}</p>
              <p><span className="text-slate-400">Time:</span> {session.startTime ? new Date(session.startTime).toLocaleString() : "TBD"}</p>
              {session.meetingLink && (
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="block text-center rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold py-2 mt-2 hover:bg-purple-500/30">
                  Join Meeting
                </a>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/20 bg-yellow-500/5 p-6 flex-1">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-yellow-500">Session Notes</h3>
               {isMentor && !isEditingNotes && (
                 <button onClick={() => setIsEditingNotes(true)} className="text-xs text-yellow-400 hover:underline">Edit</button>
               )}
             </div>

             {isEditingNotes ? (
               <div className="flex flex-col h-full">
                 <textarea
                   value={mentorNotes}
                   onChange={(e) => setMentorNotes(e.target.value)}
                   className="flex-1 w-full bg-slate-950 border border-yellow-500/30 rounded-xl p-3 text-sm text-white resize-none outline-none focus:border-yellow-500 mb-3"
                   placeholder="Write session summaries, resources, or homework here..."
                   rows="10"
                 />
                 <div className="flex gap-2">
                   <button onClick={handleSaveNotes} disabled={notesLoading} className="flex-1 bg-yellow-500 text-slate-950 font-bold py-2 rounded-xl hover:bg-yellow-400">{notesLoading ? "Saving..." : "Save"}</button>
                   <button onClick={() => setIsEditingNotes(false)} className="flex-1 border border-white/10 text-white font-bold py-2 rounded-xl hover:bg-white/5">Cancel</button>
                 </div>
               </div>
             ) : (
               <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                 {mentorNotes || <span className="text-slate-500 italic">No notes added yet.</span>}
               </div>
             )}
          </div>

          {/* Timeline View */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6">
             <h3 className="font-bold mb-4">Timeline</h3>
             <div className="space-y-4 border-l-2 border-white/10 ml-2 pl-4 py-2">
               {session.timeline?.map((t, idx) => (
                 <div key={idx} className="relative">
                   <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-slate-900/50"></div>
                   <p className="text-xs text-slate-500">{new Date(t.timestamp).toLocaleString()}</p>
                   <p className="text-sm font-semibold">{t.description}</p>
                 </div>
               ))}
               {(!session.timeline || session.timeline.length === 0) && (
                 <p className="text-sm text-slate-500 italic">No timeline events.</p>
               )}
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default SessionChat;
