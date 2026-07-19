import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TOOLS, CATEGORIES, TOOL_MAP } from '../lib/toolsRegistry';
import { ToolCard, getMostUsedSlugs } from '../lib/ui';
import { Search, Sparkles, ArrowLeft, TrendingUp, Award, Clock, Newspaper, Calendar as CalIcon } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function ArticleCard({ page, index }) {
  return (
    <Link
      to={`/p/${page.slug}`}
      data-testid={`article-card-${page.slug}`}
      className="card-lift fade-in-up group block rounded-2xl border border-border bg-card overflow-hidden"
      style={{ animationDelay: `${(index % 6) * 50}ms` }}
    >
      {page.image ? (
        <div className="relative h-40 overflow-hidden bg-muted">
          <img src={page.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent grid place-items-center">
          <Newspaper className="h-10 w-10 text-[#D4AF37]/60" />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-bold text-base group-hover:text-[#D4AF37] transition-colors line-clamp-2">{page.title}</h3>
        {page.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{page.excerpt}</p>}
        {page.created_at && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <CalIcon className="h-3 w-3" />
            {new Date(page.created_at).toLocaleDateString('ar-SA')}
          </div>
        )}
      </div>
    </Link>
  );
}

function Section({ title, icon: Icon, tools, testid }) {
  if (!tools?.length) return null;
  return (
    <section data-testid={testid} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-[#D4AF37]" />
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
      </div>
    </section>
  );
}

export default function Home({ onOpenSearch, siteConfig, toolOverrides }) {
  const [activeCat, setActiveCat] = useState('all');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios.get(`${API}/pages`).then((r) => setArticles(r.data || [])).catch(() => {});
  }, []);

  // Apply overrides + hide flagged tools
  const visibleTools = useMemo(() => {
    const overrideMap = Object.fromEntries((toolOverrides || []).map((o) => [o.slug, o]));
    return TOOLS
      .filter((t) => !overrideMap[t.slug]?.hidden)
      .map((t) => ({ ...t, ...(overrideMap[t.slug] ? { name: overrideMap[t.slug].name || t.name, desc: overrideMap[t.slug].desc || t.desc } : {}) }));
  }, [toolOverrides]);

  const filtered = activeCat === 'all' ? visibleTools : visibleTools.filter((t) => t.category === activeCat);

  const mostUsed = useMemo(() => {
    const slugs = getMostUsedSlugs(8);
    return slugs.map((s) => TOOL_MAP[s]).filter(Boolean);
  }, []);

  const editorPicks = useMemo(() => {
    const picks = (siteConfig?.editor_picks || []).map((s) => TOOL_MAP[s]).filter(Boolean);
    if (picks.length) return picks;
    // Fallback: sensible defaults
    return ['zakat', 'prayer-times', 'gold-price', 'currency', 'bmi', 'qr-generator', 'ai-bio', 'loan-by-salary'].map((s) => TOOL_MAP[s]).filter(Boolean);
  }, [siteConfig]);

  const latest = useMemo(() => {
    // Last 8 tools in registry
    return visibleTools.slice(-8).reverse();
  }, [visibleTools]);

  return (
    <>
      {/* Hero */}
      <section className="relative hero-glow overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#D4AF37] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            {visibleTools.length}+ أداة عربية مجانية في مكان واحد
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
            <button data-testid="hero-search-btn" onClick={onOpenSearch} className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3 text-base font-semibold text-black hover:bg-[#CA8A04] transition-colors">
              <Search className="h-5 w-5" /> ابحث عن أداة
            </button>
            <a data-testid="hero-scroll-tools" href="#tools" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3 text-base font-medium hover:border-[#D4AF37] transition-colors">
              تصفّح الأدوات <ArrowLeft className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Editor's Picks */}
      <Section title="اخترنا لكم" icon={Award} tools={editorPicks} testid="section-editor-picks" />

      {/* Articles */}
      {articles.length > 0 && (
        <section data-testid="section-articles" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl md:text-2xl font-bold">آخر المقالات</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {articles.slice(0, 8).map((a, i) => <ArticleCard key={a.slug} page={a} index={i} />)}
          </div>
        </section>
      )}

      {/* Most Used */}
      {mostUsed.length > 0 && (
        <Section title="أكثر استخداماً" icon={TrendingUp} tools={mostUsed} testid="section-most-used" />
      )}

      {/* Latest */}
      <Section title="أحدث الأدوات" icon={Clock} tools={latest} testid="section-latest" />

      {/* All Tools with categories */}
      <section id="tools" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">جميع الأدوات</h2>
        <div className="flex flex-wrap gap-2 mb-8 sticky top-16 z-30 bg-background/80 backdrop-blur-md py-3 -mx-4 px-4">
          <button
            data-testid="cat-all"
            onClick={() => setActiveCat('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCat === 'all' ? 'bg-[#D4AF37] text-black' : 'border border-border bg-background text-foreground hover:border-[#D4AF37]'
            }`}
          >
            الكل ({visibleTools.length})
          </button>
          {Object.values(CATEGORIES).map((c) => {
            const count = visibleTools.filter((t) => t.category === c.id).length;
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

        <div data-testid="tools-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
          {filtered.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
