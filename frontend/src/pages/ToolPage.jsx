import UniversalWidget from '../tools/UniversalWidget';
import GamepadTester from '../tools/GamepadTester';
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToolShell } from '../lib/ui';
import { TOOL_MAP, TOOLS } from '../lib/toolsRegistry';
import DamanCalculator from '../tools/DamanCalculator';
import * as F from '../tools/finance';
import * as I from '../tools/islamic';
import * as H from '../tools/health_edu';
import * as D from '../tools/dev_fun_misc';
import * as AI from '../tools/ai_tools';
import { QRReader } from '../tools/qr_reader';
import RemoveBg from '../tools/RemoveBg';
import TextToSpeech from '../tools/TextToSpeech';
import { ChevronLeft, Home, AlertTriangle } from 'lucide-react';

const MAP = {
  'daman-calculator': DamanCalculator,
  'gamepad-tester': GamepadTester,
  'loan-by-salary': F.LoanBySalary,
  'loan-calculator': F.LoanCalculator,
  'zakat': F.Zakat,
  'inheritance': F.Inheritance,
  'currency': F.CurrencyTool,
  'gold-price': F.GoldPrice,
  'end-of-service': F.EndOfService,
  'net-salary': F.NetSalary,
  'savings': F.Savings,
  'retirement': F.Retirement,
  'rent-vs-buy': F.RentVsBuy,
  'investment': F.Investment,
  'travel-cost': F.TravelCost,
  'wedding-cost': F.WeddingCost,
  'bill-split': F.BillSplit,
  'budget': F.Budget,
  'prayer-times': I.PrayerTimes,
  'hijri-date': I.HijriDate,
  'date-convert': I.DateConvert,
  'tasbih': I.Tasbih,
  'adhkar': I.Adhkar,
  'qibla': I.Qibla,
  'ramadan-countdown': I.RamadanCountdown,
  'asma-alhusna': I.AsmaHusna,
  'bmi': H.BMI,
  'calories': H.Calories,
  'pregnancy': H.Pregnancy,
  'ovulation': H.Ovulation,
  'ideal-weight': H.IdealWeight,
  'body-fat': H.BodyFat,
  'heart-rate': H.HeartRate,
  'water-intake': H.WaterIntake,
  'sleep': H.Sleep,
  'gpa': H.GPA,
  'weighted-avg': H.WeightedAvg,
  'final-grade': H.FinalGrade,
  'multiplication': H.MultiplicationTable,
  'age': H.AgeCalc,
  'percentage': H.PercentageCalc,
  'units': H.UnitsConvert,
  'arabic-numbers': H.ArabicNumbers,
  'number-to-words': H.NumberToWords,
  'time-diff': H.TimeDiff,
  'temperature': H.Temperature,
  'fuel': H.FuelCalc,
  'car-plate': H.CarPlate,
  'car-inspection': H.CarInspection,
  'car-insurance': H.CarInsurance,
  'qr-generator': D.QRGenerator,
  'qr-reader': QRReader,
  'password': D.PasswordGen,
  'json-format': D.JsonFormat,
  'base64': D.Base64Tool,
  'uuid': D.UUIDGen,
  'unix-timestamp': D.UnixTimestamp,
  'color-picker': D.ColorPicker,
  'lorem-ar': D.LoremAr,
  'wheel': D.Wheel,
  'dice': D.Dice,
  'coin-flip': D.CoinFlip,
  'rps': D.RPS,
  'guess-number': D.GuessNumber,
  'random-name': D.RandomName,
  'name-match': D.NameMatch,
  'shuffle-list': D.ShuffleList,
  'whatsapp-no-save': D.WhatsAppNoSave,
  'telegram-link': D.TelegramLink,
  'country-code': D.CountryCode,
  'url-encoder': D.UrlEncoder,
  'image-to-pdf': D.ImageToPDF,
  'image-format': D.ImageFormat,
  'image-compress': D.ImageCompress,
  'merge-images': D.MergeImages,
  'remove-bg': RemoveBg,
  'file-converters-list': D.FileConvertersList,
  'text-to-speech': TextToSpeech,
  'word-count': D.WordCount,
  'text-case': D.TextCase,
  'kb-flip': D.KbFlip,
  'diacritics': D.Diacritics,
  'ai-bio': AI.AiBio,
  'ai-sites': D.AiSites,
  'countdown': D.Countdown,
  'pomodoro': D.Pomodoro,
  'world-clock': D.WorldClock,
  'stopwatch': D.Stopwatch,
  'todo': D.TodoList,
};

