import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminWorkPlansPage() {
  const [items, setItems] = useState([]);
  useEffect(()=>{ api.get("/work-plans").then(r=>setItems(r.data)); }, []);
  return (
    <div className="space-y-6" data-testid="admin-workplans-page">
      <h1 className="font-display text-3xl font-bold">Rencana Kerja Pegawai</h1>
      <Card className="border-gray-200"><CardContent className="p-0 overflow-auto"><Table>
        <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Rencana</TableHead><TableHead>Prioritas</TableHead><TableHead>Target</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map(r=>(
            <TableRow key={r.id}><TableCell className="tabular-nums">{r.work_date}</TableCell><TableCell>{r.work_plan}</TableCell><TableCell>{r.priority}</TableCell><TableCell className="text-muted-foreground">{r.target}</TableCell></TableRow>
          ))}
          {items.length===0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada rencana kerja</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}
