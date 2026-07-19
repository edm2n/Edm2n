// Dev tools + Fun + Communication + Text + Files + Misc
import React, { useEffect, useRef, useState } from 'react';
import { Input, Select, Button, ResultBox } from '../lib/ui';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import { keyboardFlip, toArabicDigits, toEnglishDigits } from '../lib/helpers';
import { Copy, Download, RefreshCcw, Play, Pause, Square, Send, Upload } from 'lucide-react';

// ============ DEV TOOLS ============
export function QRGenerator() {
  const [text, setText] = useState('https://dalil-matar.sa');
  const [size, setSize] = useState('256');
  const download = () => {
    const canvas = document.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = 'qr.png'; a.click();
  };
  return (
    <div className="space-y-5">
      <Input testid="qr-text" label="النص أو الرابط" value={text} onChange={(e) => setText(e.target.value)} />
      <Input testid="qr-size" type="number" label="الحجم (px)" value={size} onChange={(e) => setSize(e.target.value)} />
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl border border-border p-6 bg-white">
          <QRCodeCanvas data-testid="qr-canvas" value={text || ' '} size={Number(size)} fgColor="#022C22" />
        </div>
        <Button testid="qr-download" onClick={download}><Download className="h-4 w-4" /> تنزيل PNG</Button>
      </div>
    </div>
  );
}

