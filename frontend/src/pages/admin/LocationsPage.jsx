import React, { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Trash2, MapPin, Pencil, Loader2 } from "lucide-react";

const emptyForm = { name: "", latitude: "", longitude: "", allowed_radius: "100", status: "active" };

export default function LocationsPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const load = () => api.get("/locations").then(r => setItems(r.data)).catch(e => toast.error(formatApiErrorDetail(e.response?.data?.detail)));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setOpen(true); };
  const openEdit = (r) => {
    setForm({
      name: r.name || "",
      latitude: String(r.latitude ?? ""),
      longitude: String(r.longitude ?? ""),
      allowed_radius: String(r.allowed_radius ?? "100"),
      status: r.status || "active",
    });
    setEditingId(r.id);
    setOpen(true);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Browser tidak mendukung GPS");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setForm(f => ({ ...f, latitude: String(p.coords.latitude), longitude: String(p.coords.longitude) }));
        toast.success(`Lokasi diambil (akurasi ${Math.round(p.coords.accuracy)}m)`);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(err.code === 1 ? "Izin lokasi ditolak" : err.code === 2 ? "Lokasi tidak tersedia" : "GPS timeout");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const save = async () => {
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    const rad = parseInt(form.allowed_radius, 10);
    if (!form.name.trim()) return toast.error("Nama kantor wajib diisi");
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) return toast.error("Latitude tidak valid (-90 s/d 90)");
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) return toast.error("Longitude tidak valid (-180 s/d 180)");
    if (!Number.isFinite(rad) || rad <= 0) return toast.error("Radius harus lebih besar dari 0");

    const payload = { name: form.name.trim(), latitude: lat, longitude: lng, allowed_radius: rad, status: form.status };
    setSaving(true);
    try {
      if (editingId) await api.put(`/locations/${editingId}`, payload);
      else await api.post("/locations", payload);
      toast.success(editingId ? "Lokasi diperbarui" : "Lokasi ditambahkan");
      setOpen(false); setForm(emptyForm); setEditingId(null); load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Hapus lokasi kantor ini?")) return;
    try { await api.delete(`/locations/${id}`); toast.success("Lokasi dihapus"); load(); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  return (
    <div className="space-y-6" data-testid="locations-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Manajemen</div>
          <h1 className="font-display text-3xl font-bold">Lokasi Kantor</h1>
        </div>
        <Button onClick={openAdd} className="bg-primary hover:bg-[#5c0000]" data-testid="add-loc-btn">
          <Plus className="w-4 h-4 mr-1"/>Tambah Lokasi
        </Button>
      </div>

      <Card className="border-gray-200"><CardContent className="p-0"><Table>
        <TableHeader><TableRow>
          <TableHead>Nama</TableHead><TableHead>Latitude</TableHead><TableHead>Longitude</TableHead>
          <TableHead>Radius (m)</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {items.map((r, i) => (
            <TableRow key={r.id} data-testid={`loc-row-${i}`}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="tabular-nums">{Number(r.latitude).toFixed(6)}</TableCell>
              <TableCell className="tabular-nums">{Number(r.longitude).toFixed(6)}</TableCell>
              <TableCell className="tabular-nums">{r.allowed_radius}</TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => openEdit(r)} data-testid={`edit-loc-${i}`}>
                  <Pencil className="w-3.5 h-3.5"/>
                </Button>
                <Button size="sm" variant="outline" className="ml-1 text-red-600" onClick={() => del(r.id)} data-testid={`del-loc-${i}`}>
                  <Trash2 className="w-3.5 h-3.5"/>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Belum ada lokasi kantor</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { setForm(emptyForm); setEditingId(null); } setOpen(v); }}>
        <DialogContent data-testid="loc-dialog">
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "Tambah"} Lokasi Kantor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nama Kantor <span className="text-primary">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="loc-name-input" placeholder="Kantor Pusat" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude <span className="text-primary">*</span></Label>
                <Input type="number" step="any" value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  data-testid="loc-lat-input" placeholder="-6.175392" />
              </div>
              <div>
                <Label>Longitude <span className="text-primary">*</span></Label>
                <Input type="number" step="any" value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  data-testid="loc-lng-input" placeholder="106.827153" />
              </div>
            </div>
            <div>
              <Label>Radius Absensi (meter) <span className="text-primary">*</span></Label>
              <Input type="number" min="1" value={form.allowed_radius}
                onChange={(e) => setForm({ ...form, allowed_radius: e.target.value })}
                data-testid="loc-radius-input" placeholder="100" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger data-testid="loc-status-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={useMyLocation} disabled={locating} data-testid="loc-use-my-location" className="w-full">
              {locating ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : <MapPin className="w-4 h-4 mr-1"/>}
              Gunakan Lokasi Saat Ini
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving} className="bg-primary hover:bg-[#5c0000]" data-testid="save-loc-btn">
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
