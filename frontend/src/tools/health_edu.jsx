// Health + Education + Converters + Cars
import React, { useState } from 'react';
import { Input, Select, Button, ResultBox } from '../lib/ui';
import { num, money, toArabicDigits, tafqit } from '../lib/helpers';

// ===================== HEALTH =====================
export function BMI() {
  const [h, setH] = useState('170'), [w, setW] = useState('70');
  const bmi = num(w) / Math.pow(num(h) / 100, 2);
  const cat = bmi < 18.5 ? 'نحافة' : bmi < 25 ? 'وزن طبيعي ✓' : bmi < 30 ? 'زيادة وزن' : 'سمنة';
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="bmi-h" label="الطول (سم)" type="number" value={h} onChange={(e) => setH(e.target.value)} />
        <Input testid="bmi-w" label="الوزن (كجم)" type="number" value={w} onChange={(e) => setW(e.target.value)} />
      </div>
      <ResultBox testid="bmi-result" label="مؤشر كتلة الجسم" value={bmi.toFixed(2)} sub={cat} />
    </div>
  );
}

export function Calories() {
  const [g, setG] = useState('male'), [age, setAge] = useState('30'), [h, setH] = useState('170'), [w, setW] = useState('70'), [act, setAct] = useState('1.55');
  const bmr = g === 'male' ? 10 * num(w) + 6.25 * num(h) - 5 * num(age) + 5 : 10 * num(w) + 6.25 * num(h) - 5 * num(age) - 161;
  const tdee = bmr * num(act);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select testid="cal-g" label="الجنس" value={g} onChange={(e) => setG(e.target.value)}>
          <option value="male">ذكر</option><option value="female">أنثى</option>
        </Select>
        <Input testid="cal-age" label="العمر" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <Input testid="cal-h" label="الطول (سم)" type="number" value={h} onChange={(e) => setH(e.target.value)} />
        <Input testid="cal-w" label="الوزن (كجم)" type="number" value={w} onChange={(e) => setW(e.target.value)} />
        <Select testid="cal-act" label="مستوى النشاط" value={act} onChange={(e) => setAct(e.target.value)}>
          <option value="1.2">قليل الحركة</option>
          <option value="1.375">نشاط خفيف</option>
          <option value="1.55">نشاط متوسط</option>
          <option value="1.725">نشاط عالي</option>
          <option value="1.9">نشاط شديد</option>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="BMR (سعرات الأيض الأساسي)" value={`${bmr.toFixed(0)} سعرة`} testid="cal-bmr" />
        <ResultBox label="TDEE (احتياجك اليومي)" value={`${tdee.toFixed(0)} سعرة`} testid="cal-tdee" />
      </div>
    </div>
  );
}

export function Pregnancy() {
  const [lmp, setLmp] = useState('');
  const lmpDate = lmp ? new Date(lmp) : null;
  const now = new Date();
  let weeks = 0, days = 0, edd = null;
  if (lmpDate && !isNaN(lmpDate)) {
    const diff = now - lmpDate;
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    weeks = Math.floor(totalDays / 7);
    days = totalDays % 7;
    edd = new Date(lmpDate); edd.setDate(edd.getDate() + 280);
  }
  return (
    <div className="space-y-5">
      <Input testid="pg-lmp" label="أول يوم لآخر دورة" type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} />
      {lmpDate && (
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultBox label="عمر الحمل" value={`${toArabicDigits(weeks)} أسبوع و ${toArabicDigits(days)} يوم`} testid="pg-age" />
          <ResultBox label="تاريخ الولادة المتوقع" value={edd?.toLocaleDateString('ar-SA')} testid="pg-edd" />
        </div>
      )}
    </div>
  );
}

export function Ovulation() {
  const [lmp, setLmp] = useState(''), [cycle, setCycle] = useState('28');
  const lmpDate = lmp ? new Date(lmp) : null;
  let ov = null, fs = null, fe = null;
  if (lmpDate) {
    ov = new Date(lmpDate); ov.setDate(ov.getDate() + num(cycle) - 14);
    fs = new Date(ov); fs.setDate(fs.getDate() - 5);
    fe = new Date(ov); fe.setDate(fe.getDate() + 1);
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="ov-lmp" label="أول يوم لآخر دورة" type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} />
        <Input testid="ov-cycle" label="طول الدورة (أيام)" type="number" value={cycle} onChange={(e) => setCycle(e.target.value)} />
      </div>
      {ov && (
        <div className="grid gap-3 sm:grid-cols-3">
          <ResultBox label="يوم التبويض" value={ov.toLocaleDateString('ar-SA')} testid="ov-day" />
          <ResultBox label="بداية فترة الخصوبة" value={fs.toLocaleDateString('ar-SA')} testid="ov-start" />
          <ResultBox label="نهاية فترة الخصوبة" value={fe.toLocaleDateString('ar-SA')} testid="ov-end" />
        </div>
      )}
    </div>
  );
}

