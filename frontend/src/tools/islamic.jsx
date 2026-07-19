// Islamic tools
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Input, Select, Button, ResultBox } from '../lib/ui';
import { toArabicDigits } from '../lib/helpers';
import { toHijri, toGregorian } from 'hijri-converter';
import { Plus, Minus, RotateCcw, Volume2, Play, Pause } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function PrayerTimes() {
  const [city, setCity] = useState('Riyadh');
  const [country, setCountry] = useState('SA');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    axios.get(`${API}/prayer-times`, { params: { city, country, method: 4 } })
      .then((r) => setData(r.data?.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const prayers = data?.timings ? {
    'الفجر': data.timings.Fajr,
    'الشروق': data.timings.Sunrise,
    'الظهر': data.timings.Dhuhr,
    'العصر': data.timings.Asr,
    'المغرب': data.timings.Maghrib,
    'العشاء': data.timings.Isha,
  } : null;

  const cities = ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Taif', 'Abha', 'Tabuk', 'Buraidah'];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Select testid="pt-city" label="المدينة" value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input testid="pt-country" label="رمز الدولة (ISO)" value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} />
        <div className="flex items-end">
          <Button testid="pt-load" onClick={load}>تحديث</Button>
        </div>
      </div>
      {loading && <p className="text-muted-foreground">جاري التحميل...</p>}
      {prayers && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(prayers).map(([k, v]) => (
            <div key={k} data-testid={`prayer-${k}`} className="rounded-2xl border border-border p-4 flex justify-between items-center hover:border-[#D4AF37] transition-colors">
              <span className="font-semibold">{k}</span>
              <span dir="ltr" className="text-lg font-bold text-[#D4AF37]">{v}</span>
            </div>
          ))}
        </div>
      )}
      {data?.date && (
        <div className="text-sm text-muted-foreground">التاريخ: {data.date.readable} — {data.date.hijri?.date} هـ</div>
      )}
    </div>
  );
}

export function HijriDate() {
  const now = new Date();
  const h = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const months = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  return (
    <div className="text-center py-8">
      <div className="text-6xl md:text-8xl font-bold text-[#D4AF37]">
        {toArabicDigits(h.hd)}
      </div>
      <div className="text-2xl md:text-3xl font-semibold mt-2">
        {months[h.hm - 1]} {toArabicDigits(h.hy)} هـ
      </div>
      <div className="mt-4 text-muted-foreground">الموافق {now.toLocaleDateString('ar-SA')}</div>
    </div>
  );
}

export function DateConvert() {
  const [mode, setMode] = useState('g2h');
  const today = new Date();
  const [gy, setGy] = useState(today.getFullYear()), [gm, setGm] = useState(today.getMonth() + 1), [gd, setGd] = useState(today.getDate());
  const initH = toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [hy, setHy] = useState(initH.hy), [hm, setHm] = useState(initH.hm), [hd, setHd] = useState(initH.hd);

  let result = '';
  try {
    if (mode === 'g2h') {
      const h = toHijri(+gy, +gm, +gd);
      result = `${toArabicDigits(h.hd)} / ${toArabicDigits(h.hm)} / ${toArabicDigits(h.hy)} هـ`;
    } else {
      const g = toGregorian(+hy, +hm, +hd);
      result = `${g.gd} / ${g.gm} / ${g.gy} م`;
    }
  } catch { result = 'تاريخ غير صحيح'; }

  return (
    <div className="space-y-5">
      <Select testid="dc-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="g2h">ميلادي → هجري</option>
        <option value="h2g">هجري → ميلادي</option>
      </Select>
      {mode === 'g2h' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Input testid="dc-gd" label="اليوم" type="number" value={gd} onChange={(e) => setGd(e.target.value)} />
          <Input testid="dc-gm" label="الشهر" type="number" value={gm} onChange={(e) => setGm(e.target.value)} />
          <Input testid="dc-gy" label="السنة" type="number" value={gy} onChange={(e) => setGy(e.target.value)} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Input testid="dc-hd" label="اليوم" type="number" value={hd} onChange={(e) => setHd(e.target.value)} />
          <Input testid="dc-hm" label="الشهر" type="number" value={hm} onChange={(e) => setHm(e.target.value)} />
          <Input testid="dc-hy" label="السنة" type="number" value={hy} onChange={(e) => setHy(e.target.value)} />
        </div>
      )}
      <ResultBox testid="dc-result" label="النتيجة" value={result} />
    </div>
  );
}

