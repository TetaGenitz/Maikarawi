import React, { useEffect, useState } from "react";
import { api, fmtTime } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";

export default function AdminAttendancePage() {
  const [items, setItems] = useState([]);
  useEffect(()=>{ const d = new Date().toISOString().slice(0,10); api.get("/attendance", { params: { date_from: d, date_to: d } }).then(r=>setItems(r.data)); }, []);
  return (
    <div className="space-y-6" data-testid="admin-attendance-page">
      <h1 className="font-display text-3xl font-bold">Kehadiran Hari Ini</h1>
      <Card className="border-gray-200"><CardContent className="p-0 overflow-auto"><Table>
        <TableHeader><TableRow>
          <TableHead>No</TableHead><TableHead>NIP</TableHead><TableHead>Nama</TableHead><TableHead>Departemen</TableHead>
          <TableHead>Masuk</TableHead><TableHead>Pulang</TableHead><TableHead>Tipe</TableHead><TableHead>Status</TableHead>
          <TableHead>GPS</TableHead><TableHead>Selfie</TableHead><TableHead>Aktivitas</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {items.map((r,i)=>(
            <TableRow key={r.id}>
              <TableCell className="tabular-nums">{i+1}</TableCell>
              <TableCell className="font-medium">{r.employee_code}</TableCell>
              <TableCell>{r.employee_name}</TableCell>
              <TableCell className="text-muted-foreground">{r.department_name}</TableCell>
              <TableCell className="tabular-nums">{fmtTime(r.check_in_time)}</TableCell>
              <TableCell className="tabular-nums">{fmtTime(r.check_out_time)}</TableCell>
              <TableCell><StatusBadge status={r.attendance_type}/></TableCell>
              <TableCell><StatusBadge status={r.check_out_time ? r.attendance_status : "incomplete"}/></TableCell>
              <TableCell>{r.gps_verified ? <span className="text-emerald-700 text-xs font-semibold">OK</span> : <span className="text-red-600 text-xs">-</span>}</TableCell>
              <TableCell>{r.check_in_selfie ? <img src={r.check_in_selfie} className="w-9 h-9 object-cover rounded" alt=""/> : "-"}</TableCell>
              <TableCell className="max-w-[220px] truncate">{r.activity || "-"}</TableCell>
            </TableRow>
          ))}
          {items.length===0 && <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Belum ada data hari ini</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}
