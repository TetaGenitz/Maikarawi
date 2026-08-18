import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil } from "lucide-react";

export default function DepartmentsPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/departments").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    try {
      if (editing) await api.put(`/departments/${editing}`, form);
      else await api.post("/departments", form);
      toast.success("Berhasil"); setOpen(false); setForm({ name: "", description: "" }); setEditing(null); load();
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  const del = async (id) => { if (!window.confirm("Hapus?")) return; await api.delete(`/departments/${id}`); load(); };
  return (
    <div className="space-y-6" data-testid="departments-page">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Departemen</h1>
        <Button onClick={()=>{ setForm({name:"",description:""}); setEditing(null); setOpen(true); }} data-testid="add-dept-btn" className="bg-primary hover:bg-[#5c0000]"><Plus className="w-4 h-4 mr-1"/>Tambah</Button>
      </div>
      <Card className="border-gray-200"><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Deskripsi</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((r,i)=>(
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-muted-foreground">{r.description || "-"}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={()=>{setEditing(r.id); setForm(r); setOpen(true);}}><Pencil className="w-3.5 h-3.5"/></Button>
                <Button size="sm" variant="outline" className="ml-1 text-red-600" onClick={()=>del(r.id)}><Trash2 className="w-3.5 h-3.5"/></Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Belum ada data</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?"Edit":"Tambah"} Departemen</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nama</Label><Input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} data-testid="dept-name-input"/></div>
            <div><Label>Deskripsi</Label><Input value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})}/></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>Batal</Button><Button onClick={save} className="bg-primary hover:bg-[#5c0000]" data-testid="save-dept-btn">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
