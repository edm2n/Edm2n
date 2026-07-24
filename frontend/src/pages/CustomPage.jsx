// Custom Page renderer - fetches page by slug from backend + renders Markdown safely
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ExternalLink, Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '../lib/ui';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

marked.setOptions({ gfm: true, breaks: true });

export default function CustomPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    axios.get(`${API}/pages/${slug}`)
      .then((r) => setPage(r.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success('تم إرسال رسالتك بنجاح — شكراً لتواصلك');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error('تعذّر الإرسال، جرّب مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  if (notFound) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h2>
      <a href="/" className="text-[#D4AF37] hover:underline">العودة للرئيسية</a>
    </div>
  );

  if (!page) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">جاري التحميل...</div>;

  const rawContent = page.content || '';
  
  // تقسيم النص بناءً على الكلمة الجديدة الواضحة
const parts = rawContent.split('اتصل-بي');
  const hasContact = parts.length > 1;

  const htmlBefore = DOMPurify.sanitize(marked.parse(parts[0] || ''));
  const htmlAfter = hasContact && parts[1] ? DOMPurify.sanitize(marked.parse(parts[1])) : '';

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
        dangerouslySetInnerHTML={{ __html: htmlBefore }}
      />

      {/* نموذج الاتصال المباشر */}
      {hasContact && (
        <div className="my-10 p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm" dir="rtl">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-1">التواصل مع مطر الموايقي</h3>
            <p className="text-sm text-muted-foreground">
              سترسل الرسالة إلى: <span dir="ltr" className="font-mono">edm2n@msn.com</span>
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <Input
              testid="contact-name"
              label="الاسم"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="اسمك الكريم"
            />
            <Input
              testid="contact-email"
              label="البريد الإلكتروني"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              dir="ltr"
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">الرسالة</span>
              <textarea
                data-testid="contact-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="اكتب رسالتك..."
                rows={5}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
              />
            </label>
            <div className="flex justify-end pt-2">
              <Button testid="contact-submit" type="submit" variant="gold" disabled={sending} className="w-full sm:w-auto">
                <Send className="h-4 w-4 ml-2" />
                {sending ? 'جاري الإرسال...' : 'إرسال'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {htmlAfter && (
        <div
          className="markdown-content leading-loose text-lg text-foreground"
          dangerouslySetInnerHTML={{ __html: htmlAfter }}
        />
      )}
    </div>
  );
}