export function Tasbih() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [phrase, setPhrase] = useState('سبحان الله');
  const phrases = ['سبحان الله', 'الحمد لله', 'الله أكبر', 'لا إله إلا الله', 'أستغفر الله', 'لا حول ولا قوة إلا بالله'];
  const done = count >= target;

  return (
    <div className="space-y-6 text-center">
      <Select testid="tb-phrase" value={phrase} onChange={(e) => setPhrase(e.target.value)}>
        {phrases.map((p) => <option key={p}>{p}</option>)}
      </Select>
      <div className="text-3xl md:text-4xl font-bold text-[#D4AF37]">{phrase}</div>
      <div data-testid="tb-count" className="text-7xl md:text-8xl font-black tabular-nums">
        {toArabicDigits(count)}
      </div>
      <div className="text-sm text-muted-foreground">الهدف: {toArabicDigits(target)}</div>
      <div className="flex justify-center gap-3">
        <Button testid="tb-inc" variant="gold" onClick={() => setCount(c => c + 1)}><Plus className="h-5 w-5" /> سبّح</Button>
        <Button testid="tb-dec" variant="ghost" onClick={() => setCount(c => Math.max(0, c - 1))}><Minus className="h-4 w-4" /></Button>
        <Button testid="tb-reset" variant="ghost" onClick={() => setCount(0)}><RotateCcw className="h-4 w-4" /> صفر</Button>
      </div>
      <div className="flex justify-center gap-2 text-sm">
        {[33, 100, 500].map(t => (
          <button key={t} onClick={() => setTarget(t)} data-testid={`tb-target-${t}`} className={`rounded-full px-3 py-1 border ${target === t ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-border'}`}>
            {toArabicDigits(t)}
          </button>
        ))}
      </div>
      {done && <div className="p-4 rounded-xl bg-emerald-700/10 border border-emerald-700/30 text-emerald-700 dark:text-emerald-400">تم إكمال الهدف — تقبّل الله منك 🌿</div>}
    </div>
  );
}

