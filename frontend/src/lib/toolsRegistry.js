// Central registry of all tools with metadata
// Categories: finance, islamic, health, education, converters, dev, fun, cars, comm, files, text, misc
import DamanCalculator from '../tools/DamanCalculator';
import {
  Wallet, Calendar, Percent, CalendarDays, Moon, Bot, MessageCircle, FileSymlink,
  Scale, Coins, DollarSign, Baby, Heart, Activity, GraduationCap, Ruler,
  Type, ScrollText, Sunrise, Compass, HandHelping, Timer, Dice5, QrCode,
  KeyRound, Braces, Binary, Hash, Palette, Users, PiggyBank, Building2,
  Fuel, Car, Wrench, Zap, Droplet, Utensils, HeartPulse, CalendarClock,
  Book, Sparkles, Copy, RotateCcw, FileImage, FileText, ImageDown, Layers,
  Globe, MapPin, Bell, PhoneCall, Repeat, Divide, Clock, Hourglass,
  Trophy, Gamepad2, Shuffle, Target, ClipboardList, Focus, Lightbulb, Info,
  Mail, HelpCircle, ShieldCheck, FileCheck2, Link2, Newspaper, Cake, TrendingUp,
  Landmark, Award, BookOpen, Calculator, Waves, Feather, GaugeCircle, Package,
  Beaker, Boxes, ScanLine, UserSquare
} from 'lucide-react';

export const CATEGORIES = {
  finance: { id: 'finance', name: 'مالية', icon: Wallet, color: '#047857' },
  islamic: { id: 'islamic', name: 'إسلامية', icon: Moon, color: '#059669' },
  health: { id: 'health', name: 'صحية', icon: HeartPulse, color: '#D4AF37' },
  education: { id: 'education', name: 'تعليمية', icon: GraduationCap, color: '#065F46' },
  converters: { id: 'converters', name: 'تحويلات', icon: Repeat, color: '#0D9488' },
  dev: { id: 'dev', name: 'مطوّرون', icon: Braces, color: '#CA8A04' },
  fun: { id: 'fun', name: 'ترفيهية', icon: Gamepad2, color: '#D4AF37' },
  cars: { id: 'cars', name: 'سيارات', icon: Car, color: '#047857' },
  comm: { id: 'comm', name: 'اتصالات', icon: MessageCircle, color: '#059669' },
  files: { id: 'files', name: 'ملفات', icon: FileImage, color: '#065F46' },
  text: { id: 'text', name: 'نصوص', icon: Type, color: '#0D9488' },
  misc: { id: 'misc', name: 'متنوعة', icon: Sparkles, color: '#D4AF37' },
};

