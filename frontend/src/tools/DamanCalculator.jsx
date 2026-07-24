import React, { useState, useCallback } from 'react';
import { Users, Wallet, TrendingUp, CheckCircle2, Zap, Utensils, ShieldCheck } from 'lucide-react';

export default function DamanCalculator() {
  const [familyCount, setFamilyCount] = useState(0); 
  const [earnedIncome, setEarnedIncome] = useState(0); 
  const [unearnedIncome, setUnearnedIncome] = useState(0); 
  const [result, setResult] = useState(null);

  const handleCalculate = useCallback(() => {
    const count = Number(familyCount) || 1;
    const baseLimit = 1320 + ((count - 1) * 660);
    const adjustedEarned = Number(earnedIncome) * 0.5;
    const totalUnearned = Number(unearnedIncome);
    const totalCalculatedIncome = adjustedEarned + totalUnearned;

    if (totalCalculatedIncome >= baseLimit) {
      setResult({
        eligible: false,
        calculatedIncome: totalCalculatedIncome,
        maxLimit: baseLimit,
        message: "عذراً، إجمالي الدخل المحتسب يتجاوز الحد المانع للاستحقاق."
      });
    } else {
      const baseMonthlySupport = baseLimit - totalCalculatedIncome;
      setResult({
        eligible: true,
        calculatedIncome: totalCalculatedIncome,
        maxLimit: baseLimit,
        baseMonthlySupport: Math.round(baseMonthlySupport),
        foodSupport: 756, 
        electricitySupport: 334, 
        estimatedSupport: Math.round(baseMonthlySupport + 756 + 334)
      });
    }
  }, [familyCount, earnedIncome, unearnedIncome]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-2xl bg-card border border-border shadow-xl text-card-foreground font-sans transition-colors duration-300" dir="rtl">
      
      {/* رأس الصفحة الداخلي مع العنوان وأيقونة درع الحماية المناسبة */}
      <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">حاسبة الضمان المطور</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            احسب استحقاقك التقديري في الضمان الاجتماعي المطور بناء على الدخل وعدد أفراد الأسرة
          </p>
        </div>
        
        <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-primary shadow-sm shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-5">
        {/* حقل أفراد الأسرة */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="w-4 h-4 text-primary" />
            إجمالي أفراد الأسرة (العائل والتابعون):
          </label>
          <input
            type="number"
            min="1"
            value={familyCount}
            onChange={(e) => setFamilyCount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="مثال: 9"
          />
          <p className="text-xs text-muted-foreground">العائل (1320 ريال) + التابعون (660 ريال لكل تابع).</p>
        </div>

        {/* حقل الدخل المكتسب */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wallet className="w-4 h-4 text-primary" />
            الدخل المكتسب (الرواتب والأعمال):
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={earnedIncome}
              onChange={(e) => setEarnedIncome(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ps-16"
              placeholder="0"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
              ريال
            </span>
          </div>
          <p className="text-xs text-muted-foreground">يُخصم منه 50% طبقاً للائحة.</p>
        </div>

        {/* حقل الدخل غير المكتسب */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            الدخل غير المكتسب (الدعم الحكومي / غير الحكومي):
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={unearnedIncome}
              onChange={(e) => setUnearnedIncome(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ps-16"
              placeholder="2088"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
              ريال
            </span>
          </div>
          <p className="text-xs text-muted-foreground">يُحسب كاملاً ولا يخصم منه شيء.</p>
        </div>

        {/* زر الحساب */}
        <button
          type="button"
          onClick={handleCalculate}
          className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md cursor-pointer mt-4"
        >
          احسب الاستحقاق الرسمي الآن
        </button>
      </div>

      {/* قسم النتائج */}
      {result && (
        <div className="mt-6 p-5 rounded-2xl border bg-muted/40 border-border text-foreground transition-all">
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-foreground">تفاصيل مبالغ الدعم المستحق</h3>
                <p className="text-xs text-muted-foreground">الحد المانع الإجمالي للأسرة: {result.maxLimit} ريال | الدخل المحتسب: {result.calculatedIncome} ريال</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-card p-3.5 rounded-xl border border-border text-center shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">مبلغ الدعم الشهري</p>
                <p className="text-base font-bold text-foreground">{result.baseMonthlySupport} <span className="text-xs font-normal text-primary">ريال</span></p>
              </div>
              <div className="bg-card p-3.5 rounded-xl border border-border text-center shadow-sm">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Utensils className="w-3.5 h-3.5 text-primary" />
                  <span>مبلغ دعم الغذاء</span>
                </div>
                <p className="text-base font-bold text-foreground">{result.foodSupport} <span className="text-xs font-normal text-primary">ريال</span></p>
              </div>
              <div className="bg-card p-3.5 rounded-xl border border-border text-center shadow-sm">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span>مبلغ دعم الكهرباء</span>
                </div>
                <p className="text-base font-bold text-foreground">{result.electricitySupport} <span className="text-xs font-normal text-primary">ريال</span></p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-between shadow-md">
              <div>
                <p className="text-xs font-medium opacity-90">مجموع الدعم الكلي</p>
                <p className="text-xs opacity-75">الأساسي + الغذاء + الكهرباء</p>
              </div>
              <p className="text-2xl font-black">{result.estimatedSupport} <span className="text-sm font-normal opacity-90">ريال</span></p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
        * النتائج الظاهرة هي نتائج تقديرية بناءً على معادلة منصة الدعم والحماية الاجتماعية الرسمية.
      </p>
    </div>
  );
}