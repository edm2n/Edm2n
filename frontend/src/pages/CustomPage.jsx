// Custom Page renderer - fetches page by slug from backend + renders Markdown safely
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
      <h1 className="text-3xl md:text-4xl font-bold mb-6" data-testid="custom-page-title">{page.title}</h1>
      <div
        className="markdown-content leading-loose text-lg text-foreground"
        data-testid="custom-page-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
