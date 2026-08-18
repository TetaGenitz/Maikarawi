import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function WorkPlanPage() {
  const today = new Date().toISOString().slice(0,10);
  const [workDate, setWorkDate] = useState(today);
  const [items, setItems] = useState([{ work_plan: "", priority: "normal", target: "", notes: "" }]);
  const [existing, setExisting] = useState([]);

  const load = () => api.get("/work-plans", { params: { work_date: workDate } }).then(r=>{
    setExisting(r.data);
    if (r.data.length) setItems(r.data.map(x=>({ work_plan: x.work_plan, priority: x.priority, target: x.target, notes: x.notes })));
  });
  useEffect(() => { load(); }, [workDate]);

  const add = () => setItems([...items, { work_plan: "", priority: "normal", target: "", notes: "" }]);
  const remove = (i) => setItems(items.filter((_,idx)=>idx!==i));
  const upd = (i, k, v) => setItems(items.map((it,idx)=> idx===i ? {...it,[k]:v} : it));
  const save = async () => {
    await api.post("/work-plans", { work_date: workDate, items: items.filter(x=>x.work_plan.trim()) });
    toast.success("Rencana kerja tersimpan"); load();
  };

  return (
    <div className="space-y-4" data-testid="workplan-page">
      <h1 className="font-display text-2xl font-bold">Rencana Kerja Harian</h1>
      <div><Label>Tanggal</Label><Input type="date" value={workDate} onChange={(e)=>setWorkDate(e.target.value)} data-testid="workplan-date"/></div>
      <div className="space-y-3">
        {items.map((it, i)=>(
          <Card key={i} className="border-gray-200"><CardContent className="p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Textarea placeholder="Rencana pekerjaan..." value={it.work_plan} onChange={(e)=>upd(i,"work_plan",e.target.value)} rows={2} data-testid={`workplan-input-${i}`}/>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={it.priority} onValueChange={(v)=>upd(i,"priority",v)}>
                    <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="high">Tinggi</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="low">Rendah</SelectItem></SelectContent>
                  </Select>
                  <Input placeholder="Target/hasil" value={it.target} onChange={(e)=>upd(i,"target",e.target.value)} className="h-9"/>
                </div>
              </div>
              <Button size="icon" variant="outline" onClick={()=>remove(i)} className="text-red-600"><Trash2 className="w-4 h-4"/></Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={add} data-testid="add-workplan-item"><Plus className="w-4 h-4 mr-1"/>Tambah</Button>
        <Button onClick={save} className="flex-1 bg-primary hover:bg-[#5c0000]" data-testid="save-workplan-btn">Simpan</Button>
      </div>
    </div>
  );
}
