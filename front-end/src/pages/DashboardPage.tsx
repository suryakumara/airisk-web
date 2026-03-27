import React, { useState, useEffect } from "react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiPlus, FiLoader, FiZap, FiLogOut } from "react-icons/fi";
import { RiTelegramLine } from "react-icons/ri";
import { useTelegramStore } from "../store/useTelegramStore";
import { useLayoutStore } from "../store/useLayoutStore";
import ChatPanel from "../components/ui/ChatPanel";
import ConnectTelegramModal from "../components/ui/ConnectTelegramModal";
import AddPanelModal from "../components/ui/AddPanelModal";
import type { ChatPanel as ChatPanelType } from "../types/telegram.types";

// ─── Sortable wrapper ────────────────────────────────────────────────────────
interface SortableItemProps {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (listeners: Record<string, any> | undefined, attributes: Record<string, any>, isDragging: boolean) => React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined }}>
      {children(listeners, attributes, isDragging)}
    </div>
  );
};

// ─── Column selector button ──────────────────────────────────────────────────
const ColButton: React.FC<{ n: number; active: boolean; onClick: () => void }> = ({ n, active, onClick }) => (
  <button onClick={onClick}
    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-150 ${
      active
        ? "bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
    }`}>
    {n}
  </button>
);

// ─── Main page ───────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { connected, account, panels, loading, fetchStatus, fetchPanels, removePanel, reorderPanels, disconnectAccount } =
    useTelegramStore();
  const { columns, setColumns } = useLayoutStore();

  const [showConnect, setShowConnect] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [deletingPanel, setDeletingPanel] = useState<ChatPanelType | null>(null);

  useEffect(() => {
    fetchStatus().then(() => {
      if (useTelegramStore.getState().connected) fetchPanels();
    });
  }, [fetchStatus, fetchPanels]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) reorderPanels(Number(active.id), Number(over.id));
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full bg-black">
        <FiLoader className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  // ── Not connected ──
  if (!connected) {
    return (
      <div className="flex flex-col min-h-full bg-black">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-sm shrink-0">
          <h1 className="text-base font-bold text-white">Telegram Multi-panel</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
            <RiTelegramLine size={40} className="text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect your Telegram account</h2>
          <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
            Sign in with your personal Telegram account to chat with multiple bots side by side — all in one dashboard.
          </p>
          <button
            onClick={() => setShowConnect(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold text-white transition-all shadow-[0_0_24px_rgba(6,182,212,0.3)] hover:shadow-[0_0_32px_rgba(6,182,212,0.45)]"
          >
            <FiZap size={16} />
            Connect Telegram Account
          </button>
          <p className="text-xs text-gray-600 mt-4">Uses your phone number + OTP — same as Telegram Web</p>
        </div>
        {showConnect && <ConnectTelegramModal onClose={() => setShowConnect(false)} />}
      </div>
    );
  }

  // ── Connected ──
  return (
    <div className="flex flex-col min-h-full bg-black">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-sm shrink-0">
        <div>
          <h1 className="text-base font-bold text-white">Telegram Multi-panel</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)]" />
            <span className="text-xs text-gray-500">
              {account?.firstName ?? "Connected"} · {panels.length} panel{panels.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Column selector */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs text-gray-600 mr-0.5">Cols</span>
            {[1, 2, 3, 4].map((n) => (
              <ColButton key={n} n={n} active={columns === n} onClick={() => setColumns(n)} />
            ))}
          </div>
          {/* Disconnect */}
          <button
            onClick={disconnectAccount}
            title="Disconnect Telegram account"
            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <FiLogOut size={15} />
          </button>
          {/* Add panel */}
          <button
            onClick={() => setShowAddPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold text-white transition-all duration-150 shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:shadow-[0_0_24px_rgba(6,182,212,0.35)]"
          >
            <FiPlus size={15} />
            Add Bot
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {panels.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <RiTelegramLine size={36} className="text-gray-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center shadow-[0_0_14px_rgba(6,182,212,0.5)]">
                <FiPlus size={14} className="text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No bots added yet</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
              Add a bot by @username to start chatting with it as yourself.
            </p>
            <button
              onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            >
              <FiPlus size={15} />
              Add Your First Bot
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={panels.map((p) => String(p.id))} strategy={rectSortingStrategy}>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {panels.map((panel) => (
                  <SortableItem key={panel.id} id={String(panel.id)}>
                    {(listeners, attributes, isDragging) => (
                      <ChatPanel
                        panel={panel}
                        dragHandleListeners={listeners}
                        dragHandleAttributes={attributes}
                        isDragging={isDragging}
                        onDelete={() => setDeletingPanel(panel)}
                      />
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      {showAddPanel && <AddPanelModal onClose={() => setShowAddPanel(false)} />}
      {showConnect && <ConnectTelegramModal onClose={() => setShowConnect(false)} />}

      {/* Confirm delete panel */}
      {deletingPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl px-6 py-6 text-center space-y-4">
            <p className="text-white font-semibold">Remove <span className="text-cyan-400">@{deletingPanel.botUsername}</span>?</p>
            <p className="text-gray-500 text-sm">This removes the panel. Your Telegram conversation is untouched.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingPanel(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={() => { removePanel(deletingPanel.id); setDeletingPanel(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-semibold text-white transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
