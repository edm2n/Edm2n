// QR Code Reader (camera-based)
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button, ResultBox } from '../lib/ui';
import { toast } from 'sonner';
import { Camera, StopCircle, Copy } from 'lucide-react';

export function QRReader() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');
  const scannerRef = useRef(null);
  const readerRef = useRef(null);

  const start = async () => {
    setResult('');
    try {
      if (!readerRef.current) readerRef.current = new Html5Qrcode('qr-reader-div');
      await readerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          setResult(decoded);
          stop();
        },
        () => {}
      );
      setScanning(true);
    } catch (e) {
      toast.error('تعذّر الوصول للكاميرا. تأكّد من صلاحيات المتصفح.');
    }
  };

  const stop = async () => {
    try {
      if (readerRef.current && readerRef.current.isScanning) {
        await readerRef.current.stop();
        await readerRef.current.clear();
      }
    } catch {}
    setScanning(false);
  };

  useEffect(() => { return () => { stop(); }; }, []);

  const isUrl = /^https?:\/\//i.test(result);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">امسح رمز QR بكاميرا جهازك — يعمل بشكل أفضل على الجوال. تأكد من السماح للمتصفح باستخدام الكاميرا.</p>
      <div className="flex gap-2">
        {!scanning ? (
          <Button testid="qrr-start" onClick={start}><Camera className="h-4 w-4" /> ابدأ المسح</Button>
        ) : (
          <Button testid="qrr-stop" variant="ghost" onClick={stop}><StopCircle className="h-4 w-4" /> إيقاف</Button>
        )}
      </div>
      <div id="qr-reader-div" ref={scannerRef} data-testid="qrr-video" className="mx-auto max-w-md rounded-2xl overflow-hidden border-2 border-dashed border-border" style={{ minHeight: scanning ? 320 : 0 }} />
      {result && (
        <ResultBox testid="qrr-result" label="النص المقروء" value={result} sub={isUrl ? 'رابط' : 'نص'} />
      )}
      {result && (
        <div className="flex gap-2">
          <Button testid="qrr-copy" variant="ghost" onClick={() => { navigator.clipboard.writeText(result); toast.success('تم النسخ'); }}>
            <Copy className="h-4 w-4" /> نسخ
          </Button>
          {isUrl && (
            <a data-testid="qrr-open" href={result} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#CA8A04]">
              افتح الرابط
            </a>
          )}
        </div>
      )}
    </div>
  );
}
