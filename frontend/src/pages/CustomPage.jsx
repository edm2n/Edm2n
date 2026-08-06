import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Calendar, FileText } from 'lucide-react';
import ShareButtons from '../components/ui/ShareButtons';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CustomPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/pages/${slug}`)
      .then((r) => setPage(r.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">جاري تحميل المقال...</div>;
  }

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4" dir="rtl">
        <h2 className="text-2xl font-bold">المقال غير موجود</h2>
        <p className="text-muted-foreground">عذراً، لم نتمكن من العثور على المقال المطلوب.</p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] text-black px-5 py-2.5 font-medium">
          <ArrowRight className="h-4 w-4" /> العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8" dir="rtl">
      {/* زر العودة للرئيسية */}
      <div>
        <Link 
          to="/" 
          data-testid="back-to-home"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:border-[#D4AF37] transition-colors text-foreground shadow-sm"
        >
          <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>

      {/* رأس المقال */}
      <div className="space-y-4 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{page.title}</h1>
        {page.created_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-[#D4AF37]" />
            <span>{new Date(page.created_at).toLocaleDateString('ar-SA')}</span>
          </div>
        )}

        {/* أزرار المشاركة أصبحت هنا في الأعلى تحت العنوان والتاريخ */}
        <ShareButtons title={page.title} />
      </div>

      {/* صورة المقال البارزة إن وجدت */}
      {page.image && (
        <div className="rounded-2xl overflow-hidden border border-border bg-muted max-h-[400px]">
          <img src={page.image} alt={page.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* محتوى المقال */}
      <div 
        className="prose prose-invert max-w-none space-y-4 text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
