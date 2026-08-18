import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@gov.id");
  const [password, setPassword] = useState("admin123");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const { loginAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") navigate("/admin", { replace: true });
    api.get("/settings").then((r) => setSettings(r.data)).catch(()=>{});
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAdmin(email, password);
      toast.success("Selamat datang, Administrator");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal masuk");
    } finally { setLoading(false); }
  };

  const bg = settings?.ad_image || "https://images.pexels.com/photos/16898413/pexels-photo-16898413.jpeg";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-md bg-primary text-white flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Portal Administrator</div>
              <div className="font-display text-2xl font-bold text-primary leading-tight">{settings?.main_title || "SiKerja"}</div>
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">Masuk Administrator</h1>
          <p className="mt-3 text-gray-600">Akses panel manajemen kehadiran pegawai {settings?.office_name || "Kantor Pemerintahan"}.</p>

          <form onSubmit={submit} className="mt-10 space-y-5" data-testid="admin-login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest font-semibold text-gray-700">Email</Label>
              <Input id="email" data-testid="admin-email-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="admin@gov.id" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw" className="text-xs uppercase tracking-widest font-semibold text-gray-700">Kata Sandi</Label>
              <div className="relative">
                <Input id="pw" data-testid="admin-password-input" type={show?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} required className="h-12 pr-11" />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" data-testid="admin-toggle-password">
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Checkbox checked={remember} onCheckedChange={setRemember} data-testid="admin-remember" /> Ingat saya
              </label>
              <button type="button" className="text-sm text-primary hover:underline">Lupa kata sandi?</button>
            </div>
            <Button type="submit" data-testid="admin-login-submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-[#5c0000] btn-tactile text-white font-semibold">
              {loading ? "Memproses..." : (<span className="flex items-center justify-center gap-2">Masuk <ArrowRight className="w-4 h-4"/></span>)}
            </Button>
            <div className="text-center text-sm text-gray-600">
              <Link to="/login" className="hover:text-primary hover:underline" data-testid="link-employee-login">Masuk sebagai pegawai →</Link>
            </div>
          </form>

          <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-muted-foreground">
            Kredensial demo: <span className="font-mono">admin@gov.id / admin123</span>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block overflow-hidden">
        <img src={bg} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 gov-gradient-overlay" />
        <div className="relative z-10 h-full flex flex-col justify-end p-12 text-white">
          <div className="text-[11px] uppercase tracking-[0.3em] font-semibold text-white/80 mb-3">Iklan Layanan Pemerintah</div>
          <h2 className="font-display text-3xl xl:text-4xl font-bold leading-tight">{settings?.ad_title || "Layanan Publik Pemerintah"}</h2>
          <p className="mt-3 max-w-lg text-white/90">{settings?.ad_description || "Informasi layanan publik terbaru dari pemerintah untuk masyarakat Indonesia."}</p>
        </div>
      </div>
    </div>
  );
}
