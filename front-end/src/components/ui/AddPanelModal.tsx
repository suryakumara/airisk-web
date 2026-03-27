import React, { useState } from "react";
import { FiX, FiLoader } from "react-icons/fi";
import { useTelegramStore } from "../../store/useTelegramStore";

interface Props {
  onClose: () => void;
}

const AddPanelModal: React.FC<Props> = ({ onClose }) => {
  const addPanel = useTelegramStore((s) => s.addPanel);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    const u = username.replace(/^@/, "").trim();
    if (!u) { setError("Enter a bot username."); return; }
    setError("");
    setLoading(true);
    const result = await addPanel(u);
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.message ?? "Could not add bot.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-base font-bold text-white">Add Bot Panel</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Bot Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="@mybot or mybot"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-xs text-gray-600 mt-1.5">The bot must exist on Telegram. You'll chat with it as yourself.</p>
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={handleAdd} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <FiLoader className="animate-spin" size={14} />}
            {loading ? "Adding…" : "Add Panel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPanelModal;
