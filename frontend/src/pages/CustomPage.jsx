// Custom Page renderer - fetches page by slug from backend + renders Markdown safely
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ExternalLink, Calendar } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

marked.setOptions({ gfm: true, breaks: true });

export default function CustomPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`${API}/pages/${slug}`)
      .then((r) => setPage(r.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h2>
      <a href="/" className="text-[#D4AF37] hover:underline">العودة للرئيسية</a>
    </div>
  );

  if (!page) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">جاري التحميل...</div>;

  const html = DOMPurify.sanitize(marked.parse(page.content || ''));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 md:py-16">
      {page.image && (
        <img
          src={page.image}
          alt={page.title}
          data-testid="custom-page-image"
          className="w-full h-64 md:h-80 object-cover rounded-3xl mb-6"
          onError={(e) => e.target.style.display = 'none'}
        />
      )}
      <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="custom-page-title">{page.title}</h1>
      {page.excerpt && <p className="text-lg text-muted-foreground mb-4 leading-relaxed">{page.excerpt}</p>}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
        {page.created_at && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(page.created_at).toLocaleDateString('ar-SA')}
          </span>
        )}
        {page.source_url && (
          <a href={page.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline" dir="ltr">
            <ExternalLink className="h-4 w-4" /> المصدر
          </a>
        )}
      </div>
      <div
        className="markdown-content leading-loose text-lg text-foreground"
        data-testid="custom-page-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
