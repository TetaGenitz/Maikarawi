import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";
import { fmtDate } from "@/lib/api";

export default function LeavesAdminPage() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/leaves").then(r=>setItems(r.data));
  useEffect(load, []);
  const decide = async (id, status) => { await api.put(`/leaves/${id}/decision`, { status }); toast.success("Diperbarui"); load(); };
  return (
    <div className="space-y-6" data-testid="admin-leaves-page">
      <h1 className="font-display text-3xl font-bold">Pengajuan Cuti</h1>
      <Card className="border-gray-200"><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Pegawai</TableHead><TableHead>Jenis</TableHead><TableHead>Mulai</TableHead><TableHead>Selesai</TableHead><TableHead>Alasan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map(r=>(
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.employee_name}</TableCell>
              <TableCell>{r.leave_type}</TableCell>
              <TableCell className="tabular-nums">{fmtDate(r.start_date)}</TableCell>
              <TableCell className="tabular-nums">{fmtDate(r.end_date)}</TableCell>
              <TableCell className="text-muted-foreground max-w-[240px] truncate">{r.reason}</TableCell>
              <TableCell><StatusBadge status={r.status}/></TableCell>
              <TableCell className="text-right space-x-1">
                {r.status==="pending" && <>
                  <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800" onClick={()=>decide(r.id,"approved")}>Setujui</Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={()=>decide(r.id,"rejected")}>Tolak</Button>
                </>}
              </TableCell>
            </TableRow>
          ))}
          {items.length===0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada pengajuan</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}