export function PasswordGen() {
  const [len, setLen] = useState(16), [upper, setU] = useState(true), [num_, setN] = useState(true), [sym, setS] = useState(true);
  const [pwd, setPwd] = useState('');
  const gen = () => {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (num_) chars += '0123456789';
    if (sym) chars += '!@#$%^&*()_+-=[]{}';
    let p = '';
    for (let i = 0; i < len; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPwd(p);
  };
  useEffect(() => { gen(); }, []);
  return (
    <div className="space-y-5">
      <Input testid="pg-len" type="number" label="طول الكلمة" value={len} onChange={(e) => setLen(+e.target.value)} />
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={upper} onChange={(e) => setU(e.target.checked)} data-testid="pg-upper" /> حروف كبيرة</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={num_} onChange={(e) => setN(e.target.checked)} data-testid="pg-num" /> أرقام</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={sym} onChange={(e) => setS(e.target.checked)} data-testid="pg-sym" /> رموز</label>
      </div>
      <Button testid="pg-gen" onClick={gen}><RefreshCcw className="h-4 w-4" /> توليد جديد</Button>
      <div data-testid="pg-result" dir="ltr" className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 p-5 font-mono text-xl break-all">{pwd}</div>
      <Button testid="pg-copy" variant="ghost" onClick={() => { navigator.clipboard.writeText(pwd); toast.success('تم النسخ'); }}><Copy className="h-4 w-4" /> نسخ</Button>
    </div>
  );
}

export function JsonFormat() {
  const [input, setInput] = useState('{"name":"مطر","tools":80}'), [output, setOutput] = useState(''), [err, setErr] = useState('');
  const format = () => { try { setOutput(JSON.stringify(JSON.parse(input), null, 2)); setErr(''); } catch (e) { setErr(e.message); setOutput(''); } };
  const minify = () => { try { setOutput(JSON.stringify(JSON.parse(input))); setErr(''); } catch (e) { setErr(e.message); } };
  return (
    <div className="space-y-5">
      <textarea data-testid="jf-input" value={input} onChange={(e) => setInput(e.target.value)} rows={8} dir="ltr" className="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm" />
      <div className="flex gap-2">
        <Button testid="jf-format" onClick={format}>تنسيق</Button>
        <Button testid="jf-minify" variant="ghost" onClick={minify}>تصغير</Button>
      </div>
      {err && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm" dir="ltr">{err}</div>}
      {output && <pre data-testid="jf-output" dir="ltr" className="rounded-xl border border-border bg-muted p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">{output}</pre>}
    </div>
  );
}

export function Base64Tool() {
  const [t, setT] = useState('مرحبا Matar'), [mode, setMode] = useState('encode');
  let result = '';
  try { result = mode === 'encode' ? btoa(unescape(encodeURIComponent(t))) : decodeURIComponent(escape(atob(t))); } catch { result = 'خطأ في الترميز'; }
  return (
    <div className="space-y-5">
      <Select testid="b64-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="encode">تشفير Base64</option><option value="decode">فك Base64</option>
      </Select>
      <textarea data-testid="b64-input" value={t} onChange={(e) => setT(e.target.value)} rows={4} className="w-full rounded-xl border border-input bg-background px-4 py-3" />
      <ResultBox label="النتيجة" value={result} testid="b64-result" />
    </div>
  );
}

export function UUIDGen() {
  const [ids, setIds] = useState([]);
  const gen = () => setIds(Array.from({ length: 5 }, () => crypto.randomUUID()));
  useEffect(() => { gen(); }, []);
  return (
    <div className="space-y-5">
      <Button testid="uuid-gen" onClick={gen}><RefreshCcw className="h-4 w-4" /> توليد جديد</Button>
      {ids.map((id, i) => (
        <div key={i} data-testid={`uuid-${i}`} dir="ltr" className="rounded-xl border border-border p-3 font-mono flex justify-between items-center">
          <span>{id}</span>
          <button onClick={() => { navigator.clipboard.writeText(id); toast.success('تم النسخ'); }}><Copy className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}

export function UnixTimestamp() {
  const [ts, setTs] = useState(Math.floor(Date.now() / 1000));
  const [dt, setDt] = useState(new Date().toISOString().slice(0, 16));
  const now = () => { const n = Math.floor(Date.now() / 1000); setTs(n); setDt(new Date(n * 1000).toISOString().slice(0, 16)); };
  const fromTs = new Date(ts * 1000).toLocaleString('ar-SA');
  const fromDt = Math.floor(new Date(dt).getTime() / 1000);
  return (
    <div className="space-y-5">
      <Button testid="ut-now" onClick={now}>الآن</Button>
      <Input testid="ut-ts" label="Timestamp (ثواني)" type="number" value={ts} onChange={(e) => setTs(+e.target.value)} />
      <ResultBox label="↓ التاريخ" value={fromTs} testid="ut-from-ts" />
      <Input testid="ut-dt" type="datetime-local" label="التاريخ" value={dt} onChange={(e) => setDt(e.target.value)} />
      <ResultBox label="↓ Timestamp" value={fromDt} testid="ut-from-dt" />
    </div>
  );
}

export function ColorPicker() {
  const [hex, setHex] = useState('#D4AF37');
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  // HSL
  const rN = r/255, gN = g/255, bN = b/255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0));
    else if (max === gN) h = (bN - rN) / d + 2;
    else h = (rN - gN) / d + 4;
    h /= 6;
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-16 w-16 rounded-xl border-2 border-border" data-testid="cp-color" />
        <Input testid="cp-hex" value={hex} onChange={(e) => setHex(e.target.value)} label="HEX" dir="ltr" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="RGB" value={`rgb(${r}, ${g}, ${b})`} testid="cp-rgb" />
        <ResultBox label="HSL" value={`hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`} testid="cp-hsl" />
      </div>
    </div>
  );
}

export function LoremAr() {
  const words = ['في', 'زحمة', 'المدينة', 'بيت', 'صغير', 'أجمل', 'قصة', 'الفصول', 'كتاب', 'قهوة', 'ليل', 'ضوء', 'شمس', 'مطر', 'صديق', 'صباح', 'وردة', 'سماء', 'بحر', 'رحلة', 'حياة', 'حب', 'ذاكرة', 'حلم'];
  const [paras, setParas] = useState(3);
  const gen = () => Array.from({ length: paras }, () => Array.from({ length: 40 }, () => words[Math.floor(Math.random() * words.length)]).join(' ')).join('\n\n');
  const [text, setText] = useState(gen());
  return (
    <div className="space-y-5">
      <Input testid="lo-paras" type="number" label="عدد الفقرات" value={paras} onChange={(e) => setParas(+e.target.value)} />
      <Button testid="lo-gen" onClick={() => setText(gen())}><RefreshCcw className="h-4 w-4" /> توليد</Button>
      <div data-testid="lo-result" className="rounded-xl border border-border p-4 whitespace-pre-line leading-loose">{text}</div>
    </div>
  );
}

// ============ FUN ============
export function Wheel() {
  const [items, setItems] = useState('محمد\nأحمد\nسارة\nمها');
  const [winner, setWinner] = useState('');
  const spin = () => {
    const arr = items.split('\n').filter(Boolean);
    if (!arr.length) return;
    setWinner('...');
    setTimeout(() => setWinner(arr[Math.floor(Math.random() * arr.length)]), 1200);
  };
  return (
    <div className="space-y-5">
      <textarea data-testid="wh-items" value={items} onChange={(e) => setItems(e.target.value)} rows={6} className="w-full rounded-xl border border-input bg-background px-4 py-3" placeholder="اسم في كل سطر" />
      <Button testid="wh-spin" onClick={spin}>ابدأ الدولاب</Button>
      {winner && <div data-testid="wh-winner" className="text-center text-3xl md:text-5xl font-black text-[#D4AF37] py-8">{winner}</div>}
    </div>
  );
}

export function Dice() {
  const [n, setN] = useState(2);
  const [rolls, setRolls] = useState([]);
  const roll = () => setRolls(Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1));
  return (
    <div className="space-y-5 text-center">
      <Input testid="dc-n" type="number" label="عدد الزهرات" value={n} onChange={(e) => setN(+e.target.value)} />
      <Button testid="dc-roll" onClick={roll}>ارمِ</Button>
      <div className="flex justify-center gap-3 flex-wrap">
        {rolls.map((r, i) => (
          <div key={i} data-testid={`dc-r-${i}`} className="h-20 w-20 rounded-2xl border-2 border-[#D4AF37] flex items-center justify-center text-4xl font-black text-[#D4AF37]">{toArabicDigits(r)}</div>
        ))}
      </div>
      {rolls.length > 0 && <div>المجموع: <b>{toArabicDigits(rolls.reduce((a, b) => a + b, 0))}</b></div>}
    </div>
  );
}

export function CoinFlip() {
  const [r, setR] = useState('');
  const flip = () => { setR('...'); setTimeout(() => setR(Math.random() < 0.5 ? 'صورة' : 'كتابة'), 600); };
  return (
    <div className="space-y-5 text-center">
      <Button testid="cf-flip" onClick={flip}>اقذف العملة</Button>
      {r && <div data-testid="cf-result" className="text-5xl font-black text-[#D4AF37] py-8">{r}</div>}
    </div>
  );
}

export function RPS() {
  const opts = ['حجر', 'ورقة', 'مقص'];
  const [me, setMe] = useState(''), [ai, setAi] = useState(''), [msg, setMsg] = useState('');
  const play = (choice) => {
    const c = opts[Math.floor(Math.random() * 3)];
    setMe(choice); setAi(c);
    if (choice === c) setMsg('تعادل');
    else if ((choice === 'حجر' && c === 'مقص') || (choice === 'ورقة' && c === 'حجر') || (choice === 'مقص' && c === 'ورقة')) setMsg('فزت! 🎉');
    else setMsg('خسرت');
  };
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center gap-3">
        {opts.map((o) => <Button key={o} testid={`rps-${o}`} onClick={() => play(o)}>{o}</Button>)}
      </div>
      {me && (
        <div className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 p-6">
          <div>أنت: <b>{me}</b> | الكمبيوتر: <b>{ai}</b></div>
          <div data-testid="rps-msg" className="text-2xl font-bold text-[#D4AF37] mt-3">{msg}</div>
        </div>
      )}
    </div>
  );
}

export function GuessNumber() {
  const [secret, setSecret] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [g, setG] = useState(''), [msg, setMsg] = useState(''), [tries, setTries] = useState(0);
  const guess = () => {
    setTries(tries + 1);
    const n = +g;
    if (n === secret) setMsg(`✓ صحيح! خمّنتها في ${tries + 1} محاولات`);
    else if (n > secret) setMsg('العدد أصغر ↓');
    else setMsg('العدد أكبر ↑');
  };
  const reset = () => { setSecret(Math.floor(Math.random() * 100) + 1); setG(''); setMsg(''); setTries(0); };
  return (
    <div className="space-y-5">
      <p>خمّن رقماً بين 1 و 100</p>
      <div className="flex gap-2">
        <Input testid="gn-input" type="number" value={g} onChange={(e) => setG(e.target.value)} />
        <Button testid="gn-guess" onClick={guess}>خمّن</Button>
        <Button testid="gn-reset" variant="ghost" onClick={reset}>لعبة جديدة</Button>
      </div>
      {msg && <ResultBox testid="gn-msg" value={msg} />}
    </div>
  );
}

export function RandomName() {
  const male = ['محمد', 'أحمد', 'عبدالله', 'خالد', 'فيصل', 'سعود', 'يوسف', 'إبراهيم', 'عمر', 'علي'];
  const female = ['فاطمة', 'مريم', 'نورة', 'ريم', 'سارة', 'هند', 'لينا', 'رنا', 'أميرة', 'شهد'];
  const [g, setG] = useState('male'), [n, setN] = useState('');
  const gen = () => { const arr = g === 'male' ? male : female; setN(arr[Math.floor(Math.random() * arr.length)]); };
  return (
    <div className="space-y-5">
      <Select testid="rn-g" value={g} onChange={(e) => setG(e.target.value)}>
        <option value="male">ذكر</option><option value="female">أنثى</option>
      </Select>
      <Button testid="rn-gen" onClick={gen}>توليد اسم</Button>
      {n && <ResultBox testid="rn-result" value={n} />}
    </div>
  );
}

export function NameMatch() {
  const [a, setA] = useState(''), [b, setB] = useState('');
  const p = (a && b) ? Math.abs((a + b).split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % 101 : 0;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="nm-a" label="الاسم الأول" value={a} onChange={(e) => setA(e.target.value)} />
        <Input testid="nm-b" label="الاسم الثاني" value={b} onChange={(e) => setB(e.target.value)} />
      </div>
      {(a && b) && <ResultBox testid="nm-result" label="نسبة التوافق (للتسلية فقط)" value={`${p}%`} />}
    </div>
  );
}

export function ShuffleList() {
  const [t, setT] = useState('أحمد\nمحمد\nسارة\nليلى'), [out, setOut] = useState([]);
  const shuffle = () => {
    const arr = t.split('\n').filter(Boolean);
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    setOut(arr);
  };
  return (
    <div className="space-y-5">
      <textarea data-testid="sh-input" value={t} onChange={(e) => setT(e.target.value)} rows={6} className="w-full rounded-xl border border-input bg-background px-4 py-3" />
      <Button testid="sh-shuffle" onClick={shuffle}>خلط</Button>
      {out.length > 0 && (
        <ol className="space-y-2" data-testid="sh-result">
          {out.map((x, i) => <li key={i} className="rounded-xl border border-border p-3">{i + 1}. {x}</li>)}
        </ol>
      )}
    </div>
  );
}

// ============ COMMUNICATION ============
export function WhatsAppNoSave() {
  const [phone, setPhone] = useState('966501234567'), [msg, setMsg] = useState('السلام عليكم');
  const link = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
  return (
    <div className="space-y-5">
      <Input testid="wa-phone" label="رقم الواتساب (مع رمز الدولة، بدون +)" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder="966501234567" />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">الرسالة (اختياري)</span>
        <textarea data-testid="wa-msg" value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-3" />
      </label>
      <a data-testid="wa-open" href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-white font-semibold">
        <Send className="h-4 w-4" /> افتح في الواتساب
      </a>
    </div>
  );
}

export function TelegramLink() {
  const [phone, setPhone] = useState('966501234567');
  const link = `https://t.me/+${phone.replace(/[^0-9]/g, '')}`;
  return (
    <div className="space-y-5">
      <Input testid="tg-phone" label="رقم التليجرام" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
      <a data-testid="tg-open" href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#0088cc] px-5 py-3 text-white font-semibold">
        <Send className="h-4 w-4" /> افتح في تليجرام
      </a>
    </div>
  );
}

const COUNTRY_CODES = [
  { c: 'السعودية', code: '+966', iso: 'SA' }, { c: 'الإمارات', code: '+971', iso: 'AE' }, { c: 'الكويت', code: '+965', iso: 'KW' },
  { c: 'قطر', code: '+974', iso: 'QA' }, { c: 'البحرين', code: '+973', iso: 'BH' }, { c: 'عُمان', code: '+968', iso: 'OM' },
  { c: 'مصر', code: '+20', iso: 'EG' }, { c: 'الأردن', code: '+962', iso: 'JO' }, { c: 'العراق', code: '+964', iso: 'IQ' },
  { c: 'لبنان', code: '+961', iso: 'LB' }, { c: 'سوريا', code: '+963', iso: 'SY' }, { c: 'اليمن', code: '+967', iso: 'YE' },
  { c: 'المغرب', code: '+212', iso: 'MA' }, { c: 'الجزائر', code: '+213', iso: 'DZ' }, { c: 'تونس', code: '+216', iso: 'TN' },
  { c: 'أمريكا', code: '+1', iso: 'US' }, { c: 'بريطانيا', code: '+44', iso: 'GB' }, { c: 'تركيا', code: '+90', iso: 'TR' },
];
export function CountryCode() {
  const [q, setQ] = useState('');
  const list = COUNTRY_CODES.filter((c) => c.c.includes(q) || c.code.includes(q));
  return (
    <div className="space-y-5">
      <Input testid="cc-search" placeholder="ابحث عن دولة أو رمز" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-2 sm:grid-cols-2">
        {list.map((c) => (
          <div key={c.code} className="flex justify-between rounded-xl border border-border p-3">
            <span>{c.c}</span>
            <span className="font-mono text-[#D4AF37]" dir="ltr">{c.code}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UrlEncoder() {
  const [t, setT] = useState('مرحبا العالم'), [mode, setMode] = useState('encode');
  const r = mode === 'encode' ? encodeURIComponent(t) : (() => { try { return decodeURIComponent(t); } catch { return 'خطأ'; } })();
  return (
    <div className="space-y-5">
      <Select testid="ue-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="encode">تشفير</option><option value="decode">فك</option>
      </Select>
      <textarea data-testid="ue-input" value={t} onChange={(e) => setT(e.target.value)} rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-3" dir="ltr" />
      <ResultBox testid="ue-result" label="النتيجة" value={r} />
    </div>
  );
}

// ============ FILES ============
export function ImageToPDF() {
  const [files, setFiles] = useState([]);
  const convert = async () => {
    if (!files.length) return;
    const pdf = new jsPDF();
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      const img = new Image();
      await new Promise((res) => { img.onload = res; img.src = url; });
      const w = pdf.internal.pageSize.getWidth();
      const h = (img.height * w) / img.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(img, 'JPEG', 0, 0, w, h);
    }
    pdf.save('images.pdf');
    toast.success('تم إنشاء PDF');
  };
  return (
    <div className="space-y-5">
      <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-[#D4AF37]">
        <Upload className="h-8 w-8 text-[#D4AF37] mb-2" />
        <span>اختر الصور</span>
        <input type="file" accept="image/*" multiple hidden data-testid="i2p-files" onChange={(e) => setFiles([...e.target.files])} />
      </label>
      {files.length > 0 && <p className="text-sm">تم اختيار {files.length} صورة</p>}
      <Button testid="i2p-convert" onClick={convert}>تحويل إلى PDF</Button>
    </div>
  );
}

export function ImageFormat() {
  const [file, setFile] = useState(null), [target, setTarget] = useState('image/jpeg');
  const convert = () => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `converted.${target.split('/')[1]}`;
        a.click();
        toast.success('تم التحويل');
      }, target, 0.92);
    };
    img.src = URL.createObjectURL(file);
  };
  return (
    <div className="space-y-5">
      <input type="file" accept="image/*" data-testid="if-file" onChange={(e) => setFile(e.target.files[0])} className="block" />
      <Select testid="if-target" value={target} onChange={(e) => setTarget(e.target.value)}>
        <option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option>
      </Select>
      <Button testid="if-convert" onClick={convert}>تحويل</Button>
    </div>
  );
}

export function ImageCompress() {
  const [file, setFile] = useState(null), [q, setQ] = useState(70);
  const compress = () => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `compressed_${file.name}`;
        a.click();
        toast.success(`تم ضغط الصورة (${(blob.size / 1024).toFixed(0)} KB)`);
      }, 'image/jpeg', q / 100);
    };
    img.src = URL.createObjectURL(file);
  };
  return (
    <div className="space-y-5">
      <input type="file" accept="image/*" data-testid="ic-file" onChange={(e) => setFile(e.target.files[0])} />
      <label>الجودة: {q}%<input type="range" min="10" max="100" value={q} onChange={(e) => setQ(+e.target.value)} data-testid="ic-q" className="w-full" /></label>
      <Button testid="ic-compress" onClick={compress}>اضغط الصورة</Button>
    </div>
  );
}

