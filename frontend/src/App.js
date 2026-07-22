import RemoveBg from './tools/RemoveBg';
import { useEffect, useState } from 'react';
import '@/index.css';
import axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
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

  useEffect(() => {
    axios.get(`${API}/config`).then((r) => setSiteConfig(r.data)).catch(() => {});
    axios.get(`${API}/tools/overrides`).then((r) => setToolOverrides(r.data)).catch(() => {});
  }, []);

  // Load Google Analytics if configured
  useEffect(() => {
    if (!siteConfig.ga_id || !/^G-/.test(siteConfig.ga_id)) return;
    if (document.getElementById('ga-script')) return;
    const s = document.createElement('script');
    s.id = 'ga-script';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${siteConfig.ga_id}`;
    document.head.appendChild(s);
    const s2 = document.createElement('script');
    s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${siteConfig.ga_id}');`;
    document.head.appendChild(s2);
  }, [siteConfig.ga_id]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollToTop />
      <Header onOpenContact={() => setContactOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenSearch={() => setSearchOpen(true)} siteConfig={siteConfig} toolOverrides={toolOverrides} />} />
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
