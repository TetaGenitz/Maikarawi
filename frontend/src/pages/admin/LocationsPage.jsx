import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, MapPin } from "lucide-react";

export default function LocationsPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:"", latitude:0, longitude:0, allowed_radius:100, status:"active" });
  const load = () => api.get("/locations").then(r=>setItems(r.data));
  useEffect(load, []);
  const useMyLocation = () => navigator.geolocation.getCurrentPosition(p => setForm({...form, latitude: p.coords.latitude, longitude: p.coords.longitude}));
  const save = async () => {
    try { await api.post("/locations", form); toast.success("Tersimpan"); setOpen(false); load(); }
    catch(e){ toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  return (
    <div className="space-y-6" data-testid="locations-page">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Lokasi Kantor</h1>
        <Button onClick={()=>setOpen(true)} className="bg-primary hover:bg-[#5c0000]" data-testid="add-loc-btn"><Plus className="w-4 h-4 mr-1"/>Tambah Lokasi</Button>
      </div>
      <Card className="border-gray-200"><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Latitude</TableHead><TableHead>Longitude</TableHead><TableHead>Radius (m)</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map(r=>(
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="tabular-nums">{r.latitude}</TableCell>
              <TableCell className="tabular-nums">{r.longitude}</TableCell>
              <TableCell className="tabular-nums">{r.allowed_radius}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell className="text-right"><Button size="sm" variant="outline" className="text-red-600" onClick={async()=>{await api.delete(`/locations/${r.id}`); load();}}><Trash2 className="w-3.5 h-3.5"/></Button></TableCell>
            </TableRow>
          ))}
          {items.length===0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada lokasi</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Lokasi Kantor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nama Kantor</Label><Input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} data-testid="loc-name-input"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Latitude</Label><Input type="number" step="0.000001" value={form.latitude} onChange={(e)=>setForm({...form, latitude: parseFloat(e.target.value)})} data-testid="loc-lat-input"/></div>
              <div><Label>Longitude</Label><Input type="number" step="0.000001" value={form.longitude} onChange={(e)=>setForm({...form, longitude: parseFloat(e.target.value)})} data-testid="loc-lng-input"/></div>
            </div>
            <div><Label>Radius (meter)</Label><Input type="number" value={form.allowed_radius} onChange={(e)=>setForm({...form, allowed_radius: parseInt(e.target.value)})} data-testid="loc-radius-input"/></div>
            <Button variant="outline" onClick={useMyLocation}><MapPin className="w-4 h-4 mr-1"/> Gunakan Lokasi Saya</Button>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>Batal</Button><Button onClick={save} className="bg-primary hover:bg-[#5c0000]" data-testid="save-loc-btn">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
