import React from "react";
import EmployeeBottomNav from "@/components/EmployeeBottomNav";
import { Outlet } from "react-router-dom";

export default function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <main className="max-w-md mx-auto pb-24 pt-4 px-4">
        <Outlet />
      </main>
      <EmployeeBottomNav />
    </div>
  );
}
