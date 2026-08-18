import React, { useEffect, useState } from "react";
import { api, fmtTime, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, MapPin, LogOut as LogOutIcon, LogIn, Loader2, Clock } from "lucide-react";
import SelfieCapture from "@/components/SelfieCapture";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";

const getPosition = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) return reject(new Error("Browser tidak mendukung GPS"));
  navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
});

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const emp = user?.employee;
  const [today, setToday] = useState(null);
  const [now, setNow] = useState(new Date());
  const [attendanceType, setAttendanceType] = useState("WFO");
  const [selfieOpen, setSelfieOpen] = useState(false);
  const [selfieMode, setSelfieMode] = useState("in"); // "in" | "out"
  const [busy, setBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ activity: "", output: "", activity_status: "completed", notes: "" });
  const [pendingSelfie, setPendingSelfie] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    load();
    return () => clearInterval(t);
  }, []);
  const load = () => api.get("/attendance/today").then(r => setToday(r.data)).catch(()=>{});

  const doCheckIn = async (selfie) => {
    setBusy(true);
    try {
      let pos = null;
      try { pos = await getPosition(); } catch (e) {
        if (attendanceType === "WFO") { toast.error("Izinkan akses GPS untuk WFO"); setBusy(false); return; }
      }
      const body = {
        attendance_type: attendanceType,
        selfie,
        latitude: pos?.coords.latitude,
        longitude: pos?.coords.longitude,
        accuracy: pos?.coords.accuracy,
      };
      const { data } = await api.post("/attendance/check-in", body);
      setToday(data);
      toast.success("Check-in berhasil");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally { setBusy(false); }
  };

  const doCheckOut = async () => {
    if (!pendingSelfie) return;
    setBusy(true);
    try {
      let pos = null;
      try { pos = await getPosition(); } catch {}
      const body = {
        ...checkoutData,
        selfie: pendingSelfie,
        latitude: pos?.coords.latitude,
        longitude: pos?.coords.longitude,
        accuracy: pos?.coords.accuracy,
      };
      const { data } = await api.post("/attendance/check-out", body);
      setToday(data);
      toast.success("Check-out berhasil");
      setCheckoutOpen(false);
      setPendingSelfie(null);
      setCheckoutData({ activity: "", output: "", activity_status: "completed", notes: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally { setBusy(false); }
  };

  const onSelfieCaptured = (data) => {
    if (selfieMode === "in") {
      doCheckIn(data);
    } else {
      setPendingSelfie(data);
      setCheckoutOpen(true);
    }
  };

  const canCheckIn = !today?.check_in_time;
  const canCheckOut = today?.check_in_time && !today?.check_out_time;

  return (
    <div className="space-y-5" data-testid="employee-dashboard">
      <div className="bg-primary text-white rounded-xl p-5">
        <div className="text-[11px] uppercase tracking-widest text-white/80 font-semibold">Selamat Datang</div>
        <div className="mt-1 font-display text-2xl font-bold leading-tight">{emp?.full_name || user?.email}</div>
        <div className="text-white/85 text-sm mt-1">{emp?.employee_id} • {emp?.position || "Pegawai"}</div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/70">Waktu Saat Ini</div>
            <div className="font-mono-time text-4xl font-bold tabular-nums mt-1">{now.toLocaleTimeString("id-ID", { hour12: false })}</div>
          </div>
          <div className="text-right text-sm">
            <div className="text-white/70">{now.toLocaleDateString("id-ID", { weekday: "long" })}</div>
            <div className="font-semibold">{now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</div>
          </div>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Status Hari Ini</div>
          {today ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-muted-foreground">Masuk</div><div className="font-semibold tabular-nums">{fmtTime(today.check_in_time)}</div></div>
              <div><div className="text-muted-foreground">Pulang</div><div className="font-semibold tabular-nums">{fmtTime(today.check_out_time)}</div></div>
              <div><div className="text-muted-foreground">Tipe</div><StatusBadge status={today.attendance_type} /></div>
              <div><div className="text-muted-foreground">Status</div><StatusBadge status={today.check_out_time ? today.attendance_status : "incomplete"} /></div>
              <div className="col-span-2"><div className="text-muted-foreground">GPS</div>{today.gps_verified ? <span className="text-emerald-700 text-xs font-semibold">Terverifikasi</span> : <span className="text-red-600 text-xs">Tidak Terverifikasi</span>}</div>
            </div>
          ) : <div className="text-sm text-muted-foreground">Belum ada absensi hari ini.</div>}
        </CardContent>
      </Card>

      {canCheckIn && (
        <Card className="border-gray-200">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-widest font-semibold text-gray-700">Tipe Absensi</Label>
              <Select value={attendanceType} onValueChange={setAttendanceType}>
                <SelectTrigger className="mt-2 h-11" data-testid="attendance-type-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WFO">WFO (Work From Office)</SelectItem>
                  <SelectItem value="WFH">WFH (Work From Home)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              disabled={busy}
              onClick={() => { setSelfieMode("in"); setSelfieOpen(true); }}
              data-testid="check-in-btn"
              className="w-full h-24 rounded-xl bg-primary hover:bg-[#5c0000] text-white font-display text-2xl font-bold btn-tactile ring-pulse flex items-center justify-center gap-3"
            >
              {busy ? <Loader2 className="w-6 h-6 animate-spin"/> : <><LogIn className="w-7 h-7" /> CHECK IN</>}
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" /> GPS <Camera className="w-3.5 h-3.5 ml-2" /> Selfie diperlukan
            </div>
          </CardContent>
        </Card>
      )}

      {canCheckOut && (
        <Card className="border-gray-200">
          <CardContent className="p-5">
            <button
              disabled={busy}
              onClick={() => { setSelfieMode("out"); setSelfieOpen(true); }}
              data-testid="check-out-btn"
              className="w-full h-24 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display text-2xl font-bold btn-tactile flex items-center justify-center gap-3"
            >
              {busy ? <Loader2 className="w-6 h-6 animate-spin"/> : <><LogOutIcon className="w-7 h-7" /> CHECK OUT</>}
            </button>
          </CardContent>
        </Card>
      )}

      {today?.check_out_time && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-5 flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-700" />
            <div>
              <div className="font-semibold text-emerald-900">Absensi Selesai</div>
              <div className="text-xs text-emerald-800">Terima kasih atas kerja keras Anda hari ini.</div>
            </div>
          </CardContent>
        </Card>
      )}

      <SelfieCapture open={selfieOpen} onClose={() => setSelfieOpen(false)} onCapture={onSelfieCaptured}
        title={selfieMode === "in" ? "Selfie Check-in" : "Selfie Check-out"} />

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent data-testid="checkout-dialog">
          <DialogHeader><DialogTitle>Laporan Kegiatan Hari Ini</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">Wajib diisi sebelum melakukan check-out.</p>
          <div className="space-y-3">
            <div>
              <Label>Aktivitas hari ini <span className="text-primary">*</span></Label>
              <Textarea placeholder="Contoh: Menyusun laporan logistik, mengikuti rapat koordinasi..." value={checkoutData.activity} onChange={(e)=>setCheckoutData({...checkoutData, activity: e.target.value})} data-testid="checkout-activity" rows={3} />
            </div>
            <div>
              <Label>Output Kinerja <span className="text-primary">*</span></Label>
              <Textarea placeholder="Contoh: 1 draft laporan selesai, notulen rapat terkirim..." value={checkoutData.output} onChange={(e)=>setCheckoutData({...checkoutData, output: e.target.value})} data-testid="checkout-output" rows={3} />
            </div>
            <div>
              <Label>Status Penyelesaian</Label>
              <Select value={checkoutData.activity_status} onValueChange={(v)=>setCheckoutData({...checkoutData, activity_status: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="partial">Sebagian Selesai</SelectItem>
                  <SelectItem value="not_completed">Belum Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catatan (opsional)</Label>
              <Textarea value={checkoutData.notes} onChange={(e)=>setCheckoutData({...checkoutData, notes: e.target.value})} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>{setCheckoutOpen(false); setPendingSelfie(null);}}>Batal</Button>
            <Button disabled={busy || !checkoutData.activity.trim() || !checkoutData.output.trim()} onClick={doCheckOut} data-testid="checkout-submit-btn" className="bg-primary hover:bg-[#5c0000]">Simpan & Check-out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