export function MergeImages() {
  const [files, setFiles] = useState([]), [dir, setDir] = useState('vertical');
  const merge = async () => {
    if (files.length < 2) { toast.error('اختر صورتين على الأقل'); return; }
    const imgs = await Promise.all([...files].map((f) => new Promise((res) => { const img = new Image(); img.onload = () => res(img); img.src = URL.createObjectURL(f); })));
    const canvas = document.createElement('canvas');
    if (dir === 'vertical') {
      const w = Math.max(...imgs.map((i) => i.width));
      const h = imgs.reduce((s, i) => s + i.height, 0);
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d'); let y = 0;
      imgs.forEach((i) => { ctx.drawImage(i, 0, y); y += i.height; });
    } else {
      const w = imgs.reduce((s, i) => s + i.width, 0);
      const h = Math.max(...imgs.map((i) => i.height));
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d'); let x = 0;
      imgs.forEach((i) => { ctx.drawImage(i, x, 0); x += i.width; });
    }
    canvas.toBlob((blob) => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'merged.jpg'; a.click();
    }, 'image/jpeg', 0.92);
  };
  return (
    <div className="space-y-5">
      <input type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} data-testid="mi-files" />
      <Select testid="mi-dir" value={dir} onChange={(e) => setDir(e.target.value)}>
        <option value="vertical">عمودي</option><option value="horizontal">أفقي</option>
      </Select>
      <Button testid="mi-merge" onClick={merge}>دمج</Button>
    </div>
  );
}

