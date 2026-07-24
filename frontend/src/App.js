import RemoveBg from './tools/RemoveBg';
import React, { useEffect, useState } from 'react';
import '@/index.css';
import axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import CategoryPage from './pages/CategoryPage'; // استدعاء صفحة التصنيف الجديدة
import { About, FAQ, Privacy, Terms, Links } from './pages/StaticPages';
import Admin from './pages/Admin';
import CustomPage from './pages/CustomPage';
import { Header, Footer } from './Layout';
import { ContactModal, SearchModal } from './Modals';
import { TOOLS } from './lib/toolsRegistry';
import ScrollToTop from './ScrollToTop';

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
    axios.get(`${API}/config`).then((r) => setSiteConfig(r.data)).catch(() => {});
    axios.get(`${API}/tools/overrides`).then((r) => setToolOverrides(r.data)).catch(() => {});
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollToTop />
      <Header onOpenContact={() => setContactOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenSearch={() => setSearchOpen(true)} siteConfig={siteConfig} toolOverrides={toolOverrides} />} />
          <Route path="/category/:id" element={<CategoryPage toolOverrides={toolOverrides} />} />
          <Route path="/tools" element={<CategoryPage toolOverrides={toolOverrides} isAll={true} />} />
          <Route path="/tools/remove-bg" element={<RemoveBg />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/tool/:slug" element={<ToolPage />} />
          <Route path="/p/:slug" element={<CustomPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/links" element={<Links />} />
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