// slug, name, description, category, icon
export const TOOLS = [
  // Finance
  { slug: "daman-calculator", name: "حاسبة الضمان المطور", desc: "احسب استحقاقك التقديري في الضمان الاجتماعي المطور بناء على الدخل وعدد أفراد الأسرة", category: 'finance', icon: 'Calculator' },
  { slug: 'loan-by-salary', name: 'كم تمويل يطلع لي؟', desc: 'احسب أقصى تمويل بحسب راتبك ونسبة الاستقطاع', category: 'finance', icon: Wallet },
  { slug: 'loan-calculator', name: 'حاسبة القسط الشهري', desc: 'قسط التمويل الشهري + إجمالي الفوائد', category: 'finance', icon: Landmark },
  { slug: 'zakat', name: 'حاسبة الزكاة', desc: 'زكاة المال والذهب والفضة (2.5%)', category: 'finance', icon: HandHelping },
  { slug: 'inheritance', name: 'حاسبة الميراث الشرعي', desc: 'تقسيم التركة حسب الشريعة', category: 'finance', icon: Users },
  { slug: 'currency', name: 'تحويل العملات', desc: 'ريال ↔ دولار ↔ يورو والعملات العالمية', category: 'finance', icon: DollarSign },
  { slug: 'gold-price', name: 'أسعار الذهب العالمي', desc: 'سعر الأونصة والجرام لعيار 24/22/21/18', category: 'finance', icon: Coins },
  { slug: 'end-of-service', name: 'مكافأة نهاية الخدمة', desc: 'حسب نظام العمل السعودي', category: 'finance', icon: Award },
  { slug: 'net-salary', name: 'الراتب الصافي', desc: 'الراتب بعد التأمينات الاجتماعية', category: 'finance', icon: Wallet },
  { slug: 'savings', name: 'حاسبة الادخار', desc: 'كم توفر بعد X سنة بفائدة مركبة', category: 'finance', icon: PiggyBank },
  { slug: 'retirement', name: 'حاسبة التقاعد', desc: 'مبلغ التقاعد المتوقع من الراتب والمساهمات', category: 'finance', icon: Building2 },
  { slug: 'rent-vs-buy', name: 'إيجار أم شراء؟', desc: 'أيهما أوفر: استئجار البيت أم شراؤه', category: 'finance', icon: Building2 },
  { slug: 'investment', name: 'حاسبة الاستثمار', desc: 'نمو المال بفائدة مركبة', category: 'finance', icon: TrendingUp },
  { slug: 'travel-cost', name: 'تكلفة السفر', desc: 'تذاكر + فندق + مواصلات', category: 'finance', icon: Globe },
  { slug: 'wedding-cost', name: 'تكلفة الزواج', desc: 'مهر + قاعة + عشاء + سفر', category: 'finance', icon: Heart },
  { slug: 'bill-split', name: 'قسمة الفاتورة', desc: 'قسّم الفاتورة بين الأصدقاء بالبقشيش', category: 'finance', icon: Divide },
  { slug: 'budget', name: 'ميزانية شهرية', desc: 'دخل مقابل مصاريف مصنّفة', category: 'finance', icon: ClipboardList },

  // Islamic
  { slug: 'prayer-times', name: 'مواقيت الصلاة', desc: 'أوقات الصلاة حسب مدينتك (Aladhan)', category: 'islamic', icon: Sunrise },
  { slug: 'hijri-date', name: 'التاريخ الهجري', desc: 'اليوم الهجري + تحويل ميلادي/هجري', category: 'islamic', icon: Moon },
  { slug: 'date-convert', name: 'تحويل التاريخ', desc: 'ميلادي ↔ هجري بدقة', category: 'islamic', icon: CalendarDays },
  { slug: 'tasbih', name: 'مسبحة إلكترونية', desc: 'عدّاد التسبيح مع أهداف قابلة للتخصيص', category: 'islamic', icon: Feather },
  { slug: 'adhkar', name: 'أذكار الصباح والمساء', desc: 'أذكار موثّقة مع عدّاد التقدّم', category: 'islamic', icon: BookOpen },
  { slug: 'qibla', name: 'القبلة', desc: 'اتجاه القبلة من موقعك بالدرجات', category: 'islamic', icon: Compass },
  { slug: 'ramadan-countdown', name: 'العدّ التنازلي لرمضان', desc: 'كم باقي على رمضان', category: 'islamic', icon: Moon },
  { slug: 'asma-alhusna', name: 'الأسماء الحسنى', desc: 'أسماء الله الحسنى مع البحث', category: 'islamic', icon: Book },

  // Health
  { slug: 'bmi', name: 'حاسبة BMI', desc: 'مؤشر كتلة الجسم + التصنيف', category: 'health', icon: Scale },
  { slug: 'calories', name: 'السعرات اليومية', desc: 'BMR + TDEE حسب النشاط', category: 'health', icon: Utensils },
  { slug: 'pregnancy', name: 'حاسبة الحمل', desc: 'أسبوع الحمل + تاريخ الولادة المتوقع', category: 'health', icon: Baby },
  { slug: 'ovulation', name: 'حاسبة التبويض', desc: 'أيام التبويض والدورة', category: 'health', icon: Heart },
  { slug: 'ideal-weight', name: 'الوزن المثالي', desc: 'الوزن المثالي حسب الطول', category: 'health', icon: GaugeCircle },
  { slug: 'body-fat', name: 'نسبة الدهون', desc: 'نسبة الدهون في الجسم', category: 'health', icon: Activity },
  { slug: 'heart-rate', name: 'معدل ضربات القلب', desc: 'المنطقة المستهدفة أثناء الرياضة', category: 'health', icon: HeartPulse },
  { slug: 'water-intake', name: 'حاجتك من الماء', desc: 'الماء اليومي حسب الوزن والنشاط', category: 'health', icon: Droplet },
  { slug: 'sleep', name: 'حاسبة النوم', desc: 'أوقات النوم لدورات كاملة (90د)', category: 'health', icon: Moon },

  // Education
  { slug: 'gpa', name: 'حاسبة GPA', desc: 'المعدل التراكمي (4.0 و 5.0)', category: 'education', icon: GraduationCap },
  { slug: 'weighted-avg', name: 'النسبة الموزونة', desc: 'ثانوية + قدرات + تحصيلي', category: 'education', icon: Percent },
  { slug: 'final-grade', name: 'الدرجة المطلوبة', desc: 'كم أحتاج في النهائي لأحصل على درجة معينة', category: 'education', icon: Trophy },
  { slug: 'multiplication', name: 'جدول الضرب', desc: 'جدول ضرب تفاعلي 1×1 حتى 12×12', category: 'education', icon: Calculator },

  // Converters
  { slug: 'age', name: 'حاسبة العمر', desc: 'عمرك بالسنوات والأشهر والأيام والساعات', category: 'converters', icon: Cake },
  { slug: 'percentage', name: 'حاسبة النسبة المئوية', desc: 'X% من Y، النسبة بين رقمين، ...', category: 'converters', icon: Percent },
  { slug: 'units', name: 'محول الوحدات', desc: 'أطوال، أوزان، حرارة، سرعة', category: 'converters', icon: Ruler },
  { slug: 'arabic-numbers', name: 'أرقام عربي/إنجليزي', desc: '١٢٣ ↔ 123', category: 'converters', icon: Hash },
  { slug: 'number-to-words', name: 'تفقيط الأرقام', desc: '١٢٣ → "مئة وثلاثة وعشرون"', category: 'converters', icon: ScrollText },
  { slug: 'time-diff', name: 'الفرق بين وقتين', desc: 'فرق زمني، إضافة/طرح وقت', category: 'converters', icon: Clock },
  { slug: 'temperature', name: 'محول الحرارة', desc: 'مئوية ↔ فهرنهايت ↔ كلفن', category: 'converters', icon: Waves },

  // Dev Tools

  { slug: 'qr-generator', name: 'مولّد QR Code', desc: 'نص، رابط، واي فاي، اتصال', category: 'dev', icon: QrCode },
  { slug: 'qr-reader', name: 'قارئ QR Code', desc: 'امسح رمز QR بكاميرا الجوّال مباشرة', category: 'dev', icon: ScanLine },
  { slug: 'password', name: 'مولّد كلمات مرور', desc: 'قوية وعشوائية مع خيارات', category: 'dev', icon: KeyRound },
  { slug: 'json-format', name: 'منسّق JSON', desc: 'ترتيب وفحص صيغة JSON', category: 'dev', icon: Braces },
  { slug: 'base64', name: 'محوّل Base64', desc: 'تشفير وفك Base64', category: 'dev', icon: Binary },
  { slug: 'uuid', name: 'مولّد UUID', desc: 'معرّفات فريدة UUID v4', category: 'dev', icon: Hash },
  { slug: 'unix-timestamp', name: 'Unix Timestamp', desc: 'رقم ↔ تاريخ قابل للقراءة', category: 'dev', icon: CalendarClock },
  { slug: 'color-picker', name: 'محول الألوان', desc: 'HEX ↔ RGB ↔ HSL', category: 'dev', icon: Palette },
  { slug: 'lorem-ar', name: 'نص لوريم عربي', desc: 'نص عربي وهمي للتصميم', category: 'dev', icon: FileText },

  // Fun
  { slug: 'wheel', name: 'دولاب الحظ', desc: 'اختر عشوائياً من قائمة', category: 'fun', icon: Target },
  { slug: 'dice', name: 'رمي الزهر', desc: 'نرد إلكتروني 1-6', category: 'fun', icon: Dice5 },
  { slug: 'coin-flip', name: 'قذف العملة', desc: 'صورة أو كتابة', category: 'fun', icon: Coins },
  { slug: 'rps', name: 'حجر ورقة مقص', desc: 'العب ضد الكمبيوتر', category: 'fun', icon: Gamepad2 },
  { slug: 'guess-number', name: 'تخمين الرقم', desc: 'خمّن الرقم بين 1 و 100', category: 'fun', icon: Target },
  { slug: 'random-name', name: 'اسم عشوائي', desc: 'مولّد أسماء عربية عشوائية', category: 'fun', icon: Sparkles },
  { slug: 'name-match', name: 'توافق الأسماء', desc: 'لعبة تقليدية لحساب النسبة', category: 'fun', icon: Heart },
  { slug: 'shuffle-list', name: 'قرعة عشوائية', desc: 'خلط قائمة بترتيب عشوائي', category: 'fun', icon: Shuffle },

  // Cars
  { slug: 'fuel', name: 'استهلاك السيارة', desc: 'لتر/100كم + التكلفة', category: 'cars', icon: Fuel },
  { slug: 'car-plate', name: 'رسوم لوحة السيارة', desc: 'تجديد لوحة سنوي (السعودية)', category: 'cars', icon: Car },
  { slug: 'car-inspection', name: 'رسوم فحص السيارة', desc: 'رسوم الفحص الدوري', category: 'cars', icon: Wrench },
  { slug: 'car-insurance', name: 'تأمين السيارة', desc: 'تقدير سعر التأمين السنوي', category: 'cars', icon: ShieldCheck },

  // Communication
  { slug: 'whatsapp-no-save', name: 'واتساب بدون حفظ الرقم', desc: 'راسل رقم واتساب مباشرة', category: 'comm', icon: MessageCircle },
  { slug: 'telegram-link', name: 'رابط تليجرام', desc: 'رابط تليجرام بدون حفظ الرقم', category: 'comm', icon: MessageCircle },
  { slug: 'country-code', name: 'رمز الدولة', desc: 'رمز الاتصال الدولي (+966)', category: 'comm', icon: Globe },
  { slug: 'url-encoder', name: 'ترميز الروابط', desc: 'URL encode / decode', category: 'comm', icon: Link2 },

  // Files
  { slug: 'remove-bg', name: 'إزالة خلفية الصور', desc: 'عزل خلفية الصور بدقة عالية وبسرعة بالذكاء الاصطناعي', category: 'files', icon: FileImage, isNew: true },
  { slug: 'image-to-pdf', name: 'صور إلى PDF', desc: 'دمج عدة صور في ملف PDF', category: 'files', icon: FileText },
  { slug: 'image-format', name: 'تحويل صيغ الصور', desc: 'PNG ↔ JPG ↔ WebP', category: 'files', icon: FileImage },
  { slug: 'image-compress', name: 'ضغط الصور', desc: 'تقليل حجم الصور دون فقد جودة كبير', category: 'files', icon: ImageDown },
  { slug: 'merge-images', name: 'دمج الصور', desc: 'دمج صور في صورة واحدة عمودياً/أفقياً', category: 'files', icon: Layers },
  { slug: 'file-converters-list', name: 'محولات صيغ الملفات', desc: 'روابط سريعة لمحولات PDF/Word/Excel', category: 'files', icon: FileSymlink },

  // Text
  { slug: 'text-to-speech', name: 'تحويل النص إلى كلام', desc: 'تحويل النصوص إلى صوت مسموع مع التحكم بالسرعة ونوع الصوت', category: 'text', icon: Feather },
  { slug: 'word-count', name: 'عدّاد الكلمات', desc: 'كلمات، حروف، أسطر، وقت القراءة', category: 'text', icon: FileText },
  { slug: 'text-case', name: 'تحويل حالة النص', desc: 'كبير/صغير/عكس/إزالة تشكيل', category: 'text', icon: Type },
  { slug: 'kb-flip', name: 'تحويل لوحة المفاتيح', desc: '"hbf khf" → "لا حول"', category: 'text', icon: Repeat },
  { slug: 'diacritics', name: 'إضافة/إزالة التشكيل', desc: 'إزالة الحركات أو إضافتها بالذكاء الاصطناعي', category: 'text', icon: Feather },

  // Misc
  { slug: 'ai-bio', name: 'مولّد البايو بالذكاء الاصطناعي', desc: 'بايو عربي احترافي في ثوانٍ', category: 'misc', icon: UserSquare },
  { slug: 'ai-sites', name: 'أهم مواقع الذكاء الاصطناعي', desc: 'دليل أفضل أدوات AI', category: 'misc', icon: Bot },
  { slug: 'countdown', name: 'عدّاد تنازلي', desc: 'عدّاد لتاريخ معيّن', category: 'misc', icon: Hourglass },
  { slug: 'pomodoro', name: 'مؤقّت بومودورو', desc: '25 دقيقة تركيز / 5 استراحة', category: 'misc', icon: Focus },
  { slug: 'world-clock', name: 'الساعة العالمية', desc: 'أوقات عدة مدن معاً', category: 'misc', icon: Globe },
  { slug: 'stopwatch', name: 'ساعة إيقاف', desc: 'Stopwatch مع Laps', category: 'misc', icon: Timer },
  { slug: 'todo', name: 'قائمة المهام', desc: 'مهام اليوم مع الأولوية', category: 'misc', icon: ClipboardList },
  { slug: 'gamepad-tester', name: 'فحص يد التحكم', desc: 'فحص استجابة أزرار يد التحكم وعصا الأنالوج بشكل حي ومباشر', category: 'fun', icon: Gamepad2 },
];

export const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export function searchTools(query) {
  if (!query) return TOOLS;
  const q = query.trim().toLowerCase();
  return TOOLS.filter(
    (t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.slug.includes(q)
  );
}