const FILE_CONVERTERS = [
  ['PDF to Word', 'https://www.ilovepdf.com/pdf_to_word'],
  ['Word to PDF', 'https://www.ilovepdf.com/word_to_pdf'],
  ['PDF to Excel', 'https://www.ilovepdf.com/pdf_to_excel'],
  ['Excel to PDF', 'https://www.ilovepdf.com/excel_to_pdf'],
  ['PDF to JPG', 'https://www.ilovepdf.com/pdf_to_jpg'],
  ['JPG to PDF', 'https://www.ilovepdf.com/jpg_to_pdf'],
  ['PDF to PPTX', 'https://www.ilovepdf.com/pdf_to_powerpoint'],
  ['PowerPoint to PDF', 'https://www.ilovepdf.com/powerpoint_to_pdf'],
  ['HTML to PDF', 'https://www.ilovepdf.com/html-to-pdf'],
  ['MP4 to MP3', 'https://convertio.co/mp4-mp3/'],
  ['Video to GIF', 'https://ezgif.com/video-to-gif'],
  ['HEIC to JPG', 'https://convertio.co/heic-jpg/'],
  ['PDF to TXT', 'https://convertio.co/pdf-txt/'],
  ['PDF to EPUB', 'https://convertio.co/pdf-epub/'],
  ['PDF to SVG', 'https://convertio.co/pdf-svg/'],
  ['PDF to DXF', 'https://convertio.co/pdf-dxf/'],
  ['DWG to PDF', 'https://convertio.co/dwg-pdf/'],
  ['PNG to JPG', 'https://convertio.co/png-jpg/'],
  ['PNG to EPS', 'https://convertio.co/png-eps/'],
  ['JPEG to EPS', 'https://convertio.co/jpeg-eps/'],
  ['PDF to HTML', 'https://convertio.co/pdf-html/'],
];
export function FileConvertersList() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">روابط مباشرة لمحولات صيغ الملفات الشعبية (خدمات خارجية موثوقة).</p>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {FILE_CONVERTERS.map(([n, u]) => (
          <a key={n} href={u} target="_blank" rel="noreferrer" data-testid={`fc-${n}`} className="rounded-xl border border-border p-3 hover:border-[#D4AF37] transition-colors text-sm text-center">
            {n}
          </a>
        ))}
      </div>
    </div>
  );
}

