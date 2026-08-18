import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
