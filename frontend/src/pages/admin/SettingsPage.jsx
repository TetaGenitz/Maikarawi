import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/settings").then(r=>setS(r.data)); }, []);
  if (!s) return <div>Memuat...</div>;
  const save = async () => { const { data } = await api.put("/settings", s); setS(data); toast.success("Pengaturan tersimpan"); };
  const set = (k, v) => setS({ ...s, [k]: v });
  return (
    <div className="space-y-6" data-testid="settings-page">
      <h1 className="font-display text-3xl font-bold">Pengaturan Sistem</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader><CardTitle className="text-base">Branding & Login</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Nama Kantor</Label><Input value={s.office_name||""} onChange={(e)=>set("office_name", e.target.value)} data-testid="setting-office-name"/></div>
            <div><Label>Judul Utama</Label><Input value={s.main_title||""} onChange={(e)=>set("main_title", e.target.value)}/></div>
            <div><Label>Subjudul</Label><Input value={s.subtitle||""} onChange={(e)=>set("subtitle", e.target.value)}/></div>
            <div><Label>Warna Primer</Label><Input type="color" value={s.primary_color||"#800000"} onChange={(e)=>set("primary_color", e.target.value)}/></div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader><CardTitle className="text-base">Iklan Layanan Pemerintah</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between"><Label>Aktifkan iklan</Label><Switch checked={!!s.ad_enabled} onCheckedChange={(v)=>set("ad_enabled", v)} data-testid="setting-ad-enabled"/></div>
            <div><Label>URL Gambar Iklan</Label><Input value={s.ad_image||""} onChange={(e)=>set("ad_image", e.target.value)} data-testid="setting-ad-image"/></div>
            <div><Label>Judul</Label><Input value={s.ad_title||""} onChange={(e)=>set("ad_title", e.target.value)}/></div>
            <div><Label>Deskripsi</Label><Textarea value={s.ad_description||""} onChange={(e)=>set("ad_description", e.target.value)}/></div>
            <div><Label>URL Tujuan</Label><Input value={s.ad_url||""} onChange={(e)=>set("ad_url", e.target.value)}/></div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Aturan Kehadiran</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label>Jam Mulai</Label><Input type="time" value={s.start_time||"07:30"} onChange={(e)=>set("start_time", e.target.value)} data-testid="setting-start-time"/></div>
            <div><Label>Jam Selesai</Label><Input type="time" value={s.end_time||"16:00"} onChange={(e)=>set("end_time", e.target.value)}/></div>
            <div><Label>Toleransi Terlambat (menit)</Label><Input type="number" value={s.late_threshold_minutes||15} onChange={(e)=>set("late_threshold_minutes", parseInt(e.target.value))} data-testid="setting-late-threshold"/></div>
            <div><Label>Minimum Kerja (menit)</Label><Input type="number" value={s.min_work_minutes||420} onChange={(e)=>set("min_work_minutes", parseInt(e.target.value))}/></div>
          </CardContent>
        </Card>
      </div>
      <div><Button onClick={save} className="bg-primary hover:bg-[#5c0000]" data-testid="save-settings-btn">Simpan Pengaturan</Button></div>
    </div>
  );
}
