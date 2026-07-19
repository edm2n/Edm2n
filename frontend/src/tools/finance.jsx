// Finance tools
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Input, Select, Button, ResultBox, ShareBar } from '../lib/ui';
import { num, money, tafqit } from '../lib/helpers';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function LoanBySalary() {
  const [salary, setSalary] = useState('');
  const [obligations, setObligations] = useState('0');
  const [years, setYears] = useState('5');
  const [rate, setRate] = useState('6.5');
  const s = num(salary), o = num(obligations), y = num(years), r = num(rate);
  const dbr = s > 0 ? 0.65 * s - o : 0; // max allowed installment
  const monthlyRate = r / 100 / 12;
  const n = y * 12;
  const maxLoan = dbr > 0 && monthlyRate > 0
    ? (dbr * (1 - Math.pow(1 + monthlyRate, -n))) / monthlyRate
    : dbr * n;
  const result = s > 0 ? `${money(maxLoan)} ` : '';
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="loan-salary" label="الراتب الشهري (ر.س)" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="10000" />
        <Input testid="loan-obligations" label="الالتزامات الشهرية" type="number" value={obligations} onChange={(e) => setObligations(e.target.value)} placeholder="0" />
        <Input testid="loan-years" label="مدة السداد (سنوات)" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        <Input testid="loan-rate" label="نسبة الفائدة السنوية %" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <ResultBox testid="loan-result" label="أقصى تمويل مقترح" value={result} sub={`قسط شهري ~ ${money(dbr)} — DBR 65% من الراتب`} />
      {maxLoan > 0 && <ShareBar text={`أقصى تمويل يطلع لي حسب دليل مطر: ${money(maxLoan)} على مدى ${y} سنوات`} />}
    </div>
  );
}

export function LoanCalculator() {
  const [amount, setAmount] = useState('100000');
  const [years, setYears] = useState('5');
  const [rate, setRate] = useState('6.5');
  const p = num(amount), y = num(years), r = num(rate);
  const mr = r / 100 / 12;
  const n = y * 12;
  const pmt = mr > 0 ? (p * mr) / (1 - Math.pow(1 + mr, -n)) : p / n;
  const total = pmt * n;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="lc-amount" label="مبلغ التمويل" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input testid="lc-years" label="مدة السداد (سنوات)" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        <Input testid="lc-rate" label="فائدة سنوية %" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <ResultBox testid="lc-monthly" label="القسط الشهري" value={money(pmt)} />
        <ResultBox testid="lc-total" label="إجمالي المدفوعات" value={money(total)} />
        <ResultBox testid="lc-interest" label="إجمالي الفوائد" value={money(total - p)} />
      </div>
    </div>
  );
}

export function Zakat() {
  const [cash, setCash] = useState(''), [gold, setGold] = useState(''), [silver, setSilver] = useState(''), [debts, setDebts] = useState('0');
  const [goldPrice, setGoldPrice] = useState('300');
  const total = Math.max(0, num(cash) + num(gold) * num(goldPrice) - num(debts));
  const nisab = 85 * num(goldPrice); // ~85g gold
  const zakat = total >= nisab ? total * 0.025 : 0;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="z-cash" label="النقود (ر.س)" type="number" value={cash} onChange={(e) => setCash(e.target.value)} />
        <Input testid="z-gold" label="الذهب (جرام)" type="number" value={gold} onChange={(e) => setGold(e.target.value)} />
        <Input testid="z-goldp" label="سعر الجرام الحالي" type="number" value={goldPrice} onChange={(e) => setGoldPrice(e.target.value)} />
        <Input testid="z-debts" label="الديون المستحقة" type="number" value={debts} onChange={(e) => setDebts(e.target.value)} />
      </div>
      <ResultBox testid="z-total" label="إجمالي المال الخاضع" value={money(total)} sub={`النصاب التقديري: ${money(nisab)}`} />
      <ResultBox testid="z-zakat" label="مقدار الزكاة (2.5%)" value={zakat > 0 ? money(zakat) : 'لم يبلغ النصاب'} />
      {zakat > 0 && <ShareBar text={`زكاة مالي: ${money(zakat)} — حسبتها من دليل مطر`} />}
    </div>
  );
}

