import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  FiEdit2, FiTrash2, FiSend, FiPaperclip, FiMic, FiX,
  FiFile, FiImage, FiVideo, FiPlus, FiMessageSquare,
} from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { apiFetchMessages, apiSendText, apiSendMedia } from "../../services/bot.service";
import type { Bot, TelegramMessage, MediaType } from "../../types/bot.types";

interface Props {
  bot: Bot;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleListeners?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleAttributes?: Record<string, any>;
  isDragging?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function detectMediaType(file: File): MediaType {
  if (file.type.startsWith("image/")) return "photo";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

function formatSeconds(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function getSupportedAudioMime(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

interface Conversation {
  chatId: string;
  senderName: string;
  lastMessage: string;
  lastTime: string;
}

function buildConversations(messages: TelegramMessage[]): Conversation[] {
  const map = new Map<string, Conversation>();
  for (const msg of messages) {
    if (!msg.chatIdFrom) continue;
    const existing = map.get(msg.chatIdFrom);
    const preview = msg.text
      ? msg.text.slice(0, 40)
      : msg.mediaType
      ? `[${msg.mediaType}]`
      : "";
    const name =
      msg.direction === "in" && msg.senderName
        ? msg.senderName
        : existing?.senderName ?? msg.chatIdFrom;
    if (!existing || msg.timestamp > existing.lastTime) {
      map.set(msg.chatIdFrom, {
        chatId: msg.chatIdFrom,
        senderName: name,
        lastMessage: preview,
        lastTime: msg.timestamp,
      });
    } else if (msg.direction === "in" && msg.senderName && existing.senderName === existing.chatId) {
      existing.senderName = msg.senderName;
    }
  }
  return Array.from(map.values()).sort((a, b) => b.lastTime.localeCompare(a.lastTime));
}

// ── Message content renderer ─────────────────────────────────────────────────
const MessageContent: React.FC<{ msg: TelegramMessage }> = ({ msg }) => {
  switch (msg.mediaType) {
    case "photo":
      return msg.mediaUrl ? (
        <img src={msg.mediaUrl} alt="photo"
          className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer"
          onClick={() => window.open(msg.mediaUrl, "_blank")} />
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <FiImage size={14} className="text-cyan-400 shrink-0" />
          <span className="text-gray-300">Photo</span>
        </div>
      );
    case "video":
      return msg.mediaUrl ? (
        <video src={msg.mediaUrl} controls className="max-w-full rounded-lg max-h-48" />
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <FiVideo size={14} className="text-purple-400 shrink-0" />
          <span className="text-gray-300">Video</span>
        </div>
      );
    case "voice":
      return msg.mediaUrl ? (
        <audio src={msg.mediaUrl} controls className="w-full max-w-[220px] h-8" />
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <FiMic size={14} className="text-emerald-400 shrink-0" />
          <span className="text-gray-300">Voice message</span>
        </div>
      );
    case "document":
      return (
        <div className="flex items-center gap-2 text-sm">
          <FiFile size={14} className="text-amber-400 shrink-0" />
          <span className="text-gray-300 truncate max-w-[160px]">{msg.fileName ?? "File"}</span>
        </div>
      );
    default:
      return <p className="text-sm leading-snug break-words">{msg.text}</p>;
  }
};

// ── Main component ────────────────────────────────────────────────────────────
const BotPanel: React.FC<Props> = ({
  bot, dragHandleListeners, dragHandleAttributes, isDragging, onEdit, onDelete,
}) => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatId, setNewChatId] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Media state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | null>(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const sinceRef = useRef<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived state
  const conversations = useMemo(() => buildConversations(messages), [messages]);
  const threadMessages = useMemo(() => {
    if (!selectedChatId) return [];
    return messages.filter((m) => m.chatIdFrom === selectedChatId);
  }, [messages, selectedChatId]);

  const selectedConv = useMemo(
    () => conversations.find((c) => c.chatId === selectedChatId) ?? null,
    [conversations, selectedChatId]
  );

  // Auto-select first conversation when first messages arrive
  useEffect(() => {
    if (!selectedChatId && conversations.length > 0) {
      setSelectedChatId(conversations[0].chatId);
    }
  }, [conversations, selectedChatId]);

  // Scroll to bottom when thread changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages]);

  // Cleanup
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch messages, then poll every 3s
  useEffect(() => {
    const loadInitial = async () => {
      const data = await apiFetchMessages(bot.id);
      if (data.success && data.messages.length > 0) {
        setMessages(data.messages);
        sinceRef.current = data.messages[data.messages.length - 1].timestamp;
      }
    };
    loadInitial();

    const interval = setInterval(async () => {
      const data = await apiFetchMessages(bot.id, sinceRef.current);
      if (data.success && data.messages.length > 0) {
        sinceRef.current = data.messages[data.messages.length - 1].timestamp;
        setMessages((prev) => [...prev, ...data.messages]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bot.id]);

  // ── Send text ────────────────────────────────────────────────────────────
  const handleSendText = async () => {
    if (!inputText.trim() || !selectedChatId) return;
    setSending(true);
    setSendError("");
    try {
      const data = await apiSendText(bot.id, inputText.trim(), selectedChatId);
      if (!data.success) {
        setSendError(data.message ?? "Failed to send.");
      } else {
        const sent = { ...data.message, chatIdFrom: selectedChatId, mediaUrl: undefined };
        setMessages((prev) => [...prev, sent]);
        if (!sinceRef.current || sent.timestamp > sinceRef.current)
          sinceRef.current = sent.timestamp;
        setInputText("");
      }
    } catch {
      setSendError("Could not reach server.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); }
  };

  // ── New chat (manual chatId entry) ───────────────────────────────────────
  const handleStartNewChat = () => {
    if (!/^-?\d+$/.test(newChatId.trim())) return;
    setSelectedChatId(newChatId.trim());
    setShowNewChat(false);
    setNewChatId("");
  };

  // ── File picker ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = detectMediaType(file);
    setSelectedFile(file);
    setSelectedMediaType(type);
    setMediaCaption("");
    if (type === "photo" || type === "video") {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    e.target.value = "";
  };

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setSelectedMediaType(null);
    setMediaCaption("");
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
  }, [previewUrl]);

  // ── Send media ───────────────────────────────────────────────────────────
  const handleSendMedia = async () => {
    if (!selectedFile || !selectedMediaType || !selectedChatId) return;
    setSending(true);
    setSendError("");
    const localUrl = previewUrl;
    try {
      const data = await apiSendMedia(
        bot.id, selectedFile, selectedMediaType,
        mediaCaption || undefined, selectedFile.name, selectedChatId
      );
      if (!data.success) {
        setSendError(data.message ?? "Failed to send media.");
      } else {
        const sent = { ...data.message, chatIdFrom: selectedChatId, mediaUrl: localUrl ?? undefined };
        setMessages((prev) => [...prev, sent]);
        clearSelectedFile();
      }
    } catch {
      setSendError("Could not reach server.");
    } finally {
      setSending(false);
    }
  };

  // ── Voice recording ──────────────────────────────────────────────────────
  const startRecording = async () => {
    setSendError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      setSendError("Microphone access denied.");
    }
  };

  const stopRecording = (send: boolean) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((t) => t.stop());
      if (!send || !selectedChatId) return;
      const mimeType = recorder.mimeType || "audio/webm";
      const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      setSending(true);
      try {
        const data = await apiSendMedia(bot.id, blob, "voice", undefined, `voice.${ext}`, selectedChatId);
        if (!data.success) {
          setSendError(data.message ?? "Failed to send voice.");
        } else {
          const sent = { ...data.message, chatIdFrom: selectedChatId, mediaUrl: blobUrl };
          setMessages((prev) => [...prev, sent]);
        }
      } catch {
        setSendError("Could not reach server.");
      } finally {
        setSending(false);
      }
    };

    recorder.stop();
    setIsRecording(false);
    setRecordingSeconds(0);
    mediaRecorderRef.current = null;
  };

  const initials = bot.name.slice(0, 2).toUpperCase();
  const mediaLabel: Record<MediaType, string> = { photo: "Photo", video: "Video", document: "File", voice: "Voice" };

  return (
    <div className={`flex flex-col h-[580px] bg-gray-950 border rounded-2xl overflow-hidden transition-all duration-200 ${
      isDragging
        ? "border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.25)] scale-[1.02]"
        : "border-white/10 hover:border-white/20"
    }`}>

      {/* ── Panel Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-black/40 border-b border-white/10 shrink-0">
        <button className="text-gray-600 hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none transition-colors"
          {...dragHandleListeners} {...dragHandleAttributes}>
          <MdDragIndicator size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-cyan-400">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{bot.name}</p>
          {bot.username && <p className="text-xs text-cyan-400 truncate leading-tight">@{bot.username}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" title="Connected" />
          <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"><FiEdit2 size={14} /></button>
          <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"><FiTrash2 size={14} /></button>
        </div>
      </div>

      {/* ── Body: Conversation list + Thread ─────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Conversations sidebar */}
        <div className="w-36 shrink-0 border-r border-white/10 flex flex-col bg-black/20">
          <div className="flex items-center justify-between px-2.5 py-2 border-b border-white/10 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Chats</span>
            <button
              onClick={() => setShowNewChat((v) => !v)}
              title="New conversation"
              className="p-0.5 text-gray-600 hover:text-cyan-400 transition-colors"
            >
              <FiPlus size={13} />
            </button>
          </div>

          {/* New chat input */}
          {showNewChat && (
            <div className="p-2 border-b border-white/10 shrink-0 bg-black/30">
              <input
                value={newChatId}
                onChange={(e) => setNewChatId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartNewChat()}
                placeholder="Chat ID…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <div className="flex gap-1 mt-1">
                <button onClick={handleStartNewChat}
                  className="flex-1 py-1 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-[10px] font-semibold text-white transition-colors">
                  Start
                </button>
                <button onClick={() => { setShowNewChat(false); setNewChatId(""); }}
                  className="p-1 text-gray-500 hover:text-white transition-colors">
                  <FiX size={11} />
                </button>
              </div>
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-3 text-center">
                <FiMessageSquare size={20} className="text-gray-700 mb-2" />
                <p className="text-[10px] text-gray-700 leading-relaxed">
                  Send a message to this bot on Telegram to start a chat
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.chatId}
                  onClick={() => { setSelectedChatId(conv.chatId); setSendError(""); }}
                  className={`w-full text-left px-2.5 py-2.5 border-b border-white/5 transition-colors relative ${
                    selectedChatId === conv.chatId
                      ? "bg-cyan-600/10 border-l-2 border-l-cyan-500"
                      : "hover:bg-white/5"
                  }`}
                >
                  <p className="text-[11px] font-semibold text-white truncate leading-tight">{conv.senderName}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5 leading-tight">{conv.lastMessage || "—"}</p>
                  <p className="text-[9px] text-gray-700 mt-0.5">
                    {new Date(conv.lastTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {!selectedChatId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <FiMessageSquare size={28} className="text-gray-700 mb-3" />
              <p className="text-sm text-gray-600">Select a conversation</p>
              <p className="text-xs text-gray-700 mt-1">
                or press <span className="text-cyan-600">+</span> to start one
              </p>
            </div>
          ) : (
            <>
              {/* Thread sub-header */}
              <div className="px-3 py-2 border-b border-white/10 bg-black/20 shrink-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {selectedConv?.senderName ?? selectedChatId}
                </p>
                <p className="text-[10px] text-gray-600 font-mono">{selectedChatId}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {threadMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-gray-600">No messages yet in this chat.</p>
                  </div>
                ) : (
                  threadMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl ${
                        msg.direction === "out"
                          ? "bg-cyan-600/40 border border-cyan-500/30 text-white rounded-br-sm"
                          : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm"
                      }`}>
                        <MessageContent msg={msg} />
                        {msg.text && msg.mediaType && (
                          <p className="text-xs text-gray-400 mt-1">{msg.text}</p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-1 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Media preview */}
              {selectedFile && selectedMediaType && (
                <div className="mx-3 mb-2 bg-white/5 border border-white/10 rounded-xl p-2.5 shrink-0">
                  <div className="flex items-start gap-2.5">
                    {previewUrl && selectedMediaType === "photo" ? (
                      <img src={previewUrl} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    ) : previewUrl && selectedMediaType === "video" ? (
                      <video src={previewUrl} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <FiFile size={18} className="text-amber-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-500">{mediaLabel[selectedMediaType]} · {(selectedFile.size / 1024).toFixed(0)} KB</p>
                      <input value={mediaCaption} onChange={(e) => setMediaCaption(e.target.value)}
                        placeholder="Add a caption…"
                        className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500" />
                    </div>
                    <button onClick={clearSelectedFile} className="p-1 text-gray-500 hover:text-white transition-colors shrink-0">
                      <FiX size={14} />
                    </button>
                  </div>
                  <button onClick={handleSendMedia} disabled={sending}
                    className="w-full mt-2 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-40">
                    {sending ? "Sending…" : `Send ${mediaLabel[selectedMediaType]}`}
                  </button>
                </div>
              )}

              {/* Error */}
              {sendError && (
                <div className="mx-3 mb-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg shrink-0 flex items-center justify-between">
                  <p className="text-xs text-red-400">{sendError}</p>
                  <button onClick={() => setSendError("")} className="text-red-400 hover:text-red-300 shrink-0 ml-2"><FiX size={12} /></button>
                </div>
              )}

              {/* Input */}
              <div className="px-3 py-2.5 border-t border-white/10 bg-black/20 shrink-0">
                {isRecording ? (
                  <div className="flex items-center gap-3 h-9">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span className="text-sm text-red-400 font-medium flex-1">Recording… {formatSeconds(recordingSeconds)}</span>
                    <button onClick={() => stopRecording(true)} disabled={sending}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-40">
                      Send
                    </button>
                    <button onClick={() => stopRecording(false)}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <FiX size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-end">
                    <input ref={fileInputRef} type="file" accept="image/*,video/*,*" className="hidden" onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} title="Attach file"
                      className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-colors shrink-0">
                      <FiPaperclip size={15} />
                    </button>
                    <button onClick={startRecording} disabled={sending} title="Record voice"
                      className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-30 shrink-0">
                      <FiMic size={15} />
                    </button>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      rows={1}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                      style={{ minHeight: "36px", maxHeight: "80px" }}
                    />
                    <button onClick={handleSendText} disabled={!inputText.trim() || sending}
                      className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                      <FiSend size={15} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotPanel;
