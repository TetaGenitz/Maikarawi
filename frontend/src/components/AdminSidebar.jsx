import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  LayoutDashboard, Users, Building2, MapPin, CalendarDays, FileSpreadsheet,
  Settings, LogOut, ClipboardList, PalmtreeIcon, ClipboardCheck, FileText,
} from "lucide-react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/attendance", label: "Kehadiran Hari Ini", icon: ClipboardCheck },
  { to: "/admin/weekly", label: "Laporan Mingguan", icon: FileText },
  { to: "/admin/monthly", label: "Laporan Bulanan", icon: FileSpreadsheet },
  { to: "/admin/employees", label: "Pegawai", icon: Users },
  { to: "/admin/departments", label: "Departemen", icon: Building2 },
  { to: "/admin/locations", label: "Lokasi Kantor", icon: MapPin },
  { to: "/admin/holidays", label: "Hari Libur", icon: CalendarDays },
  { to: "/admin/leaves", label: "Cuti", icon: PalmtreeIcon },
  { to: "/admin/workplans", label: "Rencana Kerja", icon: ClipboardList },
  { to: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  useEffect(() => { api.get("/settings").then(r => setSettings(r.data)).catch(()=>{}); }, []);
  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen flex flex-col z-30">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {settings?.logo ? (
            <img src={settings.logo} alt="logo" className="w-11 h-11 rounded-md object-contain bg-white" data-testid="sidebar-logo" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-primary text-white flex items-center justify-center font-display font-bold">MK</div>
          )}
          <div>
            <div className="font-display text-lg font-bold text-primary leading-none">{settings?.main_title || "Mai Karawi"}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Admin Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to} to={n.to} end={n.end}
            data-testid={`sidebar-${n.label.toLowerCase().replace(/\s+/g,"-")}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <n.icon className="w-4 h-4" />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-200">
        <div className="px-2 py-2 text-xs text-muted-foreground">Masuk sebagai</div>
        <div className="px-2 pb-2 text-sm font-semibold truncate">{user?.email}</div>
        <button
          onClick={() => { logout(); navigate("/admin/login"); }}
          data-testid="admin-logout-btn"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>
    </aside>
  );
}
