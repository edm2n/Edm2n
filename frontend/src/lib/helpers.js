// Arabic number-to-words tafqit + helpers
export const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);
}
export function toEnglishDigits(s) {
  return String(s)
    .replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d))
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
}

// Simple Arabic tafqit for integers up to trillions
const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const TEENS = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const HUNDREDS = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];

function under1000(n) {
  if (n === 0) return '';
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? TENS[t] : `${ONES[o]} و${TENS[t]}`;
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return rest === 0 ? HUNDREDS[h] : `${HUNDREDS[h]} و${under1000(rest)}`;
}

export function tafqit(num) {
  const n = Math.floor(Math.abs(Number(num)));
  if (isNaN(n)) return '';
  if (n === 0) return 'صفر';
  const groups = ['', 'ألف', 'مليون', 'مليار', 'ترليون'];
  const groupsPlural = ['', 'آلاف', 'ملايين', 'مليارات', 'ترليونات'];
  const parts = [];
  let g = 0;
  let x = n;
  while (x > 0) {
    const chunk = x % 1000;
    x = Math.floor(x / 1000);
    if (chunk > 0) {
      let label = '';
      if (g === 0) label = under1000(chunk);
      else if (chunk === 1) label = groups[g];
      else if (chunk === 2) label = groups[g] === 'ألف' ? 'ألفان' : `${groups[g]}ان`;
      else if (chunk >= 3 && chunk <= 10) label = `${under1000(chunk)} ${groupsPlural[g]}`;
      else label = `${under1000(chunk)} ${groups[g]}`;
      parts.unshift(label);
    }
    g++;
  }
  const neg = Number(num) < 0 ? 'سالب ' : '';
  return neg + parts.join(' و');
}

// Arabic keyboard flip: EN row -> AR row and vice versa
const EN_KEYS = "`qwertyuiop[]asdfghjkl;'zxcvbnm,./~QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?";
const AR_KEYS = "ذضصثقفغعهخحجدشسيبلاتنمكطئءؤرلاىةوزظّ}]َُِإ~ٍِلآبيسشً][ٌإ`ذض";
// A safe mapping (subset)
const AR_LAYOUT = {
  'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح',
  '[': 'ج', ']': 'د',
  'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك', "'": 'ط',
  'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة', ',': 'و', '.': 'ز', '/': 'ظ',
};
const EN_LAYOUT = Object.fromEntries(Object.entries(AR_LAYOUT).map(([e, a]) => [a, e]));

export function keyboardFlip(text, direction) {
  if (direction === 'ar') {
    return text.split('').map((c) => AR_LAYOUT[c.toLowerCase()] || c).join('');
  }
  return text.split('').map((c) => EN_LAYOUT[c] || c).join('');
}

// Currency numeric parse safe
export function num(v) {
  const n = Number(toEnglishDigits(String(v).replace(/,/g, '')));
  return isNaN(n) ? 0 : n;
}

export function money(n, currency = 'SAR') {
  try {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}
