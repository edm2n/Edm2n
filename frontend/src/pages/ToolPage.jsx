import React from 'react';
import { useParams } from 'react-router-dom';
import { ToolShell } from '../lib/ui';
import { TOOL_MAP } from '../lib/toolsRegistry';

import * as F from '../tools/finance';
import * as I from '../tools/islamic';
import * as H from '../tools/health_edu';
import * as D from '../tools/dev_fun_misc';
import * as AI from '../tools/ai_tools';
import { QRReader } from '../tools/qr_reader';

const MAP = {
  // finance
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
  // islamic
  'prayer-times': I.PrayerTimes,
  'hijri-date': I.HijriDate,
  'date-convert': I.DateConvert,
  'tasbih': I.Tasbih,
  'adhkar': I.Adhkar,
  'qibla': I.Qibla,
  'ramadan-countdown': I.RamadanCountdown,
  'asma-alhusna': I.AsmaHusna,
  // health
  'bmi': H.BMI,
  'calories': H.Calories,
  'pregnancy': H.Pregnancy,
  'ovulation': H.Ovulation,
  'ideal-weight': H.IdealWeight,
  'body-fat': H.BodyFat,
  'heart-rate': H.HeartRate,
  'water-intake': H.WaterIntake,
  'sleep': H.Sleep,
  // education
  'gpa': H.GPA,
  'weighted-avg': H.WeightedAvg,
  'final-grade': H.FinalGrade,
  'multiplication': H.MultiplicationTable,
  // converters
  'age': H.AgeCalc,
  'percentage': H.PercentageCalc,
  'units': H.UnitsConvert,
  'arabic-numbers': H.ArabicNumbers,
  'number-to-words': H.NumberToWords,
  'time-diff': H.TimeDiff,
  'temperature': H.Temperature,
  // cars
  'fuel': H.FuelCalc,
  'car-plate': H.CarPlate,
  'car-inspection': H.CarInspection,
  'car-insurance': H.CarInsurance,
  // dev
  'qr-generator': D.QRGenerator,
  'qr-reader': QRReader,
  'password': D.PasswordGen,
  'json-format': D.JsonFormat,
  'base64': D.Base64Tool,
  'uuid': D.UUIDGen,
  'unix-timestamp': D.UnixTimestamp,
  'color-picker': D.ColorPicker,
  'lorem-ar': D.LoremAr,
  // fun
  'wheel': D.Wheel,
  'dice': D.Dice,
  'coin-flip': D.CoinFlip,
  'rps': D.RPS,
  'guess-number': D.GuessNumber,
  'random-name': D.RandomName,
  'name-match': D.NameMatch,
  'shuffle-list': D.ShuffleList,
  // comm
  'whatsapp-no-save': D.WhatsAppNoSave,
  'telegram-link': D.TelegramLink,
  'country-code': D.CountryCode,
  'url-encoder': D.UrlEncoder,
  // files
  'image-to-pdf': D.ImageToPDF,
  'image-format': D.ImageFormat,
  'image-compress': D.ImageCompress,
  'merge-images': D.MergeImages,
  'file-converters-list': D.FileConvertersList,
  // text
  'word-count': D.WordCount,
  'text-case': D.TextCase,
  'kb-flip': D.KbFlip,
  'diacritics': D.Diacritics,
  // misc
  'ai-bio': AI.AiBio,
  'ai-sites': D.AiSites,
  'countdown': D.Countdown,
  'pomodoro': D.Pomodoro,
  'world-clock': D.WorldClock,
  'stopwatch': D.Stopwatch,
  'todo': D.TodoList,
};

export default function ToolPage() {
  const { slug } = useParams();
  const tool = TOOL_MAP[slug];
  const Component = MAP[slug];
  if (!tool || !Component) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">الأداة غير موجودة</h2>
        <a href="/" className="text-[#D4AF37] hover:underline">العودة إلى الرئيسية</a>
      </div>
    );
  }
  return (
    <ToolShell tool={tool}>
      <Component />
    </ToolShell>
  );
}