const MORNING = [
  { text: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ...', times: 1 },
  { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ...', times: 1 },
  { text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', times: 1 },
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', times: 100 },
  { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد', times: 10 },
  { text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِير', times: 10 },
];
const EVENING = MORNING.map((a) => ({ ...a, text: a.text.replace('أَصْبَحْنَا', 'أَمْسَيْنَا').replace('الْمُلْكُ لِلَّهِ', 'الْمُلْكُ لِلَّهِ') }));

export function Adhkar() {
  const [mode, setMode] = useState('morning');
  const list = mode === 'morning' ? MORNING : EVENING;
  const [counts, setCounts] = useState(list.map(() => 0));
  useEffect(() => setCounts(list.map(() => 0)), [mode]);
  const done = counts.filter((c, i) => c >= list[i].times).length;
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('morning')} data-testid="adh-morning" className={`flex-1 rounded-xl border px-4 py-3 ${mode === 'morning' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-border'}`}>أذكار الصباح</button>
        <button onClick={() => setMode('evening')} data-testid="adh-evening" className={`flex-1 rounded-xl border px-4 py-3 ${mode === 'evening' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-border'}`}>أذكار المساء</button>
      </div>
      <div className="rounded-full h-2 bg-muted overflow-hidden">
        <div className="h-full bg-[#D4AF37]" style={{ width: `${(done / list.length) * 100}%` }}></div>
      </div>
      {list.map((d, i) => (
        <div key={i} data-testid={`dhikr-${i}`} className={`rounded-2xl border p-4 ${counts[i] >= d.times ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-border'}`}>
          <p className="text-lg leading-loose font-medium" style={{ fontFamily: 'Amiri, serif' }}>{d.text}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">التكرار: {toArabicDigits(d.times)}</span>
            <div className="flex items-center gap-2">
              <span className="tabular-nums font-bold text-[#D4AF37]">{toArabicDigits(counts[i])}/{toArabicDigits(d.times)}</span>
              <button onClick={() => { const c = [...counts]; c[i] = Math.min(d.times, c[i] + 1); setCounts(c); }} className="rounded-full bg-[#D4AF37] px-4 py-1 text-black font-semibold" data-testid={`dhikr-inc-${i}`}>+</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Qibla() {
  const [lat, setLat] = useState(24.7136), [lng, setLng] = useState(46.6753);
  const KAABA = { lat: 21.4225, lng: 39.8262 };
  const toRad = (x) => (x * Math.PI) / 180;
  const toDeg = (x) => (x * 180) / Math.PI;
  const dLon = toRad(KAABA.lng - lng);
  const y = Math.sin(dLon) * Math.cos(toRad(KAABA.lat));
  const x = Math.cos(toRad(lat)) * Math.sin(toRad(KAABA.lat)) - Math.sin(toRad(lat)) * Math.cos(toRad(KAABA.lat)) * Math.cos(dLon);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const useLoc = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); });
  };
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="qb-lat" label="خط العرض" type="number" step="0.0001" value={lat} onChange={(e) => setLat(e.target.value)} />
        <Input testid="qb-lng" label="خط الطول" type="number" step="0.0001" value={lng} onChange={(e) => setLng(e.target.value)} />
      </div>
      <Button testid="qb-locate" variant="ghost" onClick={useLoc}>استخدم موقعي</Button>
      <div className="text-center py-6">
        <div className="relative mx-auto h-56 w-56 rounded-full border-4 border-[#D4AF37]/40">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl">🕋</div>
          </div>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 origin-bottom"
            style={{ height: '45%', width: '4px', background: '#D4AF37', transform: `translateX(-50%) rotate(${bearing}deg)`, transformOrigin: 'bottom center', bottom: '50%' }}
          />
        </div>
        <div data-testid="qb-bearing" className="mt-4 text-2xl font-bold text-[#D4AF37]">{bearing.toFixed(1)}°</div>
        <div className="text-sm text-muted-foreground">اتجاه القبلة من موقعك (شمالاً = 0°)</div>
      </div>
    </div>
  );
}

export function RamadanCountdown() {
  const now = new Date();
  const h = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
  // Next Ramadan 1
  let year = h.hy;
  if (h.hm > 9 || (h.hm === 9 && h.hd > 0)) year++;
  const next = toGregorian(year, 9, 1);
  const target = new Date(next.gy, next.gm - 1, next.gd);
  const diff = target - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return (
    <div className="text-center py-10">
      <div className="text-lg text-muted-foreground mb-4">باقي على رمضان {toArabicDigits(year)} هـ</div>
      <div className="text-7xl md:text-8xl font-black text-[#D4AF37]">{toArabicDigits(days)}</div>
      <div className="text-xl mt-2">يوم و {toArabicDigits(hours)} ساعة</div>
      <div className="mt-6 text-sm text-muted-foreground">أول أيام رمضان (تقديري): {target.toLocaleDateString('ar-SA')}</div>
    </div>
  );
}

const ASMA = [
  'الرحمن', 'الرحيم', 'الملك', 'القدوس', 'السلام', 'المؤمن', 'المهيمن', 'العزيز', 'الجبار', 'المتكبر',
  'الخالق', 'البارئ', 'المصور', 'الغفار', 'القهار', 'الوهاب', 'الرزاق', 'الفتاح', 'العليم', 'القابض',
  'الباسط', 'الخافض', 'الرافع', 'المعز', 'المذل', 'السميع', 'البصير', 'الحكم', 'العدل', 'اللطيف',
  'الخبير', 'الحليم', 'العظيم', 'الغفور', 'الشكور', 'العلي', 'الكبير', 'الحفيظ', 'المقيت', 'الحسيب',
  'الجليل', 'الكريم', 'الرقيب', 'المجيب', 'الواسع', 'الحكيم', 'الودود', 'المجيد', 'الباعث', 'الشهيد',
  'الحق', 'الوكيل', 'القوي', 'المتين', 'الولي', 'الحميد', 'المحصي', 'المبدئ', 'المعيد', 'المحيي',
  'المميت', 'الحي', 'القيوم', 'الواجد', 'الماجد', 'الواحد', 'الأحد', 'الصمد', 'القادر', 'المقتدر',
  'المقدم', 'المؤخر', 'الأول', 'الآخر', 'الظاهر', 'الباطن', 'الوالي', 'المتعالي', 'البر', 'التواب',
  'المنتقم', 'العفو', 'الرؤوف', 'مالك الملك', 'ذو الجلال والإكرام', 'المقسط', 'الجامع', 'الغني', 'المغني',
  'المانع', 'الضار', 'النافع', 'النور', 'الهادي', 'البديع', 'الباقي', 'الوارث', 'الرشيد', 'الصبور',
];
export function AsmaHusna() {
  const [q, setQ] = useState('');
  const list = ASMA.filter((n) => n.includes(q));
  return (
    <div className="space-y-4">
      <Input testid="asma-search" placeholder="ابحث..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {list.map((n, i) => (
          <div key={n} data-testid={`asma-${i}`} className="rounded-xl border border-border p-3 text-center font-bold text-lg hover:border-[#D4AF37] transition-colors" style={{ fontFamily: 'Amiri, serif' }}>
            <span className="text-xs text-[#D4AF37] block">{toArabicDigits(ASMA.indexOf(n) + 1)}</span>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