export function IdealWeight() {
  const [h, setH] = useState('170'), [g, setG] = useState('male');
  const H = num(h);
  const devine = g === 'male' ? 50 + 0.9 * (H - 152) : 45.5 + 0.9 * (H - 152);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="iw-h" label="الطول (سم)" type="number" value={h} onChange={(e) => setH(e.target.value)} />
        <Select testid="iw-g" label="الجنس" value={g} onChange={(e) => setG(e.target.value)}>
          <option value="male">ذكر</option><option value="female">أنثى</option>
        </Select>
      </div>
      <ResultBox label="الوزن المثالي (كجم)" value={devine.toFixed(1)} testid="iw-result" sub="معادلة Devine" />
    </div>
  );
}

export function BodyFat() {
  const [g, setG] = useState('male'), [w, setW] = useState('70'), [waist, setWaist] = useState('80'), [neck, setNeck] = useState('38'), [hip, setHip] = useState('90'), [h, setH] = useState('170');
  const H = num(h);
  let bf = 0;
  if (g === 'male') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(num(waist) - num(neck)) + 0.15456 * Math.log10(H)) - 450;
  } else {
    bf = 495 / (1.29579 - 0.35004 * Math.log10(num(waist) + num(hip) - num(neck)) + 0.22100 * Math.log10(H)) - 450;
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select testid="bf-g" label="الجنس" value={g} onChange={(e) => setG(e.target.value)}>
          <option value="male">ذكر</option><option value="female">أنثى</option>
        </Select>
        <Input testid="bf-h" label="الطول (سم)" type="number" value={h} onChange={(e) => setH(e.target.value)} />
        <Input testid="bf-waist" label="محيط الخصر (سم)" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} />
        <Input testid="bf-neck" label="محيط الرقبة (سم)" type="number" value={neck} onChange={(e) => setNeck(e.target.value)} />
        {g === 'female' && <Input testid="bf-hip" label="محيط الورك (سم)" type="number" value={hip} onChange={(e) => setHip(e.target.value)} />}
      </div>
      <ResultBox label="نسبة الدهون" value={`${bf.toFixed(1)}%`} testid="bf-result" sub="طريقة البحرية الأمريكية" />
    </div>
  );
}

export function HeartRate() {
  const [age, setAge] = useState('30');
  const max = 220 - num(age);
  return (
    <div className="space-y-5">
      <Input testid="hr-age" label="العمر" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-3">
        <ResultBox label="الحد الأقصى" value={`${max} نبضة/د`} testid="hr-max" />
        <ResultBox label="حرق الدهون (50-70%)" value={`${(max*0.5).toFixed(0)}-${(max*0.7).toFixed(0)}`} testid="hr-fat" />
        <ResultBox label="اللياقة (70-85%)" value={`${(max*0.7).toFixed(0)}-${(max*0.85).toFixed(0)}`} testid="hr-fit" />
      </div>
    </div>
  );
}

export function WaterIntake() {
  const [w, setW] = useState('70'), [act, setAct] = useState('30');
  const base = num(w) * 35;
  const extra = num(act) * 12;
  const total = (base + extra) / 1000;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="wi-w" label="الوزن (كجم)" type="number" value={w} onChange={(e) => setW(e.target.value)} />
        <Input testid="wi-act" label="دقائق النشاط اليومي" type="number" value={act} onChange={(e) => setAct(e.target.value)} />
      </div>
      <ResultBox label="حاجتك اليومية من الماء" value={`${total.toFixed(2)} لتر`} sub={`~ ${Math.round(total * 4)} كوب`} testid="wi-result" />
    </div>
  );
}

