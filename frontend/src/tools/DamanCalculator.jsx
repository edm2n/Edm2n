import React, { useState } from 'react';

export default function DamanCalculator() {
  const [familyCount, setFamilyCount] = useState(1);
  const [earnedIncome, setEarnedIncome] = useState(0);
  const [unearnedIncome, setUnearnedIncome] = useState(0);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    // 50% من الدخل المكتسب
    const adjustedEarned = Number(earnedIncome) * 0.5;
    // إجمالي الدخل المحتسب
    const totalCalculatedIncome = adjustedEarned + Number(unearnedIncome);
    // الحد الأدنى المحتسب للأسرة (1320 للعائل + 660 لكل تابع)
    const baseLimit = 1320 + ((Number(familyCount) - 1) * 660);
    const maxLimit = Math.min(baseLimit, 5000);

    if (totalCalculatedIncome >= maxLimit) {
      setResult({
        eligible: false,
        message: "عذراً، الدخل المحتسب يتجاوز الحد المانع للاستحقاق."
      });
    } else {
      const estimatedSupport = maxLimit - totalCalculatedIncome;
      setResult({
        eligible: true,
        calculatedIncome: totalCalculatedIncome,
        maxLimit: maxLimit,
        estimatedSupport: Math.max(0, estimatedSupport)
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-foreground">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">
            عدد أفراد الأسرة (العائل والتابعون):
          </label>
          <input
            type="number"
            min="1"
            value={familyCount}
            onChange={(e) => setFamilyCount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">
            إجمالي الدخل المكتسب للأسرة (الراتب الشهري):
          </label>
          <input
            type="number"
            min="0"
            value={earnedIncome}
            onChange={(e) => setEarnedIncome(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">
            الدخل غير المكتسب (دعم حكومي آخر إن وجد):
          </label>
          <input
            type="number"
            min="0"
            value={unearnedIncome}
            onChange={(e) => setUnearnedIncome(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#b89628] text-slate-950 font-bold rounded-lg transition-colors shadow-lg mt-2"
        >
          احسب الاستحقاق التقديري
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border ${result.eligible ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}`}>
          {result.eligible ? (
            <div className="space-y-2">
              <p className="font-semibold text-lg text-emerald-400">مستحق بناءً على البيانات المدخلة 🎉</p>
              <div className="text-sm space-y-1 text-slate-300">
                <p>الدخل المحتسب: <span className="font-bold text-white">{result.calculatedIncome} ريال</span></p>
                <p>الحد المانع للأسرة: <span className="font-bold text-white">{result.maxLimit} ريال</span></p>
                <p className="text-base font-bold text-[#D4AF37] mt-2">
                  مبلغ الدعم التقديري: {result.estimatedSupport} ريال شهرياً
                </p>
              </div>
            </div>
          ) : (
            <p className="font-medium text-rose-300">{result.message}</p>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center leading-relaxed">
        * ملاحظة: هذه الحاسبة تقديرية بناءً على شروط ومعدلات الاستحقاق في منصة الدعم والحماية الاجتماعية.
      </p>
    </div>
  );
}