import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Home, Clock, ClipboardList, PalmtreeIcon, User, LogOut } from "lucide-react";

const items = [
  { to: "/app", icon: Home, label: "Beranda", end: true },
  { to: "/app/attendance", icon: Clock, label: "Absensi" },
  { to: "/app/workplan", icon: ClipboardList, label: "Rencana" },
  { to: "/app/leaves", icon: PalmtreeIcon, label: "Cuti" },
  { to: "/app/profile", icon: User, label: "Profil" },
];

export default function EmployeeBottomNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/85 border-t border-gray-200 z-40">
        <div className="max-w-md mx-auto grid grid-cols-5">
          {items.map((n) => (
            <NavLink
              key={n.to} to={n.to} end={n.end}
              data-testid={`bottom-nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  isActive ? "text-primary" : "text-gray-500"
                }`
              }
            >
              <n.icon className="w-5 h-5" />
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <button
        onClick={() => { logout(); navigate("/login"); }}
        className="fixed top-3 right-3 z-40 p-2 rounded-md bg-white/90 border border-gray-200 hover:bg-gray-50 shadow-sm"
        data-testid="employee-logout-btn"
        aria-label="Keluar"
      >
        <LogOut className="w-4 h-4 text-gray-700" />
      </button>
    </>
  );
}
