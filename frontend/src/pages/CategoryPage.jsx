import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOOLS, CATEGORIES } from '../lib/toolsRegistry';
import { ToolCard } from '../lib/ui';
import { ArrowRight } from 'lucide-react';

export default function CategoryPage({ toolOverrides, isAll }) {
  const { id } = useParams();

  const visibleTools = useMemo(() => {
    const overrideMap = Object.fromEntries((toolOverrides || []).map((o) => [o.slug, o]));
    return TOOLS
      .filter((t) => !overrideMap[t.slug]?.hidden)
      .map((t) => ({ ...t, ...(overrideMap[t.slug] ? { name: overrideMap[t.slug].name || t.name, desc: overrideMap[t.slug].desc || t.desc } : {}) }));
  }, [toolOverrides]);

  const currentCategory = useMemo(() => {
    if (isAll) return { name: 'جميع الأدوات' };
    return Object.values(CATEGORIES).find((c) => c.id === id) || { name: 'القسم' };
  }, [id, isAll]);

  const filteredTools = useMemo(() => {
    if (isAll) return visibleTools;
    return visibleTools.filter((t) => t.category === id);
  }, [visibleTools, id, isAll]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors mb-4">
          <ArrowRight className="h-4 w-4" /> العودة للرئيسية
        </Link>
        <h1 className="text-3xl font-bold text-foreground">{currentCategory.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">يحتوي هذا القسم على {filteredTools.length} أداة متاحة</p>
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground">لا توجد أدوات متاحة في هذا القسم حالياً.</p>
        </div>
      )}
    </div>
  );
}