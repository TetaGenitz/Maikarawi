import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const emp = user?.employee;
  const [pw, setPw] = useState({ old_password: "", new_password: "" });
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/auth/change-password", pw); toast.success("Kata sandi diperbarui"); setPw({old_password:"",new_password:""}); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };
  return (
    <div className="space-y-4" data-testid="profile-page">
      <h1 className="font-display text-2xl font-bold">Profil</h1>
      <Card className="border-gray-200"><CardContent className="p-4 space-y-2">
        <div><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">NIP</div><div className="font-semibold">{emp?.employee_id}</div></div>
        <div><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nama</div><div>{emp?.full_name}</div></div>
        <div><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</div><div>{emp?.email}</div></div>
        <div><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Jabatan</div><div>{emp?.position || "-"}</div></div>
      </CardContent></Card>
      <Card className="border-gray-200"><CardContent className="p-4">
        <div className="font-semibold mb-3">Ubah Kata Sandi</div>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Kata Sandi Lama</Label><Input type="password" value={pw.old_password} onChange={(e)=>setPw({...pw, old_password:e.target.value})} data-testid="old-password" required/></div>
          <div><Label>Kata Sandi Baru</Label><Input type="password" value={pw.new_password} onChange={(e)=>setPw({...pw, new_password:e.target.value})} data-testid="new-password" required minLength={6}/></div>
          <Button type="submit" className="w-full bg-primary hover:bg-[#5c0000]" data-testid="change-password-btn">Ubah Kata Sandi</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
