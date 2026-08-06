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
  const [calcType, setCalcType] = useState('gregorian');
  const [gDay, setGDay] = useState(new Date().getDate());
  const [gMonth, setGMonth] = useState(new Date().getMonth() + 1);
  const [gYear, setGYear] = useState(new Date().getFullYear());

  const [hDay, setHDay] = useState(1);
  const [hMonth, setHMonth] = useState(1);
  const [hYear, setHYear] = useState(1447);

  const [result, setResult] = useState(null);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const gMonths = [
    { value: 1, name: 'يناير' }, { value: 2, name: 'فبراير' },
    { value: 3, name: 'مارس' }, { value: 4, name: 'أبريل' },
    { value: 5, name: 'مايو' }, { value: 6, name: 'يونيو' },
    { value: 7, name: 'يوليو' }, { value: 8, name: 'أغسطس' },
    { value: 9, name: 'سبتمبر' }, { value: 10, name: 'أكتوبر' },
    { value: 11, name: 'نوفمبر' }, { value: 12, name: 'ديسمبر' }
  ];
  const hMonths = [
    { value: 1, name: 'محرم' }, { value: 2, name: 'صفر' },
    { value: 3, name: 'ربيع الأول' }, { value: 4, name: 'ربيع الثاني' },
    { value: 5, name: 'جمادى الأولى' }, { value: 6, name: 'جمادى الآخرة' },
    { value: 7, name: 'رجب' }, { value: 8, name: 'شعبان' },
    { value: 9, name: 'رمضان' }, { value: 10, name: 'شوال' },
    { value: 11, name: 'ذو القعدة' }, { value: 12, name: 'ذو الحجة' }
  ];
  const gYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const hYears = Array.from({ length: 5 }, (_, i) => 1446 + i);

  const calculatePregnancy = () => {
    let lmpDate;
    const today = new Date();

    if (calcType === 'gregorian') {
      lmpDate = new Date(gYear, gMonth - 1, gDay);
    } else {
      const approximateDays = ((hYear - 1446) * 354) + ((hMonth - 1) * 29.5) + hDay;
      lmpDate = new Date(2025, 5, 26);
      lmpDate.setDate(lmpDate.getDate() + approximateDays);
    }

    let dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);

    const diffTime = today - lmpDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      setResult({ error: 'تاريخ آخر دورة مدخل غير صحيح (في المستقبل)' });
      return;
    }

    const weeks = Math.floor(diffDays / 7);
    const daysRemaining = diffDays % 7;
    const currentMonth = Math.min(9, Math.floor(weeks / 4.33) + 1);

    setResult({
      dueDate: dueDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      weeks,
      daysRemaining,
      currentMonth,
      progress: Math.min(100, Math.round((weeks / 40) * 100))
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => setCalcType('gregorian')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            calcType === 'gregorian' ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-background border border-border text-foreground'
          }`}
        >
          التاريخ الميلادي
        </button>
        <button
          type="button"
          onClick={() => setCalcType('hijri')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            calcType === 'hijri' ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-background border border-border text-foreground'
          }`}
        >
          التاريخ الهجري
        </button>
      </div>

      <div className="text-center font-medium text-foreground text-sm">أول يوم لآخر دورة شهرية:</div>

      {calcType === 'gregorian' ? (
        <div className="grid grid-cols-3 gap-3">
          <Select label="اليوم" value={gDay} onChange={(e) => setGDay(Number(e.target.value))}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="الشهر" value={gMonth} onChange={(e) => setGMonth(Number(e.target.value))}>
            {gMonths.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </Select>
          <Select label="السنة" value={gYear} onChange={(e) => setGYear(Number(e.target.value))}>
            {gYears.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Select label="اليوم" value={hDay} onChange={(e) => setHDay(Number(e.target.value))}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="الشهر" value={hMonth} onChange={(e) => setHMonth(Number(e.target.value))}>
            {hMonths.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </Select>
          <Select label="السنة" value={hYear} onChange={(e) => setHYear(Number(e.target.value))}>
            {hYears.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      )}

      <div className="pt-2 text-center">
        <Button onClick={calculatePregnancy} variant="gold" className="w-full sm:w-auto px-8 py-2.5 text-base">
          حساب الحمل
        </Button>
      </div>

      {result && !result.error && (
        <div className="space-y-4 mt-4">
          <ResultBox label="تاريخ الولادة المتوقع" value={result.dueDate} testid="pg-edd" />
          <div className="grid gap-3 sm:grid-cols-3 text-center">
            <ResultBox label="عمر الحمل" value={`${toArabicDigits(result.weeks)} أسبوع و ${toArabicDigits(result.daysRemaining)} يوم`} testid="pg-age" />
            <ResultBox label="الشهر الحالي" value={`الشهر ${toArabicDigits(result.currentMonth)}`} testid="pg-month" />
            <ResultBox label="نسبة الإنجاز" value={`${toArabicDigits(result.progress)}%`} testid="pg-progress" />
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-sm">
          {result.error}
        </div>
      )}
    </div>
  );
}

export function Ovulation() {
  const [calcType, setCalcType] = useState('gregorian');
  const [gDay, setGDay] = useState(new Date().getDate());
  const [gMonth, setGMonth] = useState(new Date().getMonth() + 1);
  const [gYear, setGYear] = useState(new Date().getFullYear());

  const [hDay, setHDay] = useState(1);
  const [hMonth, setHMonth] = useState(1);
  const [hYear, setHYear] = useState(1447);

  const [cycle, setCycle] = useState('28');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const gMonths = [
    { value: 1, name: 'يناير' }, { value: 2, name: 'فبراير' },
    { value: 3, name: 'مارس' }, { value: 4, name: 'أبريل' },
    { value: 5, name: 'مايو' }, { value: 6, name: 'يونيو' },
    { value: 7, name: 'يوليو' }, { value: 8, name: 'أغسطس' },
    { value: 9, name: 'سبتمبر' }, { value: 10, name: 'أكتوبر' },
    { value: 11, name: 'نوفمبر' }, { value: 12, name: 'ديسمبر' }
  ];
  const hMonths = [
    { value: 1, name: 'محرم' }, { value: 2, name: 'صفر' },
    { value: 3, name: 'ربيع الأول' }, { value: 4, name: 'ربيع الثاني' },
    { value: 5, name: 'جمادى الأولى' }, { value: 6, name: 'جمادى الآخرة' },
    { value: 7, name: 'رجب' }, { value: 8, name: 'شعبان' },
    { value: 9, name: 'رمضان' }, { value: 10, name: 'شوال' },
    { value: 11, name: 'ذو القعدة' }, { value: 12, name: 'ذو الحجة' }
  ];
  const gYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const hYears = Array.from({ length: 5 }, (_, i) => 1446 + i);

  let lmpDate;
  if (calcType === 'gregorian') {
    lmpDate = new Date(gYear, gMonth - 1, gDay);
  } else {
    const approximateDays = ((hYear - 1446) * 354) + ((hMonth - 1) * 29.5) + hDay;
    lmpDate = new Date(2025, 5, 26);
    lmpDate.setDate(lmpDate.getDate() + approximateDays);
  }

  let ov = new Date(lmpDate);
  ov.setDate(ov.getDate() + num(cycle) - 14);
  let fs = new Date(ov);
  fs.setDate(fs.getDate() - 5);
  let fe = new Date(ov);
  fe.setDate(fe.getDate() + 1);

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => setCalcType('gregorian')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            calcType === 'gregorian' ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-background border border-border text-foreground'
          }`}
        >
          التاريخ الميلادي
        </button>
        <button
          type="button"
          onClick={() => setCalcType('hijri')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            calcType === 'hijri' ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-background border border-border text-foreground'
          }`}
        >
          التاريخ الهجري
        </button>
      </div>

      <div className="text-center font-medium text-foreground text-sm">أول يوم لآخر دورة شهرية:</div>

      {calcType === 'gregorian' ? (
        <div className="grid grid-cols-3 gap-3">
          <Select label="اليوم" value={gDay} onChange={(e) => setGDay(Number(e.target.value))}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="الشهر" value={gMonth} onChange={(e) => setGMonth(Number(e.target.value))}>
            {gMonths.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </Select>
          <Select label="السنة" value={gYear} onChange={(e) => setGYear(Number(e.target.value))}>
            {gYears.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Select label="اليوم" value={hDay} onChange={(e) => setHDay(Number(e.target.value))}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="الشهر" value={hMonth} onChange={(e) => setHMonth(Number(e.target.value))}>
            {hMonths.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </Select>
          <Select label="السنة" value={hYear} onChange={(e) => setHYear(Number(e.target.value))}>
            {hYears.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      )}

      <Input testid="ov-cycle" label="طول الدورة (أيام)" type="number" value={cycle} onChange={(e) => setCycle(e.target.value)} />

      <div className="grid gap-3 sm:grid-cols-3 mt-4">
        <ResultBox label="يوم التبويض" value={ov.toLocaleDateString('ar-SA')} testid="ov-day" />
        <ResultBox label="بداية فترة الخصوبة" value={fs.toLocaleDateString('ar-SA')} testid="ov-start" />
        <ResultBox label="نهاية فترة الخصوبة" value={fe.toLocaleDateString('ar-SA')} testid="ov-end" />
      </div>
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
  const [calcType, setCalcType] = useState('gregorian');
  const [gDay, setGDay] = useState(1);
  const [gMonth, setGMonth] = useState(1);
  const [gYear, setGYear] = useState(2000);

  const [hDay, setHDay] = useState(1);
  const [hMonth, setHMonth] = useState(1);
  const [hYear, setHYear] = useState(1420);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const gMonths = [
    { value: 1, name: 'يناير' }, { value: 2, name: 'فبراير' },
    { value: 3, name: 'مارس' }, { value: 4, name: 'أبريل' },
    { value: 5, name: 'مايو' }, { value: 6, name: 'يونيو' },
    { value: 7, name: 'يوليو' }, { value: 8, name: 'أغسطس' },
    { value: 9, name: 'سبتمبر' }, { value: 10, name: 'أكتوبر' },
    { value: 11, name: 'نوفمبر' }, { value: 12, name: 'ديسمبر' }
  ];
  const hMonths = [
    { value: 1, name: 'محرم' }, { value: 2, name: 'صفر' },
    { value: 3, name: 'ربيع الأول' }, { value: 4, name: 'ربيع الثاني' },
    { value: 5, name: 'جمادى الأولى' }, { value: 6, name: 'جمادى الآخرة' },
    { value: 7, name: 'رجب' }, { value: 8, name: 'شعبان' },
    { value: 9, name: 'رمضان' }, { value: 10, name: 'شوال' },
    { value: 11, name: 'ذو القعدة' }, { value: 12, name: 'ذو الحجة' }
  ];
  const gYears = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 79 + i);
  const hYears = Array.from({ length: 80 }, (_, i) => 1370 + i);

  let birthDate;
  const now = new Date();
  if (calcType === 'gregorian') {
    birthDate = new Date(gYear, gMonth - 1, gDay);
  } else {
    const approximateDays = ((hYear - 1420) * 354) + ((hMonth - 1) * 29.5) + hDay;
    birthDate = new Date(1999, 4, 16);
    birthDate.setDate(birthDate.getDate() + approximateDays);
  }

  let totalDays = Math.max(0, Math.floor((now - birthDate) / (1000 * 60 * 60 * 24)));
  let hours = Math.max(0, Math.floor((now - birthDate) / (1000 * 60 * 60)));
  let y = now.getFullYear() - birthDate.getFullYear();
  let m = now.getMonth() - birthDate.getMonth();
  let dCount = now.getDate() - birthDate.getDate();
  if (dCount < 0) { m--; dCount += 30; }
  if (m < 0) { y--; m += 12; }

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => setCalcType('gregorian')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            calcType === 'gregorian' ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-background border border-border text-foreground'
          }`}
        >
          التاريخ الميلادي
        </button>
        <button
          type="button"
          onClick={() => setCalcType('hijri')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            calcType === 'hijri' ? 'bg-[#D4AF37] text-black shadow-md' : 'bg-background border border-border text-foreground'
          }`}
        >
          التاريخ الهجري
        </button>
      </div>

      <div className="text-center font-medium text-foreground text-sm">تاريخ الميلاد:</div>

      {calcType === 'gregorian' ? (
        <div className="grid grid-cols-3 gap-3">
          <Select label="اليوم" value={gDay} onChange={(e) => setGDay(Number(e.target.value))}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="الشهر" value={gMonth} onChange={(e) => setGMonth(Number(e.target.value))}>
            {gMonths.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </Select>
          <Select label="السنة" value={gYear} onChange={(e) => setGYear(Number(e.target.value))}>
            {gYears.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Select label="اليوم" value={hDay} onChange={(e) => setHDay(Number(e.target.value))}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="الشهر" value={hMonth} onChange={(e) => setHMonth(Number(e.target.value))}>
            {hMonths.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </Select>
          <Select label="السنة" value={hYear} onChange={(e) => setHYear(Number(e.target.value))}>
            {hYears.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        <ResultBox label="العمر" value={`${y} سنة، ${m} شهر، ${dCount} يوم`} testid="ac-full" />
        <ResultBox label="بالأيام" value={`${totalDays.toLocaleString()} يوم`} testid="ac-days" />
        <ResultBox label="بالساعات" value={`${hours.toLocaleString()} ساعة`} testid="ac-hours" />
      </div>
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
  const ar = String(t).replace(/[0-9]/g, (d) => '٠١ي٢٣٤٥٦٧٨٩'[+d]);
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
  const [d1, setD1] = useState(new Date().getDate());
  const [m1, setM1] = useState(new Date().getMonth() + 1);
  const [y1, setY1] = useState(new Date().getFullYear());

  const [d2, setD2] = useState(new Date().getDate());
  const [m2, setM2] = useState(new Date().getMonth() + 1);
  const [y2, setY2] = useState(new Date().getFullYear() + 1);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const gMonths = [
    { value: 1, name: 'يناير' }, { value: 2, name: 'فبراير' },
    { value: 3, name: 'مارس' }, { value: 4, name: 'أبريل' },
    { value: 5, name: 'مايو' }, { value: 6, name: 'يونيو' },
    { value: 7, name: 'يوليو' }, { value: 8, name: 'أغسطس' },
    { value: 9, name: 'سبتمبر' }, { value: 10, name: 'أكتوبر' },
    { value: 11, name: 'نوفمبر' }, { value: 12, name: 'ديسمبر' }
  ];
  const gYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffTime = Math.abs(date2 - date1);
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30);
  const remainingDays = totalDays % 30;

  return (
    <div className="space-y-5">
      <div className="text-center font-medium text-foreground text-sm">التاريخ الأول:</div>
      <div className="grid grid-cols-3 gap-3">
        <Select label="اليوم" value={d1} onChange={(e) => setD1(Number(e.target.value))}>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select label="الشهر" value={m1} onChange={(e) => setM1(Number(e.target.value))}>
          {gMonths.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
        </Select>
        <Select label="السنة" value={y1} onChange={(e) => setY1(Number(e.target.value))}>
          {gYears.map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
      </div>

      <div className="text-center font-medium text-foreground text-sm mt-4">التاريخ الثاني:</div>
      <div className="grid grid-cols-3 gap-3">
        <Select label="اليوم" value={d2} onChange={(e) => setD2(Number(e.target.value))}>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select label="الشهر" value={m2} onChange={(e) => setM2(Number(e.target.value))}>
          {gMonths.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
        </Select>
        <Select label="السنة" value={y2} onChange={(e) => setY2(Number(e.target.value))}>
          {gYears.map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
      </div>

      <div className="mt-4">
        <ResultBox label="الفرق الزمني" value={`${totalDays} يوم (${months} شهر و ${remainingDays} يوم)`} testid="td-result" />
      </div>
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
