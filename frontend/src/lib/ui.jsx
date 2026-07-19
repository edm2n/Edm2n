// Shared UI: ToolCard, ToolShell, ResultBox, ShareBar, SaveAsImage, PWA install per page
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, MessageCircle, Twitter, Facebook, Send, Camera, FileDown, Download, Home as HomeIcon } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CATEGORIES } from './toolsRegistry';

export function ToolCard({ tool, index = 0, badge }) {
  const Icon = tool.icon;
  const cat = CATEGORIES[tool.category];
  return (
    <Link
      to={`/tool/${tool.slug}`}
      data-testid={`tool-card-${tool.slug}`}
      className="card-lift fade-in-up group block rounded-2xl border border-border bg-card p-5 hover:bg-card relative"
      style={{ animationDelay: `${(index % 8) * 40}ms` }}
    >
      {badge && (
        <span className="absolute top-2 start-2 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-xl p-3 ring-1 ring-border group-hover:ring-[#D4AF37]" style={{ background: `${cat?.color}15` }}>
          <Icon className="h-6 w-6" style={{ color: cat?.color }} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground group-hover:text-[#D4AF37] transition-colors">
            {tool.name}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{tool.desc}</p>
        </div>
      </div>
    </Link>
  );
}

// Track tool usage in localStorage for "most used" section
export function trackToolUsage(slug) {
  try {
    const stats = JSON.parse(localStorage.getItem('tool_usage') || '{}');
    stats[slug] = (stats[slug] || 0) + 1;
    localStorage.setItem('tool_usage', JSON.stringify(stats));
  } catch {}
}

export function getMostUsedSlugs(limit = 8) {
  try {
    const stats = JSON.parse(localStorage.getItem('tool_usage') || '{}');
    return Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([s]) => s);
  } catch { return []; }
}

export function ToolShell({ tool, children }) {
  const Icon = tool.icon;
  const cat = CATEGORIES[tool.category];
  const shellRef = useRef(null);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => { trackToolUsage(tool.slug); }, [tool.slug]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${tool.name} - دليل مطر`;

  const saveAsImage = async () => {
    if (!shellRef.current) return;
    try {
      const canvas = await html2canvas(shellRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${tool.slug}.png`;
        a.click();
        toast.success('تم حفظ الصورة');
      });
    } catch (e) {
      toast.error('فشل حفظ الصورة');
    }
  };

  const saveAsPDF = async () => {
    if (!shellRef.current) return;
    try {
      const canvas = await html2canvas(shellRef.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
      const img = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'JPEG', 0, 0, w, h);
      pdf.save(`${tool.slug}.pdf`);
      toast.success('تم حفظ PDF');
    } catch (e) {
      toast.error('فشل حفظ PDF');
    }
  };

  const installPwa = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      setInstallPrompt(null);
    } else {
      toast.info('استخدم قائمة المتصفح: "أضف إلى الشاشة الرئيسية" لتثبيت التطبيق');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12">
      <Link to="/" data-testid="back-to-home" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors">
        <ArrowLeft className="h-4 w-4 rotate-180" />
        العودة إلى الرئيسية
      </Link>

      <header className="mb-8 flex items-start gap-4 flex-wrap">
        <div className="rounded-2xl p-4 ring-1 ring-border" style={{ background: `${cat?.color}15` }}>
          <Icon className="h-8 w-8" style={{ color: cat?.color }} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl md:text-3xl font-bold leading-snug">{tool.name}</h1>
          <p className="mt-2 text-muted-foreground">{tool.desc}</p>
        </div>
        <button
          data-testid="pwa-install-page"
          onClick={installPwa}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:border-[#D4AF37] transition-colors"
          title="أضف إلى الشاشة الرئيسية"
        >
          <HomeIcon className="h-4 w-4 text-[#D4AF37]" />
          <span className="hidden sm:inline">للشاشة الرئيسية</span>
        </button>
      </header>

      <div ref={shellRef} data-testid="tool-shell" className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
        {children}
      </div>

      {/* Universal Share & Save Bar */}
      <ShareBar text={shareText} url={shareUrl} onSaveImage={saveAsImage} onSavePdf={saveAsPDF} onAddToHome={installPwa} />
    </div>
  );
}

