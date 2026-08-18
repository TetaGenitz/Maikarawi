import React, { useEffect, useState } from "react";
import { api, fmtDate } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function MyLeaves() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leave_type: "annual", start_date: "", end_date: "", reason: "" });
  const load = () => api.get("/leaves").then(r=>setItems(r.data));
  useEffect(() => { load(); }, []);
  const submit = async () => {
    await api.post("/leaves", form);
    toast.success("Pengajuan cuti terkirim"); setOpen(false);
    setForm({ leave_type:"annual", start_date:"", end_date:"", reason:""});
    load();
  };
  return (
    <div className="space-y-4" data-testid="my-leaves-page">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Cuti Saya</h1>
        <Button size="sm" onClick={()=>setOpen(true)} className="bg-primary hover:bg-[#5c0000]" data-testid="new-leave-btn"><Plus className="w-4 h-4 mr-1"/>Ajukan</Button>
      </div>
      <div className="space-y-2">
        {items.map(r=>(
          <Card key={r.id} className="border-gray-200"><CardContent className="p-3">
            <div className="flex items-center justify-between"><div className="font-semibold text-sm">{r.leave_type}</div><StatusBadge status={r.status}/></div>
            <div className="text-xs text-muted-foreground mt-1">{fmtDate(r.start_date)} - {fmtDate(r.end_date)}</div>
            <div className="text-xs mt-1">{r.reason}</div>
          </CardContent></Card>
        ))}
        {items.length===0 && <div className="text-center text-sm text-muted-foreground py-6">Belum ada pengajuan</div>}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pengajuan Cuti</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Jenis</Label>
              <Select value={form.leave_type} onValueChange={(v)=>setForm({...form,leave_type:v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Cuti Tahunan</SelectItem>
                  <SelectItem value="sick">Cuti Sakit</SelectItem>
                  <SelectItem value="official">Tugas Dinas</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Mulai</Label><Input type="date" value={form.start_date} onChange={(e)=>setForm({...form, start_date:e.target.value})} data-testid="leave-start"/></div>
              <div><Label>Selesai</Label><Input type="date" value={form.end_date} onChange={(e)=>setForm({...form, end_date:e.target.value})} data-testid="leave-end"/></div>
            </div>
            <div><Label>Alasan</Label><Textarea value={form.reason} onChange={(e)=>setForm({...form, reason:e.target.value})} data-testid="leave-reason"/></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>Batal</Button><Button onClick={submit} className="bg-primary hover:bg-[#5c0000]" data-testid="submit-leave-btn">Ajukan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