// ============ TEXT ============
export function WordCount() {
  const [t, setT] = useState('');
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  const chars = t.length, charsNoSpaces = t.replace(/\s/g, '').length;
  const lines = t ? t.split('\n').length : 0;
  const readMin = Math.max(1, Math.ceil(words / 200));
  return (
    <div className="space-y-5">
      <textarea data-testid="wc-input" value={t} onChange={(e) => setT(e.target.value)} rows={10} className="w-full rounded-xl border border-input bg-background px-4 py-3" placeholder="الصق نصك هنا..." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultBox label="كلمات" value={toArabicDigits(words)} testid="wc-words" />
        <ResultBox label="حروف" value={toArabicDigits(chars)} testid="wc-chars" />
        <ResultBox label="حروف (بدون فراغ)" value={toArabicDigits(charsNoSpaces)} testid="wc-chars-ns" />
        <ResultBox label="وقت القراءة" value={`${toArabicDigits(readMin)} دقيقة`} testid="wc-read" />
      </div>
    </div>
  );
}

export function TextCase() {
  const [t, setT] = useState('');
  const upper = t.toUpperCase(), lower = t.toLowerCase();
  const reverse = t.split('').reverse().join('');
  const noDiacritics = t.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
  return (
    <div className="space-y-5">
      <textarea data-testid="tc-input" value={t} onChange={(e) => setT(e.target.value)} rows={5} className="w-full rounded-xl border border-input bg-background px-4 py-3" />
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="حروف كبيرة" value={upper} testid="tc-upper" />
        <ResultBox label="حروف صغيرة" value={lower} testid="tc-lower" />
        <ResultBox label="عكس النص" value={reverse} testid="tc-reverse" />
        <ResultBox label="بدون تشكيل" value={noDiacritics} testid="tc-nodia" />
      </div>
    </div>
  );
}