export function Sleep() {
  const [wake, setWake] = useState('06:00');
  const [h, m] = wake.split(':').map(Number);
  const target = new Date(); target.setHours(h, m, 0);
  const cycles = [6, 5, 4, 3].map((c) => {
    const t = new Date(target); t.setMinutes(t.getMinutes() - (c * 90 + 15));
    return { c, time: t.toTimeString().slice(0, 5) };
  });
  return (
    <div className="space-y-5">
      <Input testid="sl-wake" type="time" label="متى تريد الاستيقاظ؟" value={wake} onChange={(e) => setWake(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        {cycles.map((c) => (
          <ResultBox key={c.c} label={`${c.c} دورات نوم`} value={c.time} sub={`نم في هذا الوقت لتستيقظ منتعشاً`} testid={`sl-${c.c}`} />
        ))}
      </div>
    </div>
  );
}

// ===================== EDUCATION =====================
export function GPA() {
  const [rows, setRows] = useState([{ name: 'مادة 1', grade: 'A', hours: 3 }]);
  const scale = { 'A+': 5, 'A': 4.75, 'B+': 4.5, 'B': 4, 'C+': 3.5, 'C': 3, 'D+': 2.5, 'D': 2, 'F': 1 };
  const totalHours = rows.reduce((s, r) => s + num(r.hours), 0);
  const points = rows.reduce((s, r) => s + (scale[r.grade] || 0) * num(r.hours), 0);
  const gpa = totalHours > 0 ? points / totalHours : 0;
  return (
    <div className="space-y-5">
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-12 gap-2">
          <input data-testid={`gpa-name-${i}`} value={r.name} onChange={(e) => { const c = [...rows]; c[i].name = e.target.value; setRows(c); }} className="col-span-6 rounded-xl border border-input bg-background px-3 py-2" />
          <select data-testid={`gpa-grade-${i}`} value={r.grade} onChange={(e) => { const c = [...rows]; c[i].grade = e.target.value; setRows(c); }} className="col-span-3 rounded-xl border border-input bg-background px-3 py-2">
            {Object.keys(scale).map((g) => <option key={g}>{g}</option>)}
          </select>
          <input data-testid={`gpa-hours-${i}`} type="number" value={r.hours} onChange={(e) => { const c = [...rows]; c[i].hours = e.target.value; setRows(c); }} className="col-span-2 rounded-xl border border-input bg-background px-3 py-2" />
          <button onClick={() => setRows(rows.filter((_, x) => x !== i))} className="col-span-1 rounded-xl border border-border">×</button>
        </div>
      ))}
      <Button testid="gpa-add" variant="ghost" onClick={() => setRows([...rows, { name: `مادة ${rows.length + 1}`, grade: 'A', hours: 3 }])}>+ إضافة مادة</Button>
      <ResultBox label={`GPA من 5 (${totalHours} ساعة)`} value={gpa.toFixed(2)} testid="gpa-result" />
    </div>
  );
}

export function WeightedAvg() {
  const [h, setH] = useState('95'), [q, setQ] = useState('90'), [a, setA] = useState('85');
  const w = num(h) * 0.3 + num(q) * 0.3 + num(a) * 0.4;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="wa-h" label="ثانوية %" type="number" value={h} onChange={(e) => setH(e.target.value)} />
        <Input testid="wa-q" label="قدرات %" type="number" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input testid="wa-a" label="تحصيلي %" type="number" value={a} onChange={(e) => setA(e.target.value)} />
      </div>
      <ResultBox label="النسبة الموزونة" value={`${w.toFixed(2)}%`} testid="wa-result" sub="30% ثانوية + 30% قدرات + 40% تحصيلي" />
    </div>
  );
}

export function FinalGrade() {
  const [current, setCurrent] = useState('85'), [target, setTarget] = useState('90'), [weight, setWeight] = useState('40');
  const c = num(current), t = num(target), w = num(weight) / 100;
  const need = (t - (1 - w) * c) / w;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="fg-current" label="درجتك الحالية %" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Input testid="fg-target" label="الدرجة المستهدفة %" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Input testid="fg-weight" label="وزن النهائي %" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </div>
      <ResultBox label="تحتاج في الاختبار النهائي" value={`${need.toFixed(2)}%`} sub={need > 100 ? '⚠️ غير ممكن' : need < 0 ? '✓ محقق بالفعل' : ''} testid="fg-result" />
    </div>
  );
}

