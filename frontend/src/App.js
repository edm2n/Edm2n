import { useState } from 'react';
import '@/index.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import { About, FAQ, Privacy, Terms, Links } from './pages/StaticPages';
import { Header, Footer } from './Layout';
import { ContactModal, SearchModal } from './Modals';
import { TOOLS } from './lib/toolsRegistry';

function AppShell() {
  const [contactOpen, setContactOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onOpenContact={() => setContactOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenSearch={() => setSearchOpen(true)} />} />
          <Route path="/tool/:slug" element={<ToolPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/links" element={<Links />} />
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
