import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiPlus, FiLoader } from "react-icons/fi";
import { useBotStore } from "../store/useBotStore";
import { useLayoutStore } from "../store/useLayoutStore";
import BotPanel from "../components/ui/BotPanel";
import AddBotModal from "../components/ui/AddBotModal";
import EditBotModal from "../components/ui/EditBotModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import type { Bot } from "../types/bot.types";

// ─── Sortable Wrapper ────────────────────────────────────────────────────────
interface SortableItemProps {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (listeners: Record<string, any> | undefined, attributes: Record<string, any>, isDragging: boolean) => React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined }}
    >
      {children(listeners, attributes, isDragging)}
    </div>
  );
};

// ─── Column Selector ─────────────────────────────────────────────────────────
const ColButton: React.FC<{ n: number; active: boolean; onClick: () => void }> = ({ n, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-150 ${
      active
        ? "bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
    }`}
  >
    {n}
  </button>
);

// ─── Telegram Multi-panel Page ───────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { bots, loading, fetchBots, reorderBots, removeBot } = useBotStore();
  const { columns, setColumns } = useLayoutStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [deletingBot, setDeletingBot] = useState<Bot | null>(null);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBots(Number(active.id), Number(over.id));
    }
  };

  const confirmDelete = () => {
    if (deletingBot) { removeBot(deletingBot.id); setDeletingBot(null); }
  };

  return (
    <div className="flex flex-col min-h-full bg-black">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-sm shrink-0">
        <div>
          <h1 className="text-base font-bold text-white">Telegram Multi-panel</h1>
          {bots.length > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)]" />
              <span className="text-xs text-gray-500">
                {bots.length} bot{bots.length !== 1 ? "s" : ""} · polling every 3s
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Column selector */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs text-gray-600 mr-0.5">Cols</span>
            {[1, 2, 3, 4].map((n) => (
              <ColButton key={n} n={n} active={columns === n} onClick={() => setColumns(n)} />
            ))}
          </div>
          {/* Add bot */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold text-white transition-all duration-150 shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:shadow-[0_0_24px_rgba(6,182,212,0.35)]"
          >
            <FiPlus size={15} />
            Add Bot
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <FiLoader className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : bots.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-4xl">🤖</span>
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center shadow-[0_0_14px_rgba(6,182,212,0.5)]">
                <FiPlus size={14} className="text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No bots yet</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
              Add your first Telegram bot to start managing multiple chats from one dashboard.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            >
              <FiPlus size={15} />
              Add Your First Bot
            </button>
          </div>
        ) : (
          /* Bot grid */
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={bots.map((b) => String(b.id))} strategy={rectSortingStrategy}>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {bots.map((bot) => (
                  <SortableItem key={bot.id} id={String(bot.id)}>
                    {(listeners, attributes, isDragging) => (
                      <BotPanel
                        bot={bot}
                        dragHandleListeners={listeners}
                        dragHandleAttributes={attributes}
                        isDragging={isDragging}
                        onEdit={() => setEditingBot(bot)}
                        onDelete={() => setDeletingBot(bot)}
                      />
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddModal && <AddBotModal onClose={() => setShowAddModal(false)} />}
      {editingBot && <EditBotModal bot={editingBot} onClose={() => setEditingBot(null)} />}
      {deletingBot && (
        <ConfirmDeleteModal
          botName={deletingBot.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingBot(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
