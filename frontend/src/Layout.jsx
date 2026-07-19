import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, Search, X, Download } from 'lucide-react';
import { Button } from './lib/ui';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return [theme, setTheme];
}

export function Header({ onOpenContact, onOpenSearch }) {
  const [theme, setTheme] = useTheme();
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <Link to="/" data-testid="header-logo" className="flex items-center gap-2 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-[#D4AF37] font-bold shadow-lg">
            دم
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-bold leading-tight">دليل مطر</div>
            <div className="text-xs text-muted-foreground">الإلكتروني</div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            data-testid="open-search"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:border-[#D4AF37] transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">ابحث عن أداة...</span>
          </button>

          {installPrompt && (
            <button
              data-testid="install-pwa"
              onClick={install}
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-3 py-2 text-sm font-semibold text-black hover:bg-[#CA8A04]"
            >
              <Download className="h-4 w-4" /> أضف للشاشة الرئيسية
            </button>
          )}

          <button
            data-testid="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background hover:border-[#D4AF37] transition-colors"
            aria-label="تبديل الوضع"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-[#D4AF37]" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer({ onOpenContact }) {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-[#D4AF37] font-bold">
                دم
              </div>
              <div>
                <div className="text-base font-bold">دليل مطر الإلكتروني</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              دليل عربي شامل يجمع أهم الأدوات والحاسبات في مكان واحد. مجاناً، بدون تسجيل.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">صفحات</h4>
            <ul className="space-y-2 text-sm">
              <li><Link data-testid="footer-about" to="/about" className="text-muted-foreground hover:text-[#D4AF37]">من نحن</Link></li>
              <li><Link data-testid="footer-faq" to="/faq" className="text-muted-foreground hover:text-[#D4AF37]">الأسئلة الشائعة</Link></li>
              <li><Link data-testid="footer-privacy" to="/privacy" className="text-muted-foreground hover:text-[#D4AF37]">سياسة الخصوصية</Link></li>
              <li><Link data-testid="footer-terms" to="/terms" className="text-muted-foreground hover:text-[#D4AF37]">شروط الاستخدام</Link></li>
              <li><Link data-testid="footer-links" to="/links" className="text-muted-foreground hover:text-[#D4AF37]">قنواتنا</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">تواصل</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a data-testid="footer-twitter" href="https://twitter.com/edm2n" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#D4AF37]">
                  تويتر: @edm2n
                </a>
              </li>
              <li>
                <a data-testid="footer-email" href="mailto:edm2n@msn.com" className="text-muted-foreground hover:text-[#D4AF37]">
                  edm2n@msn.com
                </a>
              </li>
              <li>
                <button data-testid="footer-contact-open" onClick={onOpenContact} className="text-muted-foreground hover:text-[#D4AF37]">
                  اتصل بنا
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
          <p className="text-sm text-muted-foreground">
            برمجة وتصميم{' '}
            <button
              data-testid="footer-contact-trigger"
              onClick={onOpenContact}
              className="font-semibold text-[#D4AF37] hover:underline"
            >
              مطر الموايقي
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
}
