import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat...</div>;
  if (!user) return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
  return children;
}