export function Inheritance() {
  // Simplified calculator: spouse + parents + sons/daughters
  const [estate, setEstate] = useState('1000000');
  const [gender, setGender] = useState('male');
  const [spouse, setSpouse] = useState(true);
  const [father, setFather] = useState(false), [mother, setMother] = useState(false);
  const [sons, setSons] = useState('1'), [daughters, setDaughters] = useState('0');
  const e = num(estate);
  const S = num(sons), D = num(daughters);
  const hasChildren = S + D > 0;

  // Fixed shares (fardh)
  let shares = {};
  let remaining = 1;
  // Spouse
  if (spouse) {
    if (gender === 'male') { // deceased male, wife
      const share = hasChildren ? 1/8 : 1/4;
      shares['الزوجة'] = share;
      remaining -= share;
    } else { // deceased female, husband
      const share = hasChildren ? 1/4 : 1/2;
      shares['الزوج'] = share;
      remaining -= share;
    }
  }
  if (mother) {
    const share = hasChildren ? 1/6 : 1/3;
    shares['الأم'] = share;
    remaining -= share;
  }
  if (father) {
    if (hasChildren) {
      shares['الأب'] = 1/6;
      remaining -= 1/6;
    }
    // otherwise father takes asaba (rest)
  }
  // Children (asaba): sons take 2x, daughters 1x
  if (hasChildren && remaining > 0) {
    const totalParts = 2 * S + D;
    if (S > 0) shares['كل ابن'] = (remaining * 2) / totalParts;
    if (D > 0) shares['كل بنت'] = remaining / totalParts;
  } else if (father && !hasChildren && remaining > 0) {
    shares['الأب'] = (shares['الأب'] || 0) + remaining;
    remaining = 0;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="inh-estate" label="قيمة التركة (ر.س)" type="number" value={estate} onChange={(e) => setEstate(e.target.value)} />
        <Select testid="inh-gender" label="جنس المتوفى" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </Select>
        <Input testid="inh-sons" label="عدد الأبناء الذكور" type="number" value={sons} onChange={(e) => setSons(e.target.value)} />
        <Input testid="inh-daughters" label="عدد البنات" type="number" value={daughters} onChange={(e) => setDaughters(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={spouse} onChange={(e) => setSpouse(e.target.checked)} data-testid="inh-spouse" /> يوجد زوج/زوجة</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={father} onChange={(e) => setFather(e.target.checked)} data-testid="inh-father" /> يوجد أب</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={mother} onChange={(e) => setMother(e.target.checked)} data-testid="inh-mother" /> يوجد أم</label>
      </div>
      <div data-testid="inh-result" className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 p-5 space-y-2">
        <div className="text-sm text-muted-foreground mb-2">التقسيم التقريبي (لغرض إرشادي فقط، راجع دار الإفتاء للحالات المعقّدة):</div>
        {Object.entries(shares).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-sm border-b border-border/60 py-2">
            <span>{k}</span>
            <span className="font-semibold">{money(v * e)} <span className="text-xs text-muted-foreground">({(v * 100).toFixed(2)}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CurrencyTool() {
  const [rates, setRates] = useState(null);
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('sar');
  const [to, setTo] = useState('usd');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/currency?base=${from}`).then((r) => {
      setRates(r.data[from]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [from]);

  const rate = rates?.[to];
  const result = rate ? (num(amount) * rate) : null;
  const currencies = ['sar', 'usd', 'eur', 'gbp', 'aed', 'kwd', 'egp', 'jpy', 'try', 'cad', 'chf', 'inr', 'cny'];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="cur-amount" label="المبلغ" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Select testid="cur-from" label="من" value={from} onChange={(e) => setFrom(e.target.value)}>
          {currencies.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
        </Select>
        <Select testid="cur-to" label="إلى" value={to} onChange={(e) => setTo(e.target.value)}>
          {currencies.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
        </Select>
      </div>
      {loading ? <p className="text-muted-foreground">جاري تحميل الأسعار...</p> : (
        <ResultBox testid="cur-result" label={`${amount} ${from.toUpperCase()} =`} value={result ? `${result.toFixed(4)} ${to.toUpperCase()}` : '—'} sub={rate ? `سعر الصرف: 1 ${from.toUpperCase()} = ${rate} ${to.toUpperCase()}` : ''} />
      )}
    </div>
  );
}

export function GoldPrice() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API}/gold-price`).then((r) => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  if (loading) return <p className="text-muted-foreground">جاري تحميل أسعار الذهب...</p>;
  if (!data) return <p className="text-destructive">تعذّر تحميل الأسعار الآن</p>;
  const rows = [
    ['عيار 24 (جرام)', data.karats?.['24k_sar_g']],
    ['عيار 22 (جرام)', data.karats?.['22k_sar_g']],
    ['عيار 21 (جرام)', data.karats?.['21k_sar_g']],
    ['عيار 18 (جرام)', data.karats?.['18k_sar_g']],
  ];
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">آخر تحديث: {data.date}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="الأونصة (USD)" value={data.usd_per_ounce?.toFixed(2)} sub="بالدولار الأمريكي" testid="gold-oz-usd" />
        <ResultBox label="الأونصة (SAR)" value={data.sar_per_ounce?.toFixed(2)} sub="بالريال السعودي" testid="gold-oz-sar" />
      </div>
      <div className="rounded-2xl border border-border p-4">
        <h4 className="font-semibold mb-3">سعر الجرام بالريال</h4>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-border/60 py-2 text-sm">
            <span>{k}</span>
            <span className="font-semibold text-[#D4AF37]">{v?.toFixed(2)} ر.س</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EndOfService() {
  const [salary, setSalary] = useState('10000'), [years, setYears] = useState('5'), [months, setMonths] = useState('0');
  const [reason, setReason] = useState('resign'); // resign or terminate
  const s = num(salary), y = num(years) + num(months) / 12;
  let value = 0;
  if (reason === 'terminate') {
    value = Math.min(y, 5) * s * 0.5 + Math.max(0, y - 5) * s;
  } else {
    // Resignation: less than 2y = 0, 2-5y = 1/3, 5-10 = 2/3, >10 = full
    if (y < 2) value = 0;
    else if (y < 5) value = (Math.min(y, 5) * s * 0.5 + Math.max(0, y - 5) * s) / 3;
    else if (y < 10) value = ((Math.min(y, 5) * s * 0.5 + Math.max(0, y - 5) * s) * 2) / 3;
    else value = Math.min(y, 5) * s * 0.5 + Math.max(0, y - 5) * s;
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="eos-salary" label="الراتب الأخير" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
        <Select testid="eos-reason" label="سبب انتهاء الخدمة" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="resign">استقالة</option>
          <option value="terminate">فصل من العمل</option>
        </Select>
        <Input testid="eos-years" label="سنوات الخدمة" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        <Input testid="eos-months" label="أشهر إضافية" type="number" value={months} onChange={(e) => setMonths(e.target.value)} />
      </div>
      <ResultBox testid="eos-result" label="مكافأة نهاية الخدمة" value={money(value)} sub="حسب نظام العمل السعودي (تقديري)" />
    </div>
  );
}

export function NetSalary() {
  const [gross, setGross] = useState('10000');
  const [gosi, setGosi] = useState(true);
  const g = num(gross);
  const gosiRate = gosi ? 0.10 : 0; // employee share ~ 9.75%
  const deductions = g * gosiRate;
  const net = g - deductions;
  return (
    <div className="space-y-5">
      <Input testid="ns-gross" label="الراتب الإجمالي" type="number" value={gross} onChange={(e) => setGross(e.target.value)} />
      <label className="inline-flex items-center gap-2"><input type="checkbox" checked={gosi} onChange={(e) => setGosi(e.target.checked)} data-testid="ns-gosi" /> خصم التأمينات الاجتماعية (10%)</label>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="الخصومات" value={money(deductions)} testid="ns-ded" />
        <ResultBox label="الراتب الصافي" value={money(net)} testid="ns-net" />
      </div>
    </div>
  );
}

export function Savings() {
  const [monthly, setMonthly] = useState('1000'), [years, setYears] = useState('10'), [rate, setRate] = useState('4');
  const m = num(monthly), y = num(years), r = num(rate) / 100 / 12;
  const n = y * 12;
  const fv = r > 0 ? m * ((Math.pow(1 + r, n) - 1) / r) : m * n;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="sv-monthly" label="ادخار شهري" type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        <Input testid="sv-years" label="عدد السنوات" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        <Input testid="sv-rate" label="فائدة سنوية %" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <ResultBox testid="sv-result" label={`المبلغ بعد ${y} سنة`} value={money(fv)} sub={`إجمالي ما ادخرته: ${money(m * n)}`} />
    </div>
  );
}

export function Investment() {
  const [principal, setPrincipal] = useState('10000'), [years, setYears] = useState('10'), [rate, setRate] = useState('7');
  const p = num(principal), y = num(years), r = num(rate) / 100;
  const fv = p * Math.pow(1 + r, y);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="inv-principal" label="رأس المال الأولي" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        <Input testid="inv-years" label="سنوات" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        <Input testid="inv-rate" label="عائد سنوي %" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <ResultBox testid="inv-result" label={`القيمة بعد ${y} سنة`} value={money(fv)} sub={`الربح: ${money(fv - p)}`} />
    </div>
  );
}

export function Retirement() {
  const [age, setAge] = useState('30'), [retireAge, setRetireAge] = useState('60'), [current, setCurrent] = useState('20000'), [monthly, setMonthly] = useState('1500'), [rate, setRate] = useState('5');
  const yrs = Math.max(0, num(retireAge) - num(age));
  const r = num(rate)/100/12; const n = yrs * 12;
  const fvPrincipal = num(current) * Math.pow(1 + r, n);
  const fvMonthly = r > 0 ? num(monthly) * ((Math.pow(1 + r, n) - 1) / r) : num(monthly) * n;
  const total = fvPrincipal + fvMonthly;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="ret-age" label="عمرك الحالي" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <Input testid="ret-retire" label="سن التقاعد" type="number" value={retireAge} onChange={(e) => setRetireAge(e.target.value)} />
        <Input testid="ret-current" label="المبلغ الحالي" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Input testid="ret-monthly" label="ادخار شهري" type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        <Input testid="ret-rate" label="عائد سنوي %" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <ResultBox testid="ret-result" label={`مبلغ التقاعد بعد ${yrs} سنة`} value={money(total)} />
    </div>
  );
}

export function RentVsBuy() {
  const [rent, setRent] = useState('2000'), [price, setPrice] = useState('500000'), [years, setYears] = useState('20'), [rate, setRate] = useState('6');
  const totalRent = num(rent) * 12 * num(years);
  const p = num(price), y = num(years), r = num(rate) / 100 / 12; const n = y * 12;
  const monthly = r > 0 ? (p * r) / (1 - Math.pow(1 + r, -n)) : p / n;
  const totalBuy = monthly * n;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="rvb-rent" label="إيجار شهري" type="number" value={rent} onChange={(e) => setRent(e.target.value)} />
        <Input testid="rvb-price" label="سعر الشراء" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input testid="rvb-years" label="مدة المقارنة (سنوات)" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        <Input testid="rvb-rate" label="فائدة تمويل %" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox testid="rvb-total-rent" label="إجمالي الإيجار" value={money(totalRent)} />
        <ResultBox testid="rvb-total-buy" label="إجمالي التمويل" value={money(totalBuy)} sub={`القسط الشهري: ${money(monthly)}`} />
      </div>
      <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
        الأفضل مالياً: <b>{totalRent < totalBuy ? 'الإيجار' : 'الشراء'}</b> بفارق <b>{money(Math.abs(totalRent - totalBuy))}</b>
      </div>
    </div>
  );
}

export function TravelCost() {
  const [tickets, setTickets] = useState('2000'), [hotel, setHotel] = useState('300'), [nights, setNights] = useState('7'), [transport, setTransport] = useState('500'), [food, setFood] = useState('200'), [days, setDays] = useState('7'), [ppl, setPpl] = useState('2');
  const total = num(tickets) * num(ppl) + num(hotel) * num(nights) + num(transport) + num(food) * num(days) * num(ppl);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="tc-tickets" label="تذكرة الشخص" type="number" value={tickets} onChange={(e) => setTickets(e.target.value)} />
        <Input testid="tc-ppl" label="عدد الأشخاص" type="number" value={ppl} onChange={(e) => setPpl(e.target.value)} />
        <Input testid="tc-hotel" label="سعر الليلة الفندقية" type="number" value={hotel} onChange={(e) => setHotel(e.target.value)} />
        <Input testid="tc-nights" label="عدد الليالي" type="number" value={nights} onChange={(e) => setNights(e.target.value)} />
        <Input testid="tc-transport" label="مواصلات (إجمالي)" type="number" value={transport} onChange={(e) => setTransport(e.target.value)} />
        <Input testid="tc-food" label="طعام يومي للشخص" type="number" value={food} onChange={(e) => setFood(e.target.value)} />
        <Input testid="tc-days" label="عدد الأيام" type="number" value={days} onChange={(e) => setDays(e.target.value)} />
      </div>
      <ResultBox testid="tc-result" label="التكلفة الإجمالية للرحلة" value={money(total)} />
    </div>
  );
}

export function WeddingCost() {
  const [mahr, setMahr] = useState('30000'), [hall, setHall] = useState('20000'), [dinner, setDinner] = useState('15000'), [travel, setTravel] = useState('10000'), [other, setOther] = useState('5000');
  const total = [mahr, hall, dinner, travel, other].map(num).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="wc-mahr" label="المهر" type="number" value={mahr} onChange={(e) => setMahr(e.target.value)} />
        <Input testid="wc-hall" label="القاعة" type="number" value={hall} onChange={(e) => setHall(e.target.value)} />
        <Input testid="wc-dinner" label="العشاء والضيافة" type="number" value={dinner} onChange={(e) => setDinner(e.target.value)} />
        <Input testid="wc-travel" label="شهر العسل" type="number" value={travel} onChange={(e) => setTravel(e.target.value)} />
        <Input testid="wc-other" label="مصاريف أخرى" type="number" value={other} onChange={(e) => setOther(e.target.value)} />
      </div>
      <ResultBox testid="wc-result" label="تكلفة الزواج الإجمالية" value={money(total)} />
    </div>
  );
}

export function BillSplit() {
  const [amount, setAmount] = useState('300'), [ppl, setPpl] = useState('4'), [tip, setTip] = useState('10');
  const t = num(amount) * (1 + num(tip) / 100);
  const per = t / Math.max(1, num(ppl));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input testid="bs-amount" label="قيمة الفاتورة" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input testid="bs-ppl" label="عدد الأشخاص" type="number" value={ppl} onChange={(e) => setPpl(e.target.value)} />
        <Input testid="bs-tip" label="بقشيش %" type="number" value={tip} onChange={(e) => setTip(e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="الإجمالي مع البقشيش" value={money(t)} testid="bs-total" />
        <ResultBox label="نصيب كل شخص" value={money(per)} testid="bs-per" />
      </div>
    </div>
  );
}

export function Budget() {
  const [income, setIncome] = useState('10000');
  const [rows, setRows] = useState([{ label: 'إيجار', amount: '2000' }, { label: 'طعام', amount: '1500' }, { label: 'مواصلات', amount: '800' }]);
  const total = rows.reduce((s, r) => s + num(r.amount), 0);
  const remaining = num(income) - total;
  return (
    <div className="space-y-5">
      <Input testid="bg-income" label="الدخل الشهري" type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input value={r.label} onChange={(e) => { const c = [...rows]; c[i].label = e.target.value; setRows(c); }} className="flex-1 rounded-xl border border-input bg-background px-4 py-2" data-testid={`bg-label-${i}`} />
            <input type="number" value={r.amount} onChange={(e) => { const c = [...rows]; c[i].amount = e.target.value; setRows(c); }} className="w-32 rounded-xl border border-input bg-background px-4 py-2" data-testid={`bg-amount-${i}`} />
            <button onClick={() => setRows(rows.filter((_, x) => x !== i))} className="rounded-xl border border-border px-3">×</button>
          </div>
        ))}
        <Button testid="bg-add" variant="ghost" onClick={() => setRows([...rows, { label: '', amount: '' }])}>+ إضافة مصروف</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultBox label="إجمالي المصاريف" value={money(total)} testid="bg-total" />
        <ResultBox label="المتبقي" value={money(remaining)} sub={remaining < 0 ? '⚠️ تجاوزت الميزانية' : 'ضمن الميزانية'} testid="bg-remaining" />
      </div>
    </div>
  );
}
