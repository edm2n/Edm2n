import RemoveBg from './tools/RemoveBg';
import React, { useEffect, useState } from 'react';
import '@/index.css';
import axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import CategoryPage from './pages/CategoryPage';
import Articles from './pages/Articles';
import * as StaticPages from './pages/StaticPages';
import Admin from './pages/Admin';
import CustomPage from './pages/CustomPage';
import { Header, Footer } from './Layout';
import { ContactModal, SearchModal } from './Modals';
import { TOOLS } from './lib/toolsRegistry';
import ScrollToTop from './ScrollToTop';
import { Wrench } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function AppShell() {
  const [contactOpen, setContactOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState({ ga_id: '', editor_picks: [], latest: [] });
  const [toolOverrides, setToolOverrides] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('site_config');
      if (savedConfig) {
        setSiteConfig(JSON.parse(savedConfig));
      } else {
        axios.get(`${API}/config`).then((r) => setSiteConfig(r.data)).catch(() => {});
      }
    } catch (e) {
      axios.get(`${API}/config`).then((r) => setSiteConfig(r.data)).catch(() => {});
    }

    axios.get(`${API}/tools/overrides`).then((r) => setToolOverrides(r.data)).catch(() => {});
  }, []);
// تفعيل Google Analytics و Google AdSense من الإعدادات المحفوظة
  useEffect(() => {
    if (!siteConfig) return;

    // 1. حقن كود Google Analytics
    if (siteConfig.ga_id) {
      const existingScript = document.getElementById('google-analytics');
      if (!existingScript) {
        const script1 = document.createElement('script');
        script1.id = 'google-analytics';
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${siteConfig.ga_id}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.id = 'google-analytics-inline';
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${siteConfig.ga_id}');
        `;
        document.head.appendChild(script2);
      }
    }

    // 2. حقن كود Google AdSense
    if (siteConfig.adsense_id) {
      const existingAdsense = document.getElementById('google-adsense');
      if (!existingAdsense) {
        const script = document.createElement('script');
        script.id = 'google-adsense';
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsense_id}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    }
  }, [siteConfig]);
  useEffect(() => {
    const updateDynamicManifest = () => {
      const currentUrl = window.location.href;
      const pageTitle = document.title || "دليل مطر الإلكتروني";
      let pageIcon = "/favicon.ico";
      const imgElement = document.querySelector('main img, .tool-icon img, svg');
      if (imgElement && imgElement.src) {
        pageIcon = imgElement.src;
      } else {
        const faviconTag = document.querySelector('link[rel="icon"]');
        if (faviconTag) {
          pageIcon = faviconTag.href;
        }
      }
      const dynamicManifest = {
        short_name: pageTitle,
        name: pageTitle,
        start_url: currentUrl,
        display: "standalone",
        background_color: "#02120C",
        theme_color: "#047857",
        icons: [
          { src: pageIcon, sizes: "192x192", type: "image/png" },
          { src: pageIcon, sizes: "512x512", type: "image/png" }
        ]
      };
      const stringifiedManifest = JSON.stringify(dynamicManifest);
      const blob = new Blob([stringifiedManifest], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(blob);
      let linkTag = document.querySelector('link[rel="manifest"]');
      if (!linkTag) {
        linkTag = document.createElement('link');
        linkTag.rel = 'manifest';
        document.head.appendChild(linkTag);
      }
      linkTag.href = manifestURL;
    };
    updateDynamicManifest();
    const observer = new MutationObserver(updateDynamicManifest);
    observer.observe(document.querySelector('title') || document.head, { subtree: true, characterData: true, childList: true });
    return () => observer.disconnect();
  }, [location]);

// فحص إذا كان وضع الصيانة مفعل والمستخدم ليس في لوحة التحكم
  const isAdminPath = location.pathname.startsWith('/admin');
  if (siteConfig?.maintenance_mode && !isAdminPath) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full animate-bounce">
          <Wrench className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">الموقع تحت الصيانة حالياً</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          نقوم حالياً بإجراء بعض التحديثات والتحسينات. سنعود للعمل قريباً جداً!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollToTop />
      <Header onOpenContact={() => setContactOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenSearch={() => setSearchOpen(true)} siteConfig={siteConfig} toolOverrides={toolOverrides} />} />
          <Route path="/category/:id" element={<CategoryPage toolOverrides={toolOverrides} />} />
          <Route path="/tools" element={<CategoryPage toolOverrides={toolOverrides} isAll={true} />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/tools/remove-bg" element={<RemoveBg />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/tool/:slug" element={<ToolPage />} />
          <Route path="/p/:slug" element={<CustomPage />} />
          <Route path="/about" element={<StaticPages.About />} />
          <Route path="/faq" element={<StaticPages.FAQ />} />
          <Route path="/privacy" element={<StaticPages.Privacy />} />
          <Route path="/terms" element={<StaticPages.Terms />} />
          <Route path="/links" element={<StaticPages.Links />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer onOpenContact={() => setContactOpen(true)} />
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        tools={TOOLS}
        onSelect={(slug) => navigate(`/tool/${slug}`)}
      />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
