import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiMessageSquare, FiLogOut, FiMenu, FiX, FiChevronRight } from "react-icons/fi";
import { RiTelegramLine } from "react-icons/ri";
import logo from "../../assets/logo.png";
import { useAuthStore } from "../../store/useAuthStore";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: "Telegram Multi-panel",
    to: "/dashboard",
    icon: <RiTelegramLine size={18} />,
  },
  // Future items can be added here
  {
    label: "Analytics",
    to: "/dashboard/analytics",
    icon: <FiMessageSquare size={16} />,
    badge: "Soon",
  },
];

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10 shrink-0">
        <img src={logo} alt="AIRISK AI" className="h-7 w-auto" />
        <span className="text-base font-bold tracking-wider text-white">AIRISK AI</span>
      </div>

      {/* Nav section label */}
      <div className="px-5 pt-5 pb-2 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Tools</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-cyan-600/15 text-cyan-400 border border-cyan-500/20 shadow-[0_0_16px_rgba(6,182,212,0.08)]"
                  : item.badge
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span
              className={`shrink-0 transition-colors`}
            >
              {item.icon}
            </span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-gray-600">
                {item.badge}
              </span>
            )}
            {!item.badge && (
              <FiChevronRight
                size={13}
                className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-cyan-400">
              {user?.name?.slice(0, 2).toUpperCase() ?? "??"}
            </span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name ?? "—"}</p>
            <p className="text-xs text-gray-500 truncate leading-tight">{user?.email ?? "—"}</p>
          </div>
          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          >
            <FiLogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-gray-950 border-r border-white/10">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 flex flex-col w-64 bg-gray-950 border-r border-white/10 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Content Area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gray-950 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <img src={logo} alt="AIRISK AI" className="h-6 w-auto" />
          <span className="text-sm font-bold tracking-wider">AIRISK AI</span>
        </div>

        {/* Page outlet */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
