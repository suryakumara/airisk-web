import React, { useEffect, useRef, useState } from "react";
import { FiTrash2, FiSend, FiLoader, FiFile } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { tgGetMessages, tgSendMessage } from "../../services/telegram.service";
import { useAuthStore } from "../../store/useAuthStore";
import type { ChatPanel as ChatPanelType, ChatMessage } from "../../types/telegram.types";

const API = import.meta.env.VITE_PROXY_URL ?? "http://localhost:3000";

interface Props {
  panel: ChatPanelType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleListeners?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleAttributes?: Record<string, any>;
  isDragging?: boolean;
  onDelete: () => void;
}

const MediaContent: React.FC<{ msg: ChatMessage; botUsername: string }> = ({ msg, botUsername }) => {
  const token = useAuthStore.getState().token;
  const src = `${API}/api/tg/media/${encodeURIComponent(botUsername)}/${msg.id}?token=${encodeURIComponent(token ?? "")}`;

  switch (msg.mediaType) {
    case "photo":
      return (
        <img
          src={src}
          alt="photo"
          className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer"
          onClick={() => window.open(src, "_blank")}
        />
      );
    case "video":
      return <video src={src} controls className="max-w-full rounded-lg max-h-48" />;
    case "voice":
      return <audio src={src} controls className="w-full max-w-[220px] h-8" />;
    case "document":
      return (
        <a href={src} download={msg.fileName ?? "file"}
          className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
          <FiFile size={13} />
          <span className="truncate max-w-[160px]">{msg.fileName ?? "Download file"}</span>
        </a>
      );
    default:
      return null;
  }
};

const ChatPanel: React.FC<Props> = ({
  panel, dragHandleListeners, dragHandleAttributes, isDragging, onDelete,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const lastIdRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initials = panel.displayName.slice(0, 2).toUpperCase();

  // Scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await tgGetMessages(panel.botUsername);
        if (data.success && data.messages.length > 0) {
          setMessages(data.messages);
          lastIdRef.current = data.messages[data.messages.length - 1].id;
        }
      } catch {
        setError("Could not load messages.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [panel.botUsername]);

  // Poll every 3s for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      if (lastIdRef.current === 0) return;
      try {
        const data = await tgGetMessages(panel.botUsername, lastIdRef.current);
        if (data.success && data.messages.length > 0) {
          setMessages((prev) => [...prev, ...data.messages]);
          lastIdRef.current = data.messages[data.messages.length - 1].id;
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [panel.botUsername]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const data = await tgSendMessage(panel.botUsername, inputText.trim());
      if (!data.success) {
        setError(data.message ?? "Failed to send.");
      } else {
        setMessages((prev) => [...prev, data.message]);
        if (data.message.id > lastIdRef.current) lastIdRef.current = data.message.id;
        setInputText("");
      }
    } catch {
      setError("Could not reach server.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className={`flex flex-col h-[520px] bg-gray-950 border rounded-2xl overflow-hidden transition-all duration-200 ${
      isDragging
        ? "border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.25)] scale-[1.02]"
        : "border-white/10 hover:border-white/20"
    }`}>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-black/40 border-b border-white/10 shrink-0">
        <button
          className="text-gray-600 hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none transition-colors"
          {...dragHandleListeners} {...dragHandleAttributes}
        >
          <MdDragIndicator size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-cyan-400">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{panel.displayName}</p>
          <p className="text-xs text-cyan-400 truncate leading-tight">@{panel.botUsername}</p>
        </div>
        <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors">
          <FiTrash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <FiLoader className="animate-spin text-cyan-400" size={22} />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl mb-3">💬</span>
            <p className="text-sm text-gray-500">No messages yet.</p>
            <p className="text-xs text-gray-600 mt-1">Say something to @{panel.botUsername}!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.out ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                msg.out
                  ? "bg-cyan-600/40 border border-cyan-500/30 text-white rounded-br-sm"
                  : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm"
              }`}>
                {msg.mediaType ? (
                  <>
                    <MediaContent msg={msg} botUsername={panel.botUsername} />
                    {msg.text && <p className="text-xs text-gray-400 mt-1">{msg.text}</p>}
                  </>
                ) : (
                  <p className="leading-snug break-words">{msg.text}</p>
                )}
                <p className="text-[10px] text-gray-500 mt-1 text-right">
                  {new Date(msg.date * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mb-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg shrink-0">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-white/10 bg-black/20 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${panel.botUsername}…`}
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            style={{ minHeight: "36px", maxHeight: "80px" }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? <FiLoader className="animate-spin" size={15} /> : <FiSend size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