export function MultiplicationTable() {
  const [n, setN] = useState('7');
  const num_ = num(n);
  return (
    <div className="space-y-5">
      <Input testid="mt-n" label="الرقم" type="number" value={n} onChange={(e) => setN(e.target.value)} />
      <div className="grid gap-2 sm:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((i) => (
          <div key={i} className="rounded-xl border border-border p-3 flex justify-between">
            <span>{num_} × {i}</span>
            <span className="font-bold text-[#D4AF37]">= {num_ * i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== CONVERTERS =====================
export function AgeCalc() {
  const [dob, setDob] = useState('');
  const d = dob ? new Date(dob) : null;
  const now = new Date();
  let y = 0, m = 0, days = 0, totalDays = 0, hours = 0;
  if (d) {
    totalDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    hours = Math.floor((now - d) / (1000 * 60 * 60));
    y = now.getFullYear() - d.getFullYear();
    m = now.getMonth() - d.getMonth();
    days = now.getDate() - d.getDate();
    if (days < 0) { m--; days += 30; }
    if (m < 0) { y--; m += 12; }
  }
  return (
    <div className="space-y-5">
      <Input testid="ac-dob" type="date" label="تاريخ الميلاد" value={dob} onChange={(e) => setDob(e.target.value)} />
      {d && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ResultBox label="العمر" value={`${y} سنة، ${m} شهر، ${days} يوم`} testid="ac-full" />
          <ResultBox label="بالأيام" value={`${totalDays.toLocaleString()} يوم`} testid="ac-days" />
          <ResultBox label="بالساعات" value={`${hours.toLocaleString()} ساعة`} testid="ac-hours" />
        </div>
      )}
    </div>
  );
}

export function PercentageCalc() {
  const [mode, setMode] = useState('of');
  const [a, setA] = useState('20'), [b, setB] = useState('200');
  let result = 0, label = '';
  const A = num(a), B = num(b);
  if (mode === 'of') { result = (A * B) / 100; label = `${A}% من ${B}`; }
  if (mode === 'is') { result = B > 0 ? (A / B) * 100 : 0; label = `${A} من ${B} كنسبة`; }
  if (mode === 'inc') { result = A > 0 ? ((B - A) / A) * 100 : 0; label = `التغيّر من ${A} إلى ${B}`; }
  return (
    <div className="space-y-5">
      <Select testid="pc-mode" label="نوع الحساب" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="of">كم يساوي X% من Y</option>
        <option value="is">X كم يمثل من Y كنسبة</option>
        <option value="inc">نسبة الزيادة/النقصان من X إلى Y</option>
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="pc-a" label="A" type="number" value={a} onChange={(e) => setA(e.target.value)} />
        <Input testid="pc-b" label="B" type="number" value={b} onChange={(e) => setB(e.target.value)} />
      </div>
      <ResultBox label={label} value={mode === 'of' ? result.toFixed(2) : `${result.toFixed(2)}%`} testid="pc-result" />
    </div>
  );
}

export function UnitsConvert() {
  const cats = {
    'طول': { m: 1, cm: 100, mm: 1000, km: 0.001, 'قدم': 3.28084, 'إنش': 39.3701, 'ميل': 0.000621371 },
    'وزن': { kg: 1, g: 1000, mg: 1000000, 'باوند': 2.20462, 'أونصة': 35.274, 'طن': 0.001 },
    'حجم': { L: 1, mL: 1000, 'جالون': 0.264172, 'كوب': 4.22675 },
    'سرعة': { 'كم/س': 1, 'م/ث': 0.277778, 'ميل/س': 0.621371, 'عقدة': 0.539957 },
  };
  const [cat, setCat] = useState('طول');
  const units = Object.keys(cats[cat]);
  const [from, setFrom] = useState(units[0]), [to, setTo] = useState(units[1]);
  const [v, setV] = useState('1');
  const result = (num(v) / cats[cat][from]) * cats[cat][to];
  return (
    <div className="space-y-5">
      <Select testid="un-cat" label="النوع" value={cat} onChange={(e) => { setCat(e.target.value); setFrom(Object.keys(cats[e.target.value])[0]); setTo(Object.keys(cats[e.target.value])[1]); }}>
        {Object.keys(cats).map((k) => <option key={k}>{k}</option>)}
      </Select>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="un-v" label="القيمة" type="number" value={v} onChange={(e) => setV(e.target.value)} />
        <Select testid="un-from" label="من" value={from} onChange={(e) => setFrom(e.target.value)}>{Object.keys(cats[cat]).map((u) => <option key={u}>{u}</option>)}</Select>
        <Select testid="un-to" label="إلى" value={to} onChange={(e) => setTo(e.target.value)}>{Object.keys(cats[cat]).map((u) => <option key={u}>{u}</option>)}</Select>
      </div>
      <ResultBox label={`${v} ${from} =`} value={`${result.toFixed(6)} ${to}`} testid="un-result" />
    </div>
  );
}

export function ArabicNumbers() {
  const [t, setT] = useState('12345');
  const ar = String(t).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  const en = String(t).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  return (
    <div className="space-y-5">
      <Input testid="an-input" label="النص" value={t} onChange={(e) => setT(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="بالأرقام العربية (الهندية)" value={ar} testid="an-ar" />
        <ResultBox label="بالأرقام الإنجليزية" value={en} testid="an-en" />
      </div>
    </div>
  );
}

export function NumberToWords() {
  const [n, setN] = useState('12345');
  const w = tafqit(n);
  return (
    <div className="space-y-5">
      <Input testid="nw-input" label="الرقم" type="number" value={n} onChange={(e) => setN(e.target.value)} />
      <ResultBox label="الرقم كتابياً" value={w} testid="nw-result" />
    </div>
  );
}

export function TimeDiff() {
  const [t1, setT1] = useState(''), [t2, setT2] = useState('');
  let diff = null;
  if (t1 && t2) {
    const d = Math.abs(new Date(t2) - new Date(t1));
    const days = Math.floor(d / 86400000);
    const hours = Math.floor((d / 3600000) % 24);
    const mins = Math.floor((d / 60000) % 60);
    diff = `${days} يوم، ${hours} ساعة، ${mins} دقيقة`;
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="td-t1" type="datetime-local" label="الوقت الأول" value={t1} onChange={(e) => setT1(e.target.value)} />
        <Input testid="td-t2" type="datetime-local" label="الوقت الثاني" value={t2} onChange={(e) => setT2(e.target.value)} />
      </div>
      {diff && <ResultBox label="الفرق" value={diff} testid="td-result" />}
    </div>
  );
}

export function Temperature() {
  const [c, setC] = useState('25');
  const C = num(c);
  const F = C * 9/5 + 32;
  const K = C + 273.15;
  return (
    <div className="space-y-5">
      <Input testid="tp-c" label="مئوية (°C)" type="number" value={c} onChange={(e) => setC(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="فهرنهايت (°F)" value={F.toFixed(2)} testid="tp-f" />
        <ResultBox label="كلفن (K)" value={K.toFixed(2)} testid="tp-k" />
      </div>
    </div>
  );
}

// ===================== CARS =====================
export function FuelCalc() {
  const [km, setKm] = useState('500'), [liters, setLiters] = useState('40'), [price, setPrice] = useState('2.33');
  const consumption = num(km) > 0 ? (num(liters) / num(km)) * 100 : 0;
  const cost = num(liters) * num(price);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="fc-km" label="المسافة (كم)" type="number" value={km} onChange={(e) => setKm(e.target.value)} />
        <Input testid="fc-liters" label="الوقود المستهلك (لتر)" type="number" value={liters} onChange={(e) => setLiters(e.target.value)} />
        <Input testid="fc-price" label="سعر اللتر" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="الاستهلاك" value={`${consumption.toFixed(2)} لتر/100كم`} testid="fc-consumption" />
        <ResultBox label="التكلفة" value={money(cost)} testid="fc-cost" />
      </div>
    </div>
  );
}

export function CarPlate() {
  const [type, setType] = useState('private'); const [years, setYears] = useState('1');
  const fees = { private: 100, taxi: 200, truck: 300 };
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select testid="cp-type" label="نوع اللوحة" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="private">خاص</option><option value="taxi">أجرة</option><option value="truck">نقل</option>
        </Select>
        <Input testid="cp-years" label="مدة التجديد (سنوات)" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
      </div>
      <ResultBox label="الرسوم التقديرية" value={money(fees[type] * num(years))} testid="cp-result" />
    </div>
  );
}

export function CarInspection() {
  const [type, setType] = useState('private');
  const fees = { private: 168, taxi: 253, truck: 425 };
  return (
    <div className="space-y-5">
      <Select testid="ci-type" label="نوع المركبة" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="private">خاصة</option><option value="taxi">أجرة</option><option value="truck">نقل</option>
      </Select>
      <ResultBox label="رسوم الفحص الدوري" value={money(fees[type])} testid="ci-result" sub="التقدير التقريبي (السعودية)" />
    </div>
  );
}

export function CarInsurance() {
  const [value, setValue] = useState('80000'), [age, setAge] = useState('30'), [type, setType] = useState('comp');
  const V = num(value), A = num(age);
  const base = type === 'comp' ? V * 0.03 : V * 0.008;
  const ageAdj = A < 25 ? 1.3 : A < 35 ? 1.0 : 0.9;
  const est = base * ageAdj;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="cin-value" label="قيمة السيارة" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        <Input testid="cin-age" label="عمر السائق" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <Select testid="cin-type" label="نوع التأمين" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="comp">شامل</option><option value="third">ضد الغير</option>
        </Select>
      </div>
      <ResultBox label="التأمين السنوي التقديري" value={money(est)} testid="cin-result" sub="تقدير عام — للاسترشاد فقط" />
    </div>
  );
}
