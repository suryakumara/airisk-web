import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface Props {
  botName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<Props> = ({ botName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="w-full max-w-sm mx-4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl">
      <div className="px-6 py-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <FiAlertTriangle size={22} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Delete Bot</h2>
          <p className="text-sm text-gray-400 mt-1">
            Are you sure you want to remove <span className="text-white font-semibold">"{botName}"</span> from your dashboard? This action cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-3 px-6 pb-6">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold text-white transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDeleteModal;
