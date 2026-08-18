import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, X } from "lucide-react";

export default function SelfieCapture({ open, onClose, onCapture, title = "Ambil Selfie" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPreview(null); setError("");
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        setError("Izin kamera ditolak atau kamera tidak tersedia.");
      }
    };
    start();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const snap = () => {
    const v = videoRef.current; const c = canvasRef.current;
    if (!v || !c) return;
    const w = v.videoWidth || 480, h = v.videoHeight || 360;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    // Mirror horizontally for natural selfie
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(v, -w, 0, w, h); ctx.restore();
    const data = c.toDataURL("image/jpeg", 0.7);
    setPreview(data);
  };

  const confirm = () => {
    if (!preview) return;
    onCapture(preview);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-md" data-testid="selfie-dialog">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {error ? (
          <div className="p-4 text-sm text-destructive" data-testid="selfie-error">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-black">
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-2 justify-end">
              {preview ? (
                <>
                  <Button variant="outline" onClick={() => setPreview(null)} data-testid="selfie-retake-btn">
                    <RefreshCw className="w-4 h-4 mr-1" /> Ulangi
                  </Button>
                  <Button onClick={confirm} data-testid="selfie-confirm-btn" className="bg-primary hover:bg-[#5c0000]">
                    <Check className="w-4 h-4 mr-1" /> Konfirmasi
                  </Button>
                </>
              ) : (
                <Button onClick={snap} data-testid="selfie-snap-btn" className="bg-primary hover:bg-[#5c0000]">
                  <Camera className="w-4 h-4 mr-1" /> Ambil Foto
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