export function KbFlip() {
  const [t, setT] = useState('hbf khf'), [dir, setDir] = useState('ar');
  const r = keyboardFlip(t, dir);
  return (
    <div className="space-y-5">
      <Select testid="kb-dir" value={dir} onChange={(e) => setDir(e.target.value)}>
        <option value="ar">إنجليزي → عربي</option><option value="en">عربي → إنجليزي</option>
      </Select>
      <textarea data-testid="kb-input" value={t} onChange={(e) => setT(e.target.value)} rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-3" />
      <ResultBox label="النتيجة" value={r} testid="kb-result" />
    </div>
  );
}

export function Diacritics() {
  const [t, setT] = useState('السلام عليكم ورحمة الله وبركاته');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const remove = () => setOutput(t.replace(/[\u064B-\u0652\u0670\u0640]/g, ''));

  const add = async () => {
    if (!t.trim()) return;
    setLoading(true); setOutput('');
    try {
      const r = await (await import('axios')).default.post(`${process.env.REACT_APP_BACKEND_URL}/api/ai/tashkeel`, { text: t });
      setOutput(r.data.text);
    } catch { toast.error('تعذّر إضافة التشكيل، حاول لاحقاً'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <textarea data-testid="di-input" value={t} onChange={(e) => setT(e.target.value)} rows={5} className="w-full rounded-xl border border-input bg-background px-4 py-3 leading-loose" style={{ fontFamily: 'Amiri, serif' }} />
      <div className="flex gap-2">
        <Button testid="di-add" onClick={add} disabled={loading}>{loading ? 'جاري الإضافة...' : 'أضف التشكيل بالذكاء الاصطناعي'}</Button>
        <Button testid="di-remove" variant="ghost" onClick={remove}>إزالة التشكيل</Button>
      </div>
      {output && (
        <div data-testid="di-result" className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 p-5 text-xl leading-loose" style={{ fontFamily: 'Amiri, serif' }}>
          {output}
          <div className="mt-3">
            <Button testid="di-copy" variant="ghost" onClick={() => { navigator.clipboard.writeText(output); toast.success('تم النسخ'); }}>
              <Copy className="h-4 w-4" /> نسخ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MISC ============
const AI_SITES = [
  { n: 'ChatGPT', u: 'https://chat.openai.com', d: 'محادثة ذكية من OpenAI' },
  { n: 'Claude', u: 'https://claude.ai', d: 'مساعد Anthropic الذكي' },
  { n: 'Gemini', u: 'https://gemini.google.com', d: 'AI من Google' },
  { n: 'Perplexity', u: 'https://perplexity.ai', d: 'بحث ذكي' },
  { n: 'Midjourney', u: 'https://midjourney.com', d: 'توليد الصور' },
  { n: 'DALL·E', u: 'https://openai.com/dall-e-3', d: 'توليد صور من OpenAI' },
  { n: 'Runway', u: 'https://runwayml.com', d: 'فيديو AI' },
  { n: 'Sora', u: 'https://sora.com', d: 'توليد فيديو OpenAI' },
  { n: 'ElevenLabs', u: 'https://elevenlabs.io', d: 'توليد أصوات واقعية' },
  { n: 'Suno', u: 'https://suno.com', d: 'توليد موسيقى' },
  { n: 'HeyGen', u: 'https://heygen.com', d: 'فيديو أشخاص بالذكاء' },
  { n: 'Cursor', u: 'https://cursor.sh', d: 'محرر برمجة ذكي' },
  { n: 'GitHub Copilot', u: 'https://github.com/features/copilot', d: 'مساعد المبرمجين' },
  { n: 'Notion AI', u: 'https://notion.so', d: 'كتابة وإنتاجية' },
  { n: 'Grok', u: 'https://grok.com', d: 'AI من xAI' },
];
export function AiSites() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {AI_SITES.map((s) => (
        <a key={s.n} href={s.u} target="_blank" rel="noreferrer" data-testid={`ai-${s.n}`} className="rounded-2xl border border-border p-4 hover:border-[#D4AF37] card-lift">
          <h4 className="font-bold text-lg">{s.n}</h4>
          <p className="text-sm text-muted-foreground">{s.d}</p>
        </a>
      ))}
    </div>
  );
}

export function Countdown() {
  const [target, setTarget] = useState(''), [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const diff = target ? Math.max(0, new Date(target).getTime() - now) : 0;
  const d = Math.floor(diff / 86400000), h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60), s = Math.floor((diff / 1000) % 60);
  return (
    <div className="space-y-5 text-center">
      <Input testid="cd-target" type="datetime-local" label="التاريخ المستهدف" value={target} onChange={(e) => setTarget(e.target.value)} />
      <div className="grid grid-cols-4 gap-3">
        {[['يوم', d], ['ساعة', h], ['دقيقة', m], ['ثانية', s]].map(([k, v]) => (
          <div key={k} data-testid={`cd-${k}`} className="rounded-2xl border-2 border-[#D4AF37]/30 p-4">
            <div className="text-4xl md:text-5xl font-black text-[#D4AF37]">{toArabicDigits(v)}</div>
            <div className="text-xs text-muted-foreground">{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Pomodoro() {
  const [mins, setMins] = useState(25), [sec, setSec] = useState(0), [run, setRun] = useState(false), [mode, setMode] = useState('work');
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => {
      if (sec === 0) {
        if (mins === 0) {
          setRun(false);
          const nextMode = mode === 'work' ? 'break' : 'work';
          setMode(nextMode); setMins(nextMode === 'work' ? 25 : 5); setSec(0);
          try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==').play(); } catch {}
          return;
        }
        setMins(mins - 1); setSec(59);
      } else setSec(sec - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [run, mins, sec, mode]);
  const reset = () => { setRun(false); setMode('work'); setMins(25); setSec(0); };
  return (
    <div className="space-y-5 text-center">
      <div className="text-lg">{mode === 'work' ? '🎯 وقت التركيز' : '☕ وقت الاستراحة'}</div>
      <div data-testid="pm-timer" className="text-7xl md:text-9xl font-black tabular-nums text-[#D4AF37]">{String(mins).padStart(2, '0')}:{String(sec).padStart(2, '0')}</div>
      <div className="flex justify-center gap-3">
        <Button testid="pm-toggle" onClick={() => setRun(!run)}>{run ? <><Pause className="h-4 w-4" /> إيقاف</> : <><Play className="h-4 w-4" /> ابدأ</>}</Button>
        <Button testid="pm-reset" variant="ghost" onClick={reset}><Square className="h-4 w-4" /> إعادة</Button>
      </div>
    </div>
  );
}

export function WorldClock() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(i); }, []);
  const cities = [
    ['الرياض', 'Asia/Riyadh'], ['دبي', 'Asia/Dubai'], ['القاهرة', 'Africa/Cairo'],
    ['اسطنبول', 'Europe/Istanbul'], ['لندن', 'Europe/London'], ['نيويورك', 'America/New_York'],
    ['طوكيو', 'Asia/Tokyo'], ['سيدني', 'Australia/Sydney'],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cities.map(([c, tz]) => {
        const t = new Date().toLocaleTimeString('ar-SA', { timeZone: tz, hour12: true });
        return (
          <div key={c} data-testid={`wc-${c}`} className="rounded-2xl border border-border p-4 flex justify-between items-center">
            <span className="font-semibold">{c}</span>
            <span dir="ltr" className="text-xl font-bold text-[#D4AF37] tabular-nums">{t}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Stopwatch() {
  const [ms, setMs] = useState(0), [run, setRun] = useState(false), [laps, setLaps] = useState([]);
  useEffect(() => { if (!run) return; const i = setInterval(() => setMs(m => m + 10), 10); return () => clearInterval(i); }, [run]);
  const fmt = (t) => `${String(Math.floor(t / 60000)).padStart(2, '0')}:${String(Math.floor((t / 1000) % 60)).padStart(2, '0')}.${String(Math.floor((t / 10) % 100)).padStart(2, '0')}`;
  return (
    <div className="space-y-5 text-center">
      <div data-testid="sw-time" className="text-6xl md:text-7xl font-black tabular-nums text-[#D4AF37]">{fmt(ms)}</div>
      <div className="flex justify-center gap-3">
        <Button testid="sw-toggle" onClick={() => setRun(!run)}>{run ? 'إيقاف' : 'ابدأ'}</Button>
        <Button testid="sw-lap" variant="ghost" onClick={() => setLaps([...laps, ms])}>Lap</Button>
        <Button testid="sw-reset" variant="ghost" onClick={() => { setMs(0); setLaps([]); setRun(false); }}>إعادة</Button>
      </div>
      <div className="space-y-1">
        {laps.map((l, i) => <div key={i} className="rounded-xl border border-border p-2 text-sm">Lap {i + 1}: {fmt(l)}</div>)}
      </div>
    </div>
  );
}

export function TodoList() {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('todo') || '[]'));
  const [t, setT] = useState('');
  useEffect(() => { localStorage.setItem('todo', JSON.stringify(items)); }, [items]);
  const add = () => { if (t.trim()) { setItems([...items, { id: Date.now(), text: t, done: false }]); setT(''); } };
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Input testid="td-input" placeholder="مهمة جديدة..." value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Button testid="td-add" onClick={add}>+</Button>
      </div>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <input type="checkbox" checked={i.done} onChange={() => setItems(items.map(x => x.id === i.id ? { ...x, done: !x.done } : x))} data-testid={`td-check-${i.id}`} />
            <span className={`flex-1 ${i.done ? 'line-through text-muted-foreground' : ''}`}>{i.text}</span>
            <button onClick={() => setItems(items.filter(x => x.id !== i.id))} data-testid={`td-del-${i.id}`}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