const categoryNames = {
  finance: 'مالية',
  islamic: 'إسلامية',
  health_edu: 'الصحة والتعليم',
  health: 'الصحة',
  education: 'التعليم',
  converters: 'التحويلات',
  cars: 'السيارات',
  dev_fun_misc: 'أدوات منوعة',
  ai_tools: 'أدوات الذكاء الاصطناعي',
  files: 'الملفات',
  tools: 'الأدوات العامة',
  utilities: 'الخدمات المساعدة',
  general: 'عام',
  comm :'اتصالات',
  dev :'مطوّرون',
  fun :'ترفيهية',
  text :'نصوص',
  misc :'متنوعة',
};

export default function ToolPage() {
  const { slug } = useParams();
  
  const tool = TOOL_MAP?.[slug] || TOOLS.find(t => t.slug === slug);
  const Component = MAP[slug];

  const formattedTool = tool ? {
    ...tool,
    title: tool.title || tool.name,
    description: tool.description || tool.desc,
  } : null;

  useEffect(() => {
    if (formattedTool?.title) {
      document.title = `${formattedTool.title} - دليل مطر الإلكتروني`;
    } else {
      document.title = 'دليل مطر الإلكتروني';
    }
  }, [formattedTool]);
// التحقق من حالة التعطيل للأداة الحالية
  const isDisabled = (() => {
    try {
      const saved = localStorage.getItem('disabled_tools');
      if (!saved) return false;
      const disabledMap = JSON.parse(saved);
      const currentId = tool?.id || tool?.slug || slug;
      return !!disabledMap[currentId];
    } catch {
      return false;
    }
  })();

  if (isDisabled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mb-4 inline-flex p-4 bg-red-500/10 text-red-500 rounded-full">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">عذراً، هذه الأداة غير متاحة حالياً</h2>
        <p className="text-muted-foreground mb-6 text-sm">تم تعطيل هذه الأداة مؤقتاً من قبل إدارة الموقع.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-semibold rounded-xl hover:opacity-90 transition-all text-sm">
          <Home className="h-4 w-4" />
          <span>العودة إلى الرئيسية</span>
        </Link>
      </div>
    );
  }
  if (!tool) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">الأداة غير موجودة</h2>
        <a href="/" className="text-[#D4AF37] hover:underline">العودة إلى الرئيسية</a>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* مسار التنقل العلوي المنظم */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav aria-label="مسار التنقل" className="flex items-center text-sm text-muted-foreground bg-card/40 p-3 rounded-xl border border-border/50" dir="rtl">
          <ol className="flex items-center space-x-2 space-x-reverse flex-wrap">
            <li className="flex items-center">
              <Link to="/" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 font-medium">
                <Home className="w-4 h-4 ml-1" />
                الرئيسية
              </Link>
            </li>
            {tool.category && (
              <li className="flex items-center">
                <ChevronLeft className="w-4 h-4 mx-2 text-muted-foreground/50 rotate-180" />
                <Link to={`/category/${tool.category}`} className="hover:text-[#D4AF37] transition-colors font-medium">
                  {categoryNames[tool.category] || tool.category}
                </Link>
              </li>
            )}
            <li className="flex items-center">
              <ChevronLeft className="w-4 h-4 mx-2 text-muted-foreground/50 rotate-180" />
              <span className="font-bold text-[#D4AF37]" aria-current="page">
                {formattedTool.title}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* محتوى الأداة */}
      <ToolShell tool={formattedTool}>
        {Component ? (
          <Component />
        ) : (
          <UniversalWidget apiUrl={tool?.apiUrl} slug={slug} />
        )}
      </ToolShell>
    </div>
  );
}
