import React, { useState } from 'react';
import { TOOLS, CATEGORIES } from '../lib/toolsRegistry';
import { ToolCard } from '../lib/ui';
import { Search, Sparkles, ArrowLeft } from 'lucide-react';

export default function Home({ onOpenSearch }) {
  const [activeCat, setActiveCat] = useState('all');
  const filtered = activeCat === 'all' ? TOOLS : TOOLS.filter((t) => t.category === activeCat);

  return (
    <>
      {/* Hero */}
      <section className="relative hero-glow overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#D4AF37] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            {TOOLS.length}+ أداة عربية مجانية في مكان واحد
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">
            دليل <span className="text-[#D4AF37]">مطر</span> الإلكتروني
            <br />
            <span className="text-muted-foreground text-2xl md:text-3xl lg:text-4xl font-normal">
              كل الحاسبات والأدوات في متناول يدك
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            تمويل، زكاة، ميراث، مواقيت الصلاة، BMI، تحويل عملات، QR، أدوات مطوّرين، وأكثر — بدون تسجيل، بدون إعلانات مزعجة.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              data-testid="hero-search-btn"
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3 text-base font-semibold text-black hover:bg-[#CA8A04] transition-colors"
            >
              <Search className="h-5 w-5" /> ابحث عن أداة
            </button>
            <a
              data-testid="hero-scroll-tools"
              href="#tools"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3 text-base font-medium hover:border-[#D4AF37] transition-colors"
            >
              تصفّح الأدوات
              <ArrowLeft className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="tools" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-8 sticky top-16 z-30 bg-background/80 backdrop-blur-md py-3 -mx-4 px-4">
          <button
            data-testid="cat-all"
            onClick={() => setActiveCat('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCat === 'all' ? 'bg-[#D4AF37] text-black' : 'border border-border bg-background text-foreground hover:border-[#D4AF37]'
            }`}
          >
            الكل ({TOOLS.length})
          </button>
          {Object.values(CATEGORIES).map((c) => {
            const count = TOOLS.filter((t) => t.category === c.id).length;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                data-testid={`cat-${c.id}`}
                onClick={() => setActiveCat(c.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCat === c.id ? 'bg-[#D4AF37] text-black' : 'border border-border bg-background text-foreground hover:border-[#D4AF37]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {c.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div data-testid="tools-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {filtered.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
