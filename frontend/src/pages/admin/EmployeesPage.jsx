import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty = { employee_id: "", full_name: "", email: "", position: "", department_id: "", phone: "", password: "employee123", status: "active" };

export default function EmployeesPage() {
  const [items, setItems] = useState([]);
  const [depts, setDepts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/employees").then(r => setItems(r.data));
  useEffect(() => { load(); api.get("/departments").then(r => setDepts(r.data)); }, []);

  const save = async () => {
    try {
      if (editing) { const { password, ...rest } = form; await api.put(`/employees/${editing}`, password ? form : rest); }
      else await api.post("/employees", form);
      toast.success("Berhasil disimpan"); setOpen(false); setForm(empty); setEditing(null); load();
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  const del = async (id) => { if (!window.confirm("Hapus pegawai?")) return; await api.delete(`/employees/${id}`); toast.success("Dihapus"); load(); };
  const edit = (r) => { setEditing(r.id); setForm({ ...r, password: "" }); setOpen(true); };

  return (
    <div className="space-y-6" data-testid="employees-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Manajemen</div>
          <h1 className="font-display text-3xl font-bold">Data Pegawai</h1>
        </div>
        <Button onClick={()=>{ setForm(empty); setEditing(null); setOpen(true); }} data-testid="add-employee-btn" className="bg-primary hover:bg-[#5c0000]"><Plus className="w-4 h-4 mr-1"/>Tambah Pegawai</Button>
      </div>

      <Card className="border-gray-200"><CardContent className="p-0">
        <div className="overflow-auto"><Table>
          <TableHeader><TableRow>
            <TableHead>NIP</TableHead><TableHead>Nama</TableHead><TableHead>Email</TableHead>
            <TableHead>Jabatan</TableHead><TableHead>Departemen</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items.map((r, i) => (
              <TableRow key={r.id} data-testid={`emp-row-${i}`}>
                <TableCell className="font-medium">{r.employee_id}</TableCell>
                <TableCell>{r.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                <TableCell>{r.position || "-"}</TableCell>
                <TableCell>{r.department_name}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={()=>edit(r)} data-testid={`edit-emp-${i}`}><Pencil className="w-3.5 h-3.5"/></Button>
                  <Button size="sm" variant="outline" className="ml-1 text-red-600" onClick={()=>del(r.id)} data-testid={`del-emp-${i}`}><Trash2 className="w-3.5 h-3.5"/></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Belum ada pegawai</TableCell></TableRow>}
          </TableBody>
        </Table></div>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" data-testid="employee-dialog">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Pegawai</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>NIP / ID Pegawai</Label><Input value={form.employee_id} onChange={(e)=>setForm({...form, employee_id: e.target.value})} disabled={!!editing} data-testid="form-employee-id"/></div>
            <div><Label>Nama Lengkap</Label><Input value={form.full_name} onChange={(e)=>setForm({...form, full_name: e.target.value})} data-testid="form-full-name"/></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} data-testid="form-email"/></div>
            <div><Label>Telepon</Label><Input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})}/></div>
            <div><Label>Jabatan</Label><Input value={form.position} onChange={(e)=>setForm({...form, position: e.target.value})}/></div>
            <div><Label>Departemen</Label>
              <Select value={form.department_id || ""} onValueChange={(v)=>setForm({...form, department_id: v})}>
                <SelectTrigger data-testid="form-department"><SelectValue placeholder="Pilih..."/></SelectTrigger>
                <SelectContent>{depts.map(d=><SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{editing ? "Kata Sandi Baru (opsional)" : "Kata Sandi"}</Label><Input type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} data-testid="form-password"/></div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v)=>setForm({...form, status: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="active">Aktif</SelectItem><SelectItem value="inactive">Nonaktif</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Batal</Button>
            <Button onClick={save} data-testid="save-employee-btn" className="bg-primary hover:bg-[#5c0000]">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
