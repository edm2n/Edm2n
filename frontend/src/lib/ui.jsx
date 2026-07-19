// Shared UI: ToolCard, ToolShell, ResultBox, ShareBar
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES } from './toolsRegistry';

export function ToolCard({ tool, index = 0 }) {
  const Icon = tool.icon;
  const cat = CATEGORIES[tool.category];
  return (
    <Link
      to={`/tool/${tool.slug}`}
      data-testid={`tool-card-${tool.slug}`}
      className="card-lift fade-in-up group block rounded-2xl border border-border bg-card p-5 hover:bg-card"
      style={{ animationDelay: `${(index % 8) * 40}ms` }}
    >
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 rounded-xl p-3 ring-1 ring-border group-hover:ring-[#D4AF37]"
          style={{ background: `${cat?.color}15` }}
        >
          <Icon className="h-6 w-6" style={{ color: cat?.color }} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground group-hover:text-[#D4AF37] transition-colors">
            {tool.name}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {tool.desc}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ToolShell({ tool, children }) {
  const Icon = tool.icon;
  const cat = CATEGORIES[tool.category];
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12">
      <Link
        to="/"
        data-testid="back-to-home"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rotate-180" />
        العودة إلى الرئيسية
      </Link>
      <header className="mb-8 flex items-start gap-4">
        <div className="rounded-2xl p-4 ring-1 ring-border" style={{ background: `${cat?.color}15` }}>
          <Icon className="h-8 w-8" style={{ color: cat?.color }} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-snug">{tool.name}</h1>
          <p className="mt-2 text-muted-foreground">{tool.desc}</p>
        </div>
      </header>
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}

export function ResultBox({ label, value, sub, testid = 'result' }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div
      data-testid={testid}
      className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 bg-gradient-to-l from-[#D4AF37]/5 to-transparent p-5"
    >
      {label && <div className="text-sm text-muted-foreground">{label}</div>}
      <div className="mt-1 text-2xl md:text-3xl font-bold text-foreground break-words">
        {value}
      </div>
      {sub && <div className="mt-2 text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function ShareBar({ text, testidPrefix = 'share' }) {
  const doShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'دليل مطر' });
      } catch (e) {
        // cancelled
      }
    } else {
      copy();
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم نسخ النتيجة');
    } catch (e) {
      toast.error('فشل النسخ');
    }
  };
  const wa = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  const tw = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <button
        data-testid={`${testidPrefix}-copy`}
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm hover:border-[#D4AF37] transition-colors"
      >
        <Copy className="h-4 w-4" /> نسخ
      </button>
      <button
        data-testid={`${testidPrefix}-whatsapp`}
        onClick={wa}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm hover:border-[#D4AF37] transition-colors"
      >
        <MessageCircle className="h-4 w-4" /> واتساب
      </button>
      <button
        data-testid={`${testidPrefix}-twitter`}
        onClick={tw}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm hover:border-[#D4AF37] transition-colors"
      >
        <Share2 className="h-4 w-4" /> تويتر
      </button>
      <button
        data-testid={`${testidPrefix}-native`}
        onClick={doShare}
        className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#CA8A04] transition-colors"
      >
        <Share2 className="h-4 w-4" /> مشاركة
      </button>
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
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

export function Select({ label, testid, children, ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>}
      <select
        data-testid={testid}
        {...rest}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-all focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
      >
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
    <button
      data-testid={testid}
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${styles[variant]} ${rest.className || ''}`}
    >
      {children}
    </button>
  );
}
