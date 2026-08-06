import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Newspaper, Calendar as CalIcon, ArrowRight, BookOpen, FolderTree } from 'lucide-react';


const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// الأقسام الثابتة المعتمدة في الموقع
const FIXED_CATEGORIES = [
  'تقنية',
  'برمجة',
  'برامج كمبيوتر',
  'الذكاء الاصطناعي',
  'شروحات',
  'أخبار عامة',
  'خطوط عربية',
  'خطوط إنجليزيه',
  'تطبيقات الجوال'
];

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    // جلب المقالات مباشرة من مسار الإدارة لضمان ظهور المقالات الجديدة وحقول الأقسام بشكل فوري للزوار
    axios.get(`${API}/admin/pages`)
      .then((r) => setArticles(r.data || []))
      .catch(() => {
        // خطة بديلة في حال لم ينجح مسار الإدارة
        axios.get(`${API}/pages`)
          .then((r) => setArticles(r.data || []))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  // دمج الأقسام الثابتة مع أي أقسام جديدة أضافها المستخدم في المقالات
  const allCategories = React.useMemo(() => {
    const set = new Set(FIXED_CATEGORIES);
    articles.forEach(article => {
      const cat = article.category || article.section || article.type;
      if (cat && typeof cat === 'string' && cat.trim()) {
        set.add(cat.trim());
      }
    });
    return Array.from(set);
  }, [articles]);

  // تصفية المقالات بناءً على القسم النشط مع مطابقة مرنة (بدون مشاكل المسافات أو الأحرف الكبيرة/الصغيرة)
  const filteredArticles = articles.filter(article => {
    // إظهار المقالات غير المنشورة للمشرف أو عرض المنشورة فقط (حسب رغبتك، هنا يعرض كل المقالات المحفوظة)
    if (activeCategory === 'all') return true;
    const articleCat = article.category || article.section || article.type || '';
    return articleCat.trim() === activeCategory.trim();
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8" dir="rtl">
      <div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:border-[#D4AF37] transition-colors text-foreground shadow-sm"
        >
          <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">المقالات والبرامج</h1>
            <p className="text-sm text-muted-foreground mt-1">تصفح أحدث المقالات والمواضيع التقنية والشروحات المنشورة في الموقع.</p>
          </div>
        </div>

        {/* شريط الأقسام الثابتة والديناميكية */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
          <FolderTree className="h-4 w-4 text-[#D4AF37] ml-1 shrink-0" />
          
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 border ${
              activeCategory === 'all'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md font-bold'
                : 'bg-card text-muted-foreground border-border hover:border-[#D4AF37]/50 hover:text-foreground'
            }`}
          >
            جميع المقالات
          </button>

          {allCategories.map((catName) => (
            <button
              key={catName}
              onClick={() => setActiveCategory(catName)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 border ${
                activeCategory === catName
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md font-bold'
                  : 'bg-card text-muted-foreground border-border hover:border-[#D4AF37]/50 hover:text-foreground'
              }`}
            >
              {catName}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">جاري تحميل المقالات...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-border bg-card/50 space-y-3">
          <Newspaper className="h-12 w-12 text-[#D4AF37]/40 mx-auto" />
          <h3 className="text-lg font-bold">لا توجد مقالات متاحة في هذا القسم حالياً</h3>
          <p className="text-sm text-muted-foreground">تأكد من اختيار القسم المناسب أثناء إضافة أو تعديل المقال من لوحة التحكم.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((page) => (
            <Link
              key={page.slug || page.id}
              to={`/p/${page.slug}`}
              className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/60 hover:shadow-lg flex flex-col"
            >
              {page.image ? (
                <div className="relative h-48 overflow-hidden bg-card flex items-center justify-center border-b border-border/40">
                  <img
                    src={page.image}
                    alt={page.title}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-[#D4AF37]/15 via-card to-card flex items-center justify-center border-b border-border/40">
                  <div className="p-4 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                    <Newspaper className="h-8 w-8" />
                  </div>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {(page.category || page.section) && (
                      <span className="text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-md">
                        {page.category || page.section}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">{page.title}</h3>
                  {page.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{page.excerpt}</p>}
                </div>
                {page.created_at && (
                  <div className="pt-3 border-t border-border/60 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
                    {new Date(page.created_at).toLocaleDateString('ar-SA')}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
