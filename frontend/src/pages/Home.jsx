import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TOOLS, CATEGORIES, TOOL_MAP } from '../lib/toolsRegistry';
import { ToolCard, getMostUsedSlugs } from '../lib/ui';
import { Search, Sparkles, TrendingUp, Award, Newspaper, Calendar as CalIcon } from 'lucide-react';

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
        <div className="relative h-32 overflow-hidden bg-muted">
          <img src={page.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-[#D4AF37]/20 to-transparent grid place-items-center">
          <Newspaper className="h-8 w-8 text-[#D4AF37]/60" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-sm group-hover:text-[#D4AF37] transition-colors line-clamp-2">{page.title}</h3>
        {page.excerpt && <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1 leading-relaxed">{page.excerpt}</p>}
        {page.created_at && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalIcon className="h-3 w-3" />
            {new Date(page.created_at).toLocaleDateString('ar-SA')}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Home({ onOpenSearch, siteConfig, toolOverrides }) {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios.get(`${API}/pages`).then((r) => setArticles(r.data || [])).catch(() => {});
  }, []);

  const visibleTools = useMemo(() => {
    const overrideMap = Object.fromEntries((toolOverrides || []).map((o) => [o.slug, o]));
    return TOOLS
      .filter((t) => !overrideMap[t.slug]?.hidden)
      .map((t) => ({ ...t, ...(overrideMap[t.slug] ? { name: overrideMap[t.slug].name || t.name, desc: overrideMap[t.slug].desc || t.desc } : {}) }));
  }, [toolOverrides]);

  const mostUsed = useMemo(() => {
    const slugs = getMostUsedSlugs(2);
    return slugs.map((s) => TOOL_MAP[s]).filter(Boolean);
  }, []);

  const editorPicks = useMemo(() => {
    const picks = (siteConfig?.editor_picks || []).map((s) => TOOL_MAP[s]).filter(Boolean);
    if (picks.length) return picks.slice(0, 2);
    return ['zakat', 'prayer-times'].map((s) => TOOL_MAP[s]).filter(Boolean);
  }, [siteConfig]);

  const latestArticles = useMemo(() => {
    return articles.slice(0, 2);
  }, [articles]);

  return (
    <>
      <section className="relative hero-glow overflow-hidden text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 py-1.5 text-xs text-[#D4AF37] mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {visibleTools.length}+ أداة عربية مجانية في مكان واحد
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            دليل <span className="text-[#D4AF37]">مطر</span> الإلكتروني
          </h1>
          
          <p className="mt-3 text-muted-foreground text-lg md:text-xl font-normal max-w-xl">
            كل الحاسبات والأدوات الذكية في متناول يدك بسرعة وسهولة.
          </p>

          <div className="mt-8 w-full max-w-2xl px-2">
            <button
              data-testid="hero-search-btn"
              onClick={onOpenSearch}
              className="w-full group flex items-center justify-between rounded-2xl border-2 border-[#D4AF37]/40 bg-card/80 hover:border-[#D4AF37] px-5 py-4 text-right shadow-lg backdrop-blur-md transition-all"
            >
              <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                <Search className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-base">ابحث عن أي أداة، حاسبة، أو خدمة...</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* شريط التصنيفات والأقسام في الأعلى */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          <button
            data-testid="cat-all"
            onClick={() => navigate('/tools')}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors border border-border bg-background text-foreground hover:border-[#D4AF37] shadow-sm"
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
                onClick={() => navigate(`/category/${c.id}`)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors border border-border bg-background text-foreground hover:border-[#D4AF37] shadow-sm"
              >
                <Icon className="h-4 w-4 text-[#D4AF37]" />
                <span className="truncate">{c.name}</span> ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* الأقسام الثلاثة بجانب بعضها البعض */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div data-testid="section-editor-picks" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <Award className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold">اخترنا لكم</h2>
            </div>
            <div className="space-y-3">
              {editorPicks.map((t, i) => (
                <ToolCard key={t.slug} tool={t} index={i} />
              ))}
            </div>
          </div>

          <div data-testid="section-articles" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <Newspaper className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold">آخر المقالات</h2>
            </div>
            <div className="space-y-3">
              {latestArticles.length > 0 ? (
                latestArticles.map((a, i) => (
                  <ArticleCard key={a.slug} page={a} index={i} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">لا توجد مقالات متاحة حالياً</p>
              )}
            </div>
          </div>

          <div data-testid="section-most-used" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold">أكثر استخداماً</h2>
            </div>
            <div className="space-y-3">
              {mostUsed.map((t, i) => (
                <ToolCard key={t.slug} tool={t} index={i} />
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}