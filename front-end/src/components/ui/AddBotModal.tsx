import React, { useState } from "react";
import { FiX, FiLoader, FiCheck } from "react-icons/fi";
import { useBotStore } from "../../store/useBotStore";

interface Props {
  onClose: () => void;
}

const AddBotModal: React.FC<Props> = ({ onClose }) => {
  const addBot = useBotStore((s) => s.addBot);

  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ username: string } | null>(null);

  const handleVerify = async () => {
    if (!name.trim()) { setError("Bot name is required."); return; }
    if (!token.trim()) { setError("Bot token is required."); return; }
    setError("");
    setLoading(true);
    try {
      // addBot already calls the API which verifies the token via getMe
      const bot = await addBot({ token: token.trim(), name: name.trim(), description: description.trim() || undefined });
      if (!bot) {
        setError("Invalid token or bot already added.");
      } else {
        setPreview({ username: bot.username ?? "unknown" });
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl">
          <div className="px-6 py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
              <FiCheck size={28} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-base">{name}</p>
              <p className="text-cyan-400 text-sm">@{preview.username}</p>
              {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
            </div>
            <p className="text-gray-300 text-sm">Bot added successfully!</p>
          </div>
          <div className="px-6 pb-6">
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white transition-colors">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Add New Bot</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><FiX size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bot Name <span className="text-cyan-400">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My News Bot"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bot Token <span className="text-cyan-400">*</span></label>
            <input value={token} onChange={(e) => setToken(e.target.value)}
              placeholder="123456789:ABCDef…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono" />
            <p className="text-xs text-gray-500 mt-1">Get your token from @BotFather on Telegram.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description <span className="text-gray-500">(optional)</span></label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Handles breaking news alerts"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={handleVerify} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <FiLoader className="animate-spin" size={16} />}
            {loading ? "Adding…" : "Add Bot"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBotModal;
