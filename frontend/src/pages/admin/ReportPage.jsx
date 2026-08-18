import React, { useEffect, useState } from "react";
import { api, fmtTime } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { FileSpreadsheet, FileText } from "lucide-react";

export default function ReportPage({ mode }) {  // "weekly" | "monthly"
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()+1);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); const day = d.getDay(); const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff); return d.toISOString().slice(0,10);
  });
  const [employeeId, setEmployeeId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [depts, setDepts] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/employees").then(r=>setEmployees(r.data));
    api.get("/departments").then(r=>setDepts(r.data));
  }, []);

  const load = () => {
    const params = { employee_id: employeeId || undefined, department_id: deptId || undefined };
    const req = mode === "weekly"
      ? api.get("/reports/weekly", { params: { week_start: weekStart, ...params } })
      : api.get("/reports/monthly", { params: { year, month, ...params } });
    req.then(r=>setData(r.data));
  };
  useEffect(load, [mode]);

  const exportExcel = async () => {
    const { data: blob } = await api.get("/exports/excel", { params: { date_from: data.period.from, date_to: data.period.to, employee_id: employeeId || undefined, department_id: deptId || undefined }, responseType: "blob" });
    const url = URL.createObjectURL(new Blob([blob])); const a = document.createElement("a"); a.href = url; a.download = `laporan-${data.period.from}.xlsx`; a.click();
  };
  const exportPdf = async () => {
    const { data: blob } = await api.get("/exports/pdf", { params: { date_from: data.period.from, date_to: data.period.to, employee_id: employeeId || undefined, department_id: deptId || undefined }, responseType: "blob" });
    const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" })); const a = document.createElement("a"); a.href = url; a.download = `laporan-${data.period.from}.pdf`; a.click();
  };

  return (
    <div className="space-y-6" data-testid={`${mode}-report-page`}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Laporan {mode==="weekly"?"Mingguan":"Bulanan"}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel} data-testid="export-excel-btn"><FileSpreadsheet className="w-4 h-4 mr-1"/>Excel</Button>
          <Button variant="outline" onClick={exportPdf} data-testid="export-pdf-btn"><FileText className="w-4 h-4 mr-1"/>PDF</Button>
        </div>
      </div>
      <Card className="border-gray-200"><CardContent className="p-5 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
        {mode==="weekly" ? (
          <div><Label>Awal Minggu</Label><Input type="date" value={weekStart} onChange={(e)=>setWeekStart(e.target.value)} data-testid="week-start-input"/></div>
        ) : (
          <>
            <div><Label>Tahun</Label><Input type="number" value={year} onChange={(e)=>setYear(parseInt(e.target.value))}/></div>
            <div><Label>Bulan</Label>
              <Select value={String(month)} onValueChange={(v)=>setMonth(parseInt(v))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{Array.from({length:12}).map((_,i)=><SelectItem key={i+1} value={String(i+1)}>{new Date(2000,i,1).toLocaleDateString("id-ID",{month:"long"})}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </>
        )}
        <div><Label>Pegawai</Label>
          <Select value={employeeId || "all"} onValueChange={(v)=>setEmployeeId(v==="all"?"":v)}>
            <SelectTrigger data-testid="filter-employee"><SelectValue placeholder="Semua"/></SelectTrigger>
            <SelectContent><SelectItem value="all">Semua</SelectItem>{employees.map(e=><SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Departemen</Label>
          <Select value={deptId || "all"} onValueChange={(v)=>setDeptId(v==="all"?"":v)}>
            <SelectTrigger data-testid="filter-department"><SelectValue placeholder="Semua"/></SelectTrigger>
            <SelectContent><SelectItem value="all">Semua</SelectItem>{depts.map(d=><SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={load} className="bg-primary hover:bg-[#5c0000]" data-testid="load-report-btn">Muat</Button>
      </CardContent></Card>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[["Total", data.summary.total],["WFO", data.summary.wfo],["WFH", data.summary.wfh],["Tepat Waktu", data.summary.on_time],["Terlambat", data.summary.late]].map(([k,v])=>(
              <Card key={k} className="border-gray-200"><CardContent className="p-4">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{k}</div>
                <div className="mt-2 font-display text-2xl font-bold tabular-nums">{v}</div>
              </CardContent></Card>
            ))}
          </div>
          <Card className="border-gray-200"><CardContent className="p-0 overflow-auto"><Table>
            <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Pegawai</TableHead><TableHead>Departemen</TableHead><TableHead>Masuk</TableHead><TableHead>Pulang</TableHead><TableHead>Tipe</TableHead><TableHead>Status</TableHead><TableHead>Aktivitas</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.rows.map(r=>(
                <TableRow key={r.id}>
                  <TableCell className="tabular-nums">{r.attendance_date}</TableCell>
                  <TableCell>{r.employee_name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.department_name}</TableCell>
                  <TableCell className="tabular-nums">{fmtTime(r.check_in_time)}</TableCell>
                  <TableCell className="tabular-nums">{fmtTime(r.check_out_time)}</TableCell>
                  <TableCell><StatusBadge status={r.attendance_type}/></TableCell>
                  <TableCell><StatusBadge status={r.check_out_time ? r.attendance_status : "incomplete"}/></TableCell>
                  <TableCell className="max-w-[240px] truncate">{r.activity || "-"}</TableCell>
                </TableRow>
              ))}
              {data.rows.length===0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Belum ada data pada periode ini</TableCell></TableRow>}
            </TableBody>
          </Table></CardContent></Card>
        </>
      )}
    </div>
  );
}