export function ResultBox({ label, value, sub, testid = 'result' }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div data-testid={testid} className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 bg-gradient-to-l from-[#D4AF37]/5 to-transparent p-5">
      {label && <div className="text-sm text-muted-foreground">{label}</div>}
      <div className="mt-1 text-2xl md:text-3xl font-bold text-foreground break-words">{value}</div>
      {sub && <div className="mt-2 text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function ShareBar({ text = '', url = '', onSaveImage, onSavePdf, onAddToHome, testidPrefix = 'share' }) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullText = `${text}\n${shareUrl}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(fullText); toast.success('تم النسخ'); }
    catch { toast.error('فشل النسخ'); }
  };
  const doShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: text, url: shareUrl, title: 'دليل مطر' }); } catch {}
    } else { copy(); }
  };

  const shares = [
    { key: 'wa', name: 'واتساب', color: '#25D366', icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(fullText)}` },
    { key: 'tw', name: 'تويتر', color: '#000000', icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}` },
    { key: 'tg', name: 'تليجرام', color: '#0088cc', icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}` },
    { key: 'fb', name: 'فيسبوك', color: '#1877F2', icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { key: 'sc', name: 'سناب شات', color: '#FFFC00', icon: Camera,
      url: `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <div className="mt-6 space-y-3">
      <div className="text-sm text-muted-foreground">شارك هذه الأداة:</div>
      <div className="flex flex-wrap gap-2">
        {shares.map((s) => {
          const Icon = s.icon;
          return (
            <a
              key={s.key}
              data-testid={`${testidPrefix}-${s.key}`}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:border-[#D4AF37] transition-colors"
              style={{ color: s.color === '#FFFC00' ? '#CA8A04' : s.color }}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.name}</span>
            </a>
          );
        })}
        <button data-testid={`${testidPrefix}-copy`} onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:border-[#D4AF37] transition-colors">
          <Copy className="h-4 w-4" /> <span className="hidden sm:inline">نسخ</span>
        </button>
        {onSaveImage && (
          <button data-testid={`${testidPrefix}-image`} onClick={onSaveImage} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:border-[#D4AF37] transition-colors">
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">صورة</span>
          </button>
        )}
        {onSavePdf && (
          <button data-testid={`${testidPrefix}-pdf`} onClick={onSavePdf} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:border-[#D4AF37] transition-colors">
            <FileDown className="h-4 w-4" /> <span className="hidden sm:inline">PDF</span>
          </button>
        )}
        {onAddToHome && (
          <button
            data-testid={`${testidPrefix}-add-home`}
            onClick={onAddToHome}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-3 py-2 text-sm text-[#CA8A04] hover:bg-[#D4AF37]/20 transition-colors"
          >
            <HomeIcon className="h-4 w-4" /> <span>أضف للشاشة</span>
          </button>
        )}
        <button data-testid={`${testidPrefix}-native`} onClick={doShare} className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#CA8A04] transition-colors">
          <Share2 className="h-4 w-4" /> مشاركة
        </button>
      </div>
    </div>
  );
}

export function Input({ label, testid, unit, ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>}
      <div className="relative">
        <input
          data-testid={testid}
          {...rest}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-all focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </label>
  );
}

export function Select({ label, testid, children, ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>}
      <select data-testid={testid} {...rest} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-all focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30">
        {children}
      </select>
    </label>
  );
}

export function Button({ children, variant = 'gold', testid, ...rest }) {
  const styles = {
    gold: 'bg-[#D4AF37] hover:bg-[#CA8A04] text-black',
    primary: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    ghost: 'border border-border bg-background hover:border-[#D4AF37] text-foreground',
  };
  return (
    <button data-testid={testid} {...rest} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${styles[variant]} ${rest.className || ''}`}>
      {children}
    </button>
  );
}
