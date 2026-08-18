import React, { useEffect, useState } from "react";
import { api, fmtTime, fmtDate } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";

export default function MyAttendance() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/attendance").then(r=>setItems(r.data)); }, []);
  const summary = {
    total: items.length,
    wfo: items.filter(x=>x.attendance_type==="WFO").length,
    wfh: items.filter(x=>x.attendance_type==="WFH").length,
    late: items.filter(x=>x.attendance_status==="late").length,
  };
  return (
    <div className="space-y-4" data-testid="my-attendance-page">
      <h1 className="font-display text-2xl font-bold">Riwayat Absensi</h1>
      <div className="grid grid-cols-4 gap-2">
        {[["Total",summary.total],["WFO",summary.wfo],["WFH",summary.wfh],["Terlambat",summary.late]].map(([k,v])=>(
          <Card key={k} className="border-gray-200"><CardContent className="p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{k}</div>
            <div className="font-display text-xl font-bold tabular-nums mt-1">{v}</div>
          </CardContent></Card>
        ))}
      </div>
      <Card className="border-gray-200"><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Masuk</TableHead><TableHead>Pulang</TableHead><TableHead>Tipe</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map(r=>(
            <TableRow key={r.id}>
              <TableCell className="tabular-nums text-xs">{fmtDate(r.attendance_date)}</TableCell>
              <TableCell className="tabular-nums text-xs">{fmtTime(r.check_in_time)}</TableCell>
              <TableCell className="tabular-nums text-xs">{fmtTime(r.check_out_time)}</TableCell>
              <TableCell><StatusBadge status={r.attendance_type}/></TableCell>
              <TableCell><StatusBadge status={r.check_out_time ? r.attendance_status : "incomplete"}/></TableCell>
            </TableRow>
          ))}
          {items.length===0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">Belum ada riwayat</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}
