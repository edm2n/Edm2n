import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { toast } from 'sonner';
import { Button, Input } from './lib/ui';
import { Send, X } from 'lucide-react';
import axios from 'axios';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function ContactModal({ open, onOpenChange }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
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
      onOpenChange(false);
    } catch (err) {
      toast.error('تعذّر الإرسال، جرّب مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="contact-modal"
        dir="rtl"
        className="max-w-lg rounded-3xl border-border bg-card"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            التواصل مع مطر الموايقي
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            سترسل الرسالة إلى: <span dir="ltr" className="font-mono">edm2n@msn.com</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-2">
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
          <div className="flex justify-end gap-2 pt-2">
            <Button
              testid="contact-cancel"
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button testid="contact-submit" type="submit" variant="gold" disabled={sending}>
              <Send className="h-4 w-4" />
              {sending ? 'جاري الإرسال...' : 'إرسال'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SearchModal({ open, onOpenChange, onSelect, tools }) {
  const [q, setQ] = useState('');
  const filtered = q ? tools.filter((t) => t.name.includes(q) || t.desc.includes(q)).slice(0, 20) : tools.slice(0, 20);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-2xl rounded-3xl border-border bg-card p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>البحث عن أداة</DialogTitle>
        </VisuallyHidden>
        <div className="p-4 border-b border-border">
          <input
            data-testid="search-input"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن أداة (مثال: زكاة، تمويل، BMI)"
            className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">لا توجد نتائج</p>
          )}
          {filtered.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.slug}
                data-testid={`search-result-${t.slug}`}
                onClick={() => {
                  onSelect(t.slug);
                  onOpenChange(false);
                  setQ('');
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-muted transition-colors"
              >
                <Icon className="h-5 w-5 text-[#D4AF37]" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
