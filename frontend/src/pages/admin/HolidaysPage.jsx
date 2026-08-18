import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

export default function HolidaysPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ holiday_date: "", name: "", description: "" });
  const load = () => api.get("/holidays").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => { await api.post("/holidays", form); toast.success("Tersimpan"); setOpen(false); setForm({holiday_date:"",name:"",description:""}); load(); };
  return (
    <div className="space-y-6" data-testid="holidays-page">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Hari Libur</h1>
        <Button className="bg-primary hover:bg-[#5c0000]" onClick={()=>setOpen(true)} data-testid="add-holiday-btn"><Plus className="w-4 h-4 mr-1"/>Tambah</Button>
      </div>
      <Card className="border-gray-200"><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Nama</TableHead><TableHead>Deskripsi</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map(r=>(
            <TableRow key={r.id}><TableCell className="tabular-nums">{r.holiday_date}</TableCell><TableCell>{r.name}</TableCell><TableCell className="text-muted-foreground">{r.description}</TableCell>
              <TableCell className="text-right"><Button size="sm" variant="outline" className="text-red-600" onClick={async()=>{await api.delete(`/holidays/${r.id}`); load();}}><Trash2 className="w-3.5 h-3.5"/></Button></TableCell>
            </TableRow>
          ))}
          {items.length===0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada libur</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Hari Libur</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tanggal</Label><Input type="date" value={form.holiday_date} onChange={(e)=>setForm({...form, holiday_date: e.target.value})} data-testid="holiday-date-input"/></div>
            <div><Label>Nama</Label><Input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} data-testid="holiday-name-input"/></div>
            <div><Label>Deskripsi</Label><Input value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})}/></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>Batal</Button><Button onClick={save} className="bg-primary hover:bg-[#5c0000]" data-testid="save-holiday-btn">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
