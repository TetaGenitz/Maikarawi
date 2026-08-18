import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";

export default function EmployeeLogin() {
  const [email, setEmail] = useState("budi@gov.id");
  const [password, setPassword] = useState("employee123");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const { loginEmployee, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "employee") navigate("/app", { replace: true });
    api.get("/settings").then((r)=>setSettings(r.data)).catch(()=>{});
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginEmployee(email, password);
      toast.success("Selamat datang");
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal masuk");
    } finally { setLoading(false); }
  };

  const bg = "https://images.unsplash.com/photo-1555043722-4523972f07ee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxqYWthcnRhJTIwc2t5bGluZSUyMGxhbmRzY2FwZXxlbnwwfHx8fDE3ODcwMTQ1MzV8MA&ixlib=rb-4.1.0&q=85";

  return (
    <div className="min-h-screen bg-white flex flex-col lg:grid lg:grid-cols-2">
      <div className="relative h-56 lg:h-auto overflow-hidden">
        <img src={settings?.ad_image || bg} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 gov-gradient-overlay" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 lg:p-12 text-white">
          <div className="text-[11px] uppercase tracking-[0.3em] font-semibold text-white/80 mb-2">Layanan Publik</div>
          <h2 className="font-display text-2xl lg:text-4xl font-bold">{settings?.ad_title || "Portal Pegawai"}</h2>
          <p className="hidden lg:block mt-3 max-w-lg text-white/90">{settings?.ad_description || "Sistem absensi digital untuk seluruh pegawai."}</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            {settings?.logo ? (
              <img src={settings.logo} alt="logo" className="w-12 h-12 rounded-md object-contain bg-white" data-testid="employee-login-logo" />
            ) : (
              <div className="w-11 h-11 rounded-md bg-primary text-white flex items-center justify-center">
                <UserCircle2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Portal Pegawai</div>
              <div className="font-display text-xl font-bold text-primary leading-tight">{settings?.main_title || "SiKerja"}</div>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Masuk Pegawai</h1>
          <p className="mt-2 text-gray-600 text-sm">Silakan masuk dengan akun pegawai Anda.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="employee-login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest font-semibold text-gray-700">Email</Label>
              <Input id="email" data-testid="employee-email-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw" className="text-xs uppercase tracking-widest font-semibold text-gray-700">Kata Sandi</Label>
              <div className="relative">
                <Input id="pw" data-testid="employee-password-input" type={show?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} required className="h-12 pr-11" />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" data-testid="employee-toggle-password">
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <Button type="submit" data-testid="employee-login-submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-[#5c0000] btn-tactile text-white font-semibold">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              <Link to="/admin/login" className="hover:text-primary hover:underline" data-testid="link-admin-login">Masuk sebagai administrator →</Link>
            </div>
          </form>

          <div className="mt-10 pt-4 border-t border-gray-200 text-xs text-muted-foreground">
            Demo: <span className="font-mono">budi@gov.id / employee123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
