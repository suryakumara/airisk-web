import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { useBotStore } from "../../store/useBotStore";
import type { Bot } from "../../types/bot.types";

interface Props {
  bot: Bot;
  onClose: () => void;
}

const EditBotModal: React.FC<Props> = ({ bot, onClose }) => {
  const updateBot = useBotStore((s) => s.updateBot);

  const [name, setName] = useState(bot.name);
  const [description, setDescription] = useState(bot.description ?? "");
  const [chatId, setChatId] = useState(bot.chatId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Bot name is required.";
    if (chatId.trim() && !/^-?\d+$/.test(chatId.trim()))
      e.chatId = "Chat ID must be a number (e.g. 123456789 or -100123456789).";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    await updateBot(bot.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      chatId: chatId.trim() || undefined,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Bot</h2>
            {bot.username && <p className="text-xs text-cyan-400">@{bot.username}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><FiX size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bot Name <span className="text-cyan-400">*</span></label>
            <input value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description <span className="text-gray-500">(optional)</span></label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this bot do?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Chat ID <span className="text-gray-500">(optional)</span></label>
            <input value={chatId} onChange={(e) => { setChatId(e.target.value); setErrors((p) => ({ ...p, chatId: "" })); }}
              placeholder="e.g. 123456789"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono" />
            {errors.chatId && <p className="text-xs text-red-400 mt-1">{errors.chatId}</p>}
            <p className="text-xs text-gray-500 mt-1">Send any message to your bot — the Chat ID will be auto-detected.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Token</label>
            <input value={bot.token} readOnly
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-mono cursor-not-allowed" />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBotModal;
