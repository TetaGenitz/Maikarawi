import React from "react";
import { Badge } from "@/components/ui/badge";

const map = {
  on_time: { label: "Tepat Waktu", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  late: { label: "Terlambat", cls: "bg-orange-50 text-orange-800 border-orange-200" },
  absent: { label: "Tidak Hadir", cls: "bg-red-50 text-red-800 border-red-200" },
  incomplete: { label: "Belum Pulang", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  approved: { label: "Disetujui", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  pending: { label: "Menunggu", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  rejected: { label: "Ditolak", cls: "bg-red-50 text-red-800 border-red-200" },
  active: { label: "Aktif", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  inactive: { label: "Nonaktif", cls: "bg-gray-100 text-gray-700 border-gray-200" },
  WFO: { label: "WFO", cls: "bg-primary/10 text-primary border-primary/20" },
  WFH: { label: "WFH", cls: "bg-indigo-50 text-indigo-800 border-indigo-200" },
};

export default function StatusBadge({ status }) {
  const s = map[status] || { label: status || "-", cls: "bg-gray-100 text-gray-700 border-gray-200" };
  return <Badge variant="outline" className={`${s.cls} font-medium`}>{s.label}</Badge>;
}
