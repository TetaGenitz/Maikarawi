import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Building2, MapPin, Clock, CheckCircle2, XCircle, Home, Laptop } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { fmtTime } from "@/lib/api";

const Stat = ({ icon: Icon, label, value, tint = "primary", testid }) => (
  <Card className="card-hover border-gray-200" data-testid={testid}>
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
          <div className="mt-3 font-display text-3xl font-bold tabular-nums">{value ?? "-"}</div>
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${tint === "primary" ? "bg-primary/10 text-primary" : tint === "success" ? "bg-emerald-100 text-emerald-700" : tint === "warn" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data));
    const d = new Date().toISOString().slice(0,10);
    api.get("/attendance", { params: { date_from: d, date_to: d } }).then(r => setToday(r.data));
  }, []);

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">Ringkasan Hari Ini</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">Dashboard Administrator</h1>
        </div>
        <div className="text-sm text-muted-foreground tabular-nums">{new Date().toLocaleDateString("id-ID", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Total Pegawai" value={stats?.total_employees} testid="stat-total" />
        <Stat icon={CheckCircle2} label="Hadir Hari Ini" value={stats?.present_today} tint="success" testid="stat-present" />
        <Stat icon={Building2} label="WFO" value={stats?.wfo_today} testid="stat-wfo" />
        <Stat icon={Laptop} label="WFH" value={stats?.wfh_today} testid="stat-wfh" />
        <Stat icon={Home} label="Cuti" value={stats?.leave_today} testid="stat-leave" />
        <Stat icon={XCircle} label="Tidak Hadir" value={stats?.absent_today} tint="warn" testid="stat-absent" />
        <Stat icon={Clock} label="Terlambat" value={stats?.late_today} tint="warn" testid="stat-late" />
        <Stat icon={MapPin} label="Belum Pulang" value={stats?.not_checked_out} testid="stat-not-out" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-gray-200">
          <CardHeader><CardTitle className="text-base font-semibold">Tren Kehadiran 7 Hari</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.trend || []}>
                <CartesianGrid stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#800000" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader><CardTitle className="text-base font-semibold">Kehadiran per Departemen</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.department_stats || []}>
                <CartesianGrid stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" name="Hadir" fill="#800000" />
                <Bar dataKey="total" name="Total" fill="#e5c1c1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200">
        <CardHeader><CardTitle className="text-base font-semibold">Kehadiran Hari Ini</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Pulang</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>GPS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {today.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">Belum ada data kehadiran hari ini</TableCell></TableRow>
                ) : today.map((r, i) => (
                  <TableRow key={r.id} data-testid={`today-row-${i}`}>
                    <TableCell className="tabular-nums">{i+1}</TableCell>
                    <TableCell className="font-medium">{r.employee_code}</TableCell>
                    <TableCell>{r.employee_name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.department_name}</TableCell>
                    <TableCell className="tabular-nums">{fmtTime(r.check_in_time)}</TableCell>
                    <TableCell className="tabular-nums">{fmtTime(r.check_out_time)}</TableCell>
                    <TableCell><StatusBadge status={r.attendance_type} /></TableCell>
                    <TableCell><StatusBadge status={r.check_out_time ? r.attendance_status : "incomplete"} /></TableCell>
                    <TableCell>{r.gps_verified ? <span className="text-emerald-700 text-xs font-semibold">Terverifikasi</span> : <span className="text-red-600 text-xs">Tidak</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
