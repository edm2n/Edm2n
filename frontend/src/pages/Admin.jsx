// Admin Panel - login + manage pages + tools + config + messages
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Input, Button } from '../lib/ui';
import { TOOLS } from '../lib/toolsRegistry';
import Moveable from 'react-moveable';
import { 
  LogOut, Trash2, Eye, EyeOff, Plus, Save, Sparkles, Pin, PinOff,
  Image as ImageIcon, Link as LinkIcon, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Undo, Redo, FolderTree, BarChart3, Users, FileText,
  Highlighter, Palette, ChevronDown, Wrench, Settings, Mail, RefreshCw, 
  CheckCircle, ShieldAlert, Search, MessageSquare
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'admin_token';

const FIXED_CATEGORIES = [
  'تقنية',
  'برمجة',
  'برامج كمبيوتر',
  'الذكاء الاصطناعي',
  'شروحات',
  'أخبار عامة',
  'خطوط عربية',
  'خطوط إنجليزيه',
  'تطبيقات الجوال'
];

function useAdminApi() {
  const token = localStorage.getItem(TOKEN_KEY);
  return { headers: { Authorization: `Bearer ${token}` } };
}

const generateSlug = (text) => {
  if (!text) return 'page-' + Date.now();
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-أ-ي]+/g, '')
    .replace(/\-\-+/g, '-') || ('page-' + Date.now());
};

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [tab, setTab] = useState('stats');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) { setVerified(false); return; }
    axios.get(`${API}/admin/verify`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setVerified(true))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); });
  }, [token]);

  if (!token || !verified) return <Login onLogin={(t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />;

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
        <Button testid="admin-logout" variant="ghost" onClick={logout}><LogOut className="h-4 w-4 ml-1" /> خروج</Button>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          ['stats', 'الإحصائيات', BarChart3],
          ['pages', 'الصفحات المخصصة', FileText],
          ['tools', 'إدارة الأدوات', Wrench],
          ['config', 'الإعدادات', Settings],
          ['messages', 'رسائل التواصل', Mail],
        ].map(([k, v, Icon]) => (
          <button 
            key={k} 
            onClick={() => setTab(k)} 
            data-testid={`admin-tab-${k}`} 
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${tab === k ? 'bg-[#D4AF37] text-black shadow-md' : 'border border-border hover:bg-card'}`}
          >
            <Icon className="h-4 w-4" />
            {v}
          </button>
        ))}
      </div>

      {tab === 'stats' && <StatsTab />}
      {tab === 'pages' && <PagesTab />}
      {tab === 'tools' && <ToolsTab />}
      {tab === 'config' && <ConfigTab />}
      {tab === 'messages' && <MessagesTab />}
    </div>
  );
}

function Login({ onLogin }) {
  const [u, setU] = useState(''), [p, setP] = useState(''), [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await axios.post(`${API}/admin/login`, { username: u, password: p });
      onLogin(r.data.token);
      toast.success('مرحباً بك');
    } catch { toast.error('بيانات الدخول غير صحيحة'); }
    finally { setLoading(false); }
  };
  return (
    <div className="mx-auto max-w-md px-4 py-20" dir="rtl">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">تسجيل دخول المدير</h1>
        <form onSubmit={submit} className="space-y-4">
          <Input testid="admin-username" label="اسم المستخدم" value={u} onChange={(e) => setU(e.target.value)} dir="ltr" autoComplete="username" />
          <Input testid="admin-password" label="كلمة المرور" type="password" value={p} onChange={(e) => setP(e.target.value)} dir="ltr" autoComplete="current-password" />
          <Button testid="admin-login" type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-black font-bold">{loading ? '...' : 'دخول'}</Button>
        </form>
      </div>
    </div>
  );
}

function StatsTab() {
  const cfg = useAdminApi();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/admin/stats`, cfg).then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="p-8 text-center text-muted-foreground">جاري تحميل الإحصائيات...</div>;

  const cards = [
    { title: 'إجمالي الزيارات', val: data.total_visits || 0, icon: Eye, color: 'text-blue-500' },
    { title: 'زيارات اليوم', val: data.today_visits || 0, icon: BarChart3, color: 'text-green-500' },
    { title: 'عدد الأدوات', val: data.total_tools || Object.keys(TOOLS).length, icon: Wrench, color: 'text-[#D4AF37]' },
    { title: 'عدد المقالات والصفحات', val: data.total_pages || 0, icon: FileText, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{c.title}</span>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div className="text-3xl font-bold">{c.val.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PagesTab() {
  const cfg = useAdminApi();
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [fetchQuery, setFetchQuery] = useState('');
  const [fetching, setFetching] = useState(false);

  const load = () => axios.get(`${API}/admin/pages`, cfg).then((r) => setPages(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const empty = { slug: '', title: '', content: '', excerpt: '', image: '', category: FIXED_CATEGORIES[0], section: FIXED_CATEGORIES[0], source_url: '', published: true, pinned: false, hidden: false };

  const save = async (page) => {
    try {
      const customCategory = page.category || page.section || FIXED_CATEGORIES[0];
      const payload = {
        ...page,
        slug: generateSlug(page.slug || page.title),
        category: customCategory,
        section: customCategory,
        tags: [customCategory]
      };

      if (page.id) {
        await axios.put(`${API}/admin/pages/${page.id}`, payload, cfg);
      } else {
        await axios.post(`${API}/admin/pages`, payload, cfg);
      }
      toast.success('تم حفظ المقال بنجاح');
      setEditing(null); 
      load();
    } catch (e) {
      toast.error('فشل الحفظ، تحقق من البيانات والاتصال');
    }
  };

  const del = async (id) => {
    if (!confirm('هل تريد حذف هذه الصفحة؟')) return;
    try {
      await axios.delete(`${API}/admin/pages/${id}`, cfg);
      toast.success('تم الحذف'); 
      load();
    } catch {
      toast.error('تعذّر الحذف');
    }
  };

  const togglePin = async (page) => {
    try {
      const customCategory = page.category || page.section || FIXED_CATEGORIES[0];
      const payload = { ...page, slug: generateSlug(page.slug || page.title), category: customCategory, section: customCategory, tags: [customCategory], pinned: !page.pinned };
      await axios.put(`${API}/admin/pages/${page.id}`, payload, cfg);
      toast.success(!page.pinned ? 'تم تثبيت المقال' : 'تم إلغاء تثبيت المقال');
      load();
    } catch {
      toast.error('فشل تحديث التثبيت');
    }
  };

  const toggleHidden = async (page) => {
    try {
      const customCategory = page.category || page.section || FIXED_CATEGORIES[0];
      const payload = { ...page, slug: generateSlug(page.slug || page.title), category: customCategory, section: customCategory, tags: [customCategory], hidden: !page.hidden };
      await axios.put(`${API}/admin/pages/${page.id}`, payload, cfg);
      toast.success(!page.hidden ? 'تم إخفاء المقال' : 'تم إظهار المقال');
      load();
    } catch {
      toast.error('فشل تحديث الإخفاء');
    }
  };

  const smartFetch = async () => {
    if (!fetchQuery.trim()) { 
      toast.error('الرجاء إدخل رابط مقال أو كلمة مفتاحية أولاً'); 
      return; 
    }
    
    setFetching(true);
    try {
      const r = await axios.post(`${API}/admin/smart-fetch`, { query: fetchQuery }, cfg);
      setEditing({
        slug: generateSlug(r.data.slug || r.data.title),
        title: r.data.title || '',
        content: r.data.content || '',
        excerpt: r.data.excerpt || '',
        image: r.data.image || '',
        category: FIXED_CATEGORIES[0],
        section: FIXED_CATEGORIES[0],
        source_url: '',
        published: true,
      });
      toast.success('تمت صياغة وجلب المقال بنجاح');
    } catch {
      toast.error('تعذّر الجلب، تأكد من الرابط أو الخادم');
    } finally { 
      setFetching(false); 
    }
  };

  if (editing) return <PageEditor page={editing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 bg-[#D4AF37]/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <h3 className="font-bold">جلب ذكي (Smart Fetcher)</h3>
        </div>
        <p className="text-sm text-muted-foreground">الصق رابط مقال أو اكتب كلمة مفتاحية لجلب الموضوع منسقاً.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            data-testid="admin-fetch-input"
            value={fetchQuery}
            onChange={(e) => setFetchQuery(e.target.value)}
            placeholder="مثال: https://example.com/article"
            dir="auto"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-[#D4AF37]"
            disabled={fetching}
          />
          <Button onClick={smartFetch} disabled={fetching} className="bg-[#D4AF37] text-black font-bold">
            {fetching ? '⏳ جاري الصياغة...' : 'جلب ذكي'}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">صفحاتك المخصصة ({pages.length})</h3>
        <Button testid="admin-new-page" onClick={() => setEditing(empty)} className="bg-[#D4AF37] text-black font-bold"><Plus className="h-4 w-4 ml-1" /> صفحة يدوياً</Button>
      </div>

      {[...pages].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((p) => (
        <div key={p.id} className={`rounded-2xl border p-4 flex items-center justify-between gap-3 bg-card shadow-sm ${p.pinned ? 'border-[#D4AF37]' : 'border-border'} ${p.hidden ? 'opacity-60' : ''}`}>
          {p.image ? (
            <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" onError={(e) => e.target.style.display = 'none'} />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-muted grid place-items-center shrink-0"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{p.title}</div>
            <div className="text-xs text-muted-foreground truncate flex items-center gap-2 flex-wrap" dir="rtl">
              <span dir="ltr">/p/{p.slug}</span>
              {(p.category || p.section) && <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-md text-[10px]">📂 {p.category || p.section}</span>}
              <span>— {p.published ? 'منشورة' : 'مسودة'}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" title={p.pinned ? 'إلغاء التثبيت' : 'تثبيت المقال'} onClick={() => togglePin(p)}>
              {p.pinned ? <PinOff className="h-4 w-4 text-[#D4AF37]" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" title={p.hidden ? 'إظهار المقال' : 'إخفاء المقال'} onClick={() => toggleHidden(p)}>
              {p.hidden ? <EyeOff className="h-4 w-4 text-destructive" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(p)}>تعديل</Button>
            <Button variant="ghost" onClick={() => del(p.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PageEditor({ page, onSave, onCancel }) {
  const [p, setP] = useState(page);
  const editorRef = useRef(null);
  
  const [fontSize, setFontSize] = useState('16');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  
  const [selectedTarget, setSelectedTarget] = useState(null);

  const fontSizes = [
    { label: 'صغير جداً (12px)', value: '12px' },
    { label: 'صغير (14px)', value: '14px' },
    { label: 'عادي (16px)', value: '16px' },
    { label: 'متوسط (18px)', value: '18px' },
    { label: 'كبير (20px)', value: '20px' },
    { label: 'كبير جداً (24px)', value: '24px' },
    { label: 'عنوان فرعي (28px)', value: '28px' },
    { label: 'عنوان رئيسي (32px)', value: '32px' },
  ];

  const presetColors = [
    // درجات الأسود والرمادي والأبيض
    '#000000', '#222222', '#444444', '#666666', '#888888', '#AAAAAA', '#CCCCCC', '#EEEEEE', '#FFFFFF',
    // درجات الذهبي والفضي والميتاليك
    '#D4AF37', '#B8860B', '#DAA520', '#FFD700', '#C0C0C0', '#E5E4E2', '#CD7F32', '#B87333',
    // درجات الأحمر والوردبي
    '#8B0000', '#B22222', '#DC143C', '#FF0000', '#FF4500', '#FF6347', '#FF1493', '#C71585', '#FF69B4',
    // درجات البرتقالي والأصفر
    '#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#9ACD32', '#ADFF2F', '#7FFF00',
    // درجات الأخضر
    '#006400', '#008000', '#228B22', '#32CD32', '#00FF7F', '#00FA9A', '#20B2AA', '#66CDAA',
    // درجات الأزرق السماوي والبحري
    '#000080', '#0000CD', '#0000FF', '#1E90FF', '#00BFFF', '#87CEEB', '#4682B4', '#5F9EA0',
    // درجات البنفسجي والنيلي والارجواني
    '#4B0082', '#8A2BE2', '#9932CC', '#9400D3', '#800080', '#DA70D6', '#EE82EE', '#BA55D3'
  ];

  const highlightColors = [
    '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFA500', '#FFC0CB',
    '#ADD8E6', '#98FB98', '#F0E68C', '#E6E6FA', '#FFB6C1', '#FFFACD',
    '#FFD700', '#E0FFFF', '#F5DEB3', '#D3D3D3', 
       // درجات الأسود والرمادي والأبيض
    '#000000', '#222222', '#444444', '#666666', '#888888', '#AAAAAA', '#CCCCCC', '#EEEEEE', '#FFFFFF',
    // درجات الذهبي والفضي والميتاليك
    '#D4AF37', '#B8860B', '#DAA520', '#FFD700', '#C0C0C0', '#E5E4E2', '#CD7F32', '#B87333',
    // درجات الأحمر والوردبي
    '#8B0000', '#B22222', '#DC143C', '#FF0000', '#FF4500', '#FF6347', '#FF1493', '#C71585', '#FF69B4',
    // درجات البرتقالي والأصفر
    '#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#9ACD32', '#ADFF2F', '#7FFF00',
    // درجات الأخضر
    '#006400', '#008000', '#228B22', '#32CD32', '#00FF7F', '#00FA9A', '#20B2AA', '#66CDAA',
    // درجات الأزرق السماوي والبحري
    '#000080', '#0000CD', '#0000FF', '#1E90FF', '#00BFFF', '#87CEEB', '#4682B4', '#5F9EA0',
    // درجات البنفسجي والنيلي والارجواني
    '#4B0082', '#8A2BE2', '#9932CC', '#9400D3', '#800080', '#DA70D6', '#EE82EE', '#BA55D3','transparent'
  ];

  const handleEditorClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedTarget(e.target);
    } else {
      setSelectedTarget(null);
    }
  };

  const convertMarkdownToHtml = (text) => {
    if (!text) return '';
    if (text.includes('<h1') || text.includes('<h2') || text.includes('<p>')) {
      return text;
    }
    
    let html = text
      .replace(/^###\s+(.*$)/gm, '<h3 style="font-size: 1.25rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; color: #D4AF37;">$1</h3>')
      .replace(/^##\s+(.*$)/gm, '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 1.2rem; margin-bottom: 0.6rem; color: #D4AF37;">$2</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #D4AF37; text-decoration: underline;">$1</a>')
      .replace(/\n\n/g, '</p><p style="margin-bottom: 1rem;">');

    return `<p style="margin-bottom: 1rem;">${html}</p>`;
  };

  useEffect(() => {
    if (editorRef.current) {
      const formattedHtml = convertMarkdownToHtml(p.content);
      editorRef.current.innerHTML = formattedHtml;
      setP(prev => ({ ...prev, content: formattedHtml }));
    }
  }, []);

  const executeCommand = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setP(prev => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  };

  const changeFontSize = (sizeValue, label) => {
    setFontSize(label.split(' ')[1]?.replace('px)', '') || '16');
    setShowFontDropdown(false);

    if (editorRef.current) editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      toast.error('الرجاء تحديد النص المراد تغيير حجمه أولاً');
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = sizeValue;
      span.style.display = 'inline';
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
    } catch (e) {
      executeCommand('fontSize', '5');
    }

    if (editorRef.current) {
      setP(prev => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  };

  const handleInsertImageLink = () => {
    const imageUrl = prompt("أدخل رابط الصورة المباشر:");
    if (!imageUrl) return;

    const imageHtml = `<div style="text-align: center; margin: 15px 0;"><img src="${imageUrl}" alt="صورة" style="max-width: 100%; height: auto; border-radius: 8px;"></div>`;
    executeCommand('insertHTML', imageHtml);
  };

  const applyTextColor = (colorHex) => {
    setShowColorDropdown(false);
    executeCommand('foreColor', colorHex);
  };

  const applyHighlightColor = (colorHex) => {
    setShowHighlightDropdown(false);
    if (colorHex === 'transparent') {
      executeCommand('removeFormat');
    } else {
      executeCommand('hiliteColor', colorHex);
    }
  };

  const insertCustomLink = () => {
    const url = prompt('أدخل رابط الموقع أو الصفحة (URL):', 'https://');
    if (!url) return;

    if (editorRef.current) {
      editorRef.current.focus();
    }

    const selection = window.getSelection();
    let selectedText = selection ? selection.toString().trim() : '';

    if (!selectedText) {
      selectedText = prompt('أدخل النص الذي سيظهر للرابط:', 'اضغط هنا للزيارة');
      if (!selectedText) return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.textContent = selectedText;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('dir', 'ltr');
    a.style.cssText = 'color: #D4AF37; text-decoration: underline; unicode-bidi: plaintext; display: inline-block; font-weight: 600; cursor: pointer;';

    if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(a);
    } else {
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(a);
      } else if (editorRef.current) {
        editorRef.current.appendChild(a);
      }
    }

    if (editorRef.current) {
      setP(prev => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border p-6 bg-card text-right shadow-md" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input 
          testid="pe-slug" 
          label="الرابط (Slug)" 
          value={p.slug} 
          onChange={(e) => setP({ ...p, slug: e.target.value })} 
          dir="ltr" 
        />
        <Input testid="pe-title" label="عنوان المقال" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} />
        
        
<div className="space-y-1.5">
  <label className="block text-sm font-medium flex items-center gap-1">
    <FolderTree className="h-4 w-4 text-[#D4AF37]" />
    <span>قسم المقال</span>
  </label>
  <select
    value={p.category || p.section || FIXED_CATEGORIES[0]}
    onChange={(e) => setP({ ...p, category: e.target.value, section: e.target.value })}
    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
  >
    {FIXED_CATEGORIES.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>
</div>
</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input testid="pe-image" label="رابط الصورة البارزة" value={p.image || ''} onChange={(e) => setP({ ...p, image: e.target.value })} dir="ltr" placeholder="https://..." />
        <Input testid="pe-excerpt" label="مقتطف قصير" value={p.excerpt || ''} onChange={(e) => setP({ ...p, excerpt: e.target.value })} placeholder="وصف قصير" />
      </div>

      <div className="rounded-xl border border-border bg-card p-2 space-y-2 sticky top-[70px] z-40 shadow-sm">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button type="button" title="تراجع" onClick={() => executeCommand('undo')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><Undo className="h-3.5 w-3.5" /></button>
          <button type="button" title="إعادة" onClick={() => executeCommand('redo')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><Redo className="h-3.5 w-3.5" /></button>
          
          <span className="w-px h-5 bg-border mx-1"></span>

          <div className="relative inline-block text-right">
            <button
              type="button"
              onClick={() => { setShowFontDropdown(!showFontDropdown); setShowColorDropdown(false); setShowHighlightDropdown(false); }}
              className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              <span>حجم الخط: {fontSize}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {showFontDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 max-h-56 overflow-y-auto bg-card border border-border rounded-lg shadow-xl z-50 p-1">
                {fontSizes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => changeFontSize(item.value, item.label)}
                    className="w-full text-right px-3 py-2 text-xs hover:bg-[#D4AF37] hover:text-black rounded transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-border mx-1"></span>

          <div className="relative inline-block text-right">
            <button
              type="button"
              onClick={() => { setShowColorDropdown(!showColorDropdown); setShowFontDropdown(false); setShowHighlightDropdown(false); }}
              className="flex items-center gap-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs hover:bg-muted"
            >
              <Palette className="h-3.5 w-3.5 text-[#D4AF37]" />
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {showColorDropdown && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 p-3">
                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyTextColor(color)}
                      className="w-6 h-6 rounded-md border border-border/60 hover:scale-125 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative inline-block text-right">
            <button
              type="button"
              onClick={() => { setShowHighlightDropdown(!showHighlightDropdown); setShowFontDropdown(false); setShowColorDropdown(false); }}
              className="flex items-center gap-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs hover:bg-muted"
            >
              <Highlighter className="h-3.5 w-3.5 text-amber-500" />
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {showHighlightDropdown && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 p-3">
                <div className="grid grid-cols-6 gap-1">
                  {highlightColors.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyHighlightColor(color)}
                      className="w-6 h-6 rounded-md border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color === 'transparent' ? '#ffffff' : color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-border mx-1"></span>

          <button type="button" title="عريض" onClick={() => executeCommand('bold')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted font-bold"><Bold className="h-3.5 w-3.5" /></button>
          <button type="button" title="مائل" onClick={() => executeCommand('italic')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><Italic className="h-3.5 w-3.5" /></button>
          <button type="button" title="تحته خط" onClick={() => executeCommand('underline')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><Underline className="h-3.5 w-3.5" /></button>

          <span className="w-px h-5 bg-border mx-1"></span>

          <button type="button" title="محاذاة لليمين" onClick={() => executeCommand('justifyRight')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><AlignRight className="h-3.5 w-3.5" /></button>
          <button type="button" title="توسيط" onClick={() => executeCommand('justifyCenter')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><AlignCenter className="h-3.5 w-3.5" /></button>
          <button type="button" title="محاذاة لليسار" onClick={() => executeCommand('justifyLeft')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><AlignLeft className="h-3.5 w-3.5" /></button>
          <button type="button" title="ضبط كامل" onClick={() => executeCommand('justifyFull')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><AlignJustify className="h-3.5 w-3.5" /></button>

          <span className="w-px h-5 bg-border mx-1"></span>

          <button type="button" title="قائمة نقطية" onClick={() => executeCommand('insertUnorderedList')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><List className="h-3.5 w-3.5" /></button>
          <button type="button" title="قائمة رقمية" onClick={() => executeCommand('insertOrderedList')} className="p-2 bg-background border border-border rounded-lg hover:bg-muted"><ListOrdered className="h-3.5 w-3.5" /></button>
          
          <span className="w-px h-5 bg-border mx-1"></span>

          <button type="button" title="إدراج صورة داخل المقال" onClick={handleInsertImageLink} className="p-2 bg-background border border-border rounded-lg hover:bg-muted text-[#D4AF37]"><ImageIcon className="h-3.5 w-3.5" /></button>
          <button type="button" title="إدراج رابط" onClick={insertCustomLink} className="p-2 bg-background border border-border rounded-lg hover:bg-muted text-[#D4AF37]"><LinkIcon className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable={true}
        onClick={handleEditorClick}
        onInput={() => {
          if (editorRef.current) {
            setP(prev => ({ ...prev, content: editorRef.current.innerHTML }));
          }
        }}
        className="min-h-[350px] w-full rounded-xl border border-input bg-background p-4 text-sm outline-none focus:border-[#D4AF37] leading-relaxed shadow-inner"
        style={{ direction: 'rtl', textAlign: 'right' }}
      />

      {selectedTarget && (
        <Moveable
          target={selectedTarget}
          resizable={true}
          keepRatio={true}
          throttleResize={1}
          renderDirections={["nw", "ne", "se", "sw"]}
          onResize={({ target, width, height }) => {
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
          }}
        />
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel}>إلغاء</Button>
        <Button type="button" onClick={() => onSave(p)} className="bg-[#D4AF37] text-black font-bold hover:bg-[#D4AF37]/90">
          <Save className="h-4 w-4 ml-1" /> حفظ المقال
        </Button>
      </div>
    </div>
  );
}

// ==================== تبويب إدارة الأدوات الكامل ====================
// ==================== تبويب إدارة الأدوات الكامل ====================
function ToolsTab() {
  const [disabledMap, setDisabledMap] = useState(() => {
    try {
      const saved = localStorage.getItem('disabled_tools');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [search, setSearch] = useState('');

  // دالة جلب المعرف الفريد للأداة لتجنب undefined
  const getToolKey = (tool, index) => {
    return tool.id || tool.slug || tool.path || tool.name || `tool_${index}`;
  };

  const toggleTool = (toolKey) => {
    if (!toolKey) return;
    setDisabledMap((prev) => {
      const nextState = !prev[toolKey];
      const updated = { ...prev, [toolKey]: nextState };
      localStorage.setItem('disabled_tools', JSON.stringify(updated));
      toast.success(nextState ? 'تم تعطيل الأداة' : 'تم تفعيل الأداة');
      return updated;
    });
  };

  const enableAll = () => {
    setDisabledMap({});
    localStorage.removeItem('disabled_tools');
    toast.success('تم تفعيل جميع الأدوات');
  };

  const disableAll = () => {
    if (!confirm('هل انت متأكد من تعطيل جميع الأدوات؟')) return;
    const allDisabled = {};
    const toolsArray = Array.isArray(TOOLS) ? TOOLS : Object.values(TOOLS || {});
    toolsArray.forEach((t, idx) => {
      const key = getToolKey(t, idx);
      if (key) allDisabled[key] = true;
    });
    setDisabledMap(allDisabled);
    localStorage.setItem('disabled_tools', JSON.stringify(allDisabled));
    toast.success('تم تعطيل جميع الأدوات');
  };

  const toolsArray = Array.isArray(TOOLS) ? TOOLS : Object.values(TOOLS || {});
  
  const toolList = toolsArray.filter((t) => {
    const name = t.name || t.title || '';
    const cat = t.category || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      cat.toLowerCase().includes(search.toLowerCase())
    );
  });

  const disabledCount = Object.values(disabledMap).filter(Boolean).length;
  const enabledCount = toolsArray.length - disabledCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-muted-foreground">إجمالي الأدوات</div>
            <div className="text-2xl font-bold">{toolsArray.length}</div>
          </div>
          <Wrench className="h-8 w-8 text-[#D4AF37] opacity-80" />
        </div>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-green-600 dark:text-green-400">الأدوات المفعلة</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.max(0, enabledCount)}</div>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
        </div>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-destructive">الأدوات المعطلة</div>
            <div className="text-2xl font-bold text-destructive">{disabledCount}</div>
          </div>
          <ShieldAlert className="h-8 w-8 text-destructive opacity-80" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث عن أداة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pr-9 pl-4 py-2 text-sm outline-none focus:border-[#D4AF37]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={enableAll} className="text-xs border-green-500 text-green-600 hover:bg-green-500/10">تفعيل الكل</Button>
          <Button variant="outline" size="sm" onClick={disableAll} className="text-xs border-destructive text-destructive hover:bg-destructive/10">تعطيل الكل</Button>
        </div>
      </div>

      {toolList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد أدوات تطابق البحث</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolList.map((t, idx) => {
            const toolKey = getToolKey(t, idx);
            const isDisabled = !!disabledMap[toolKey];
            return (
              <div key={toolKey} className={`rounded-2xl border p-4 flex items-center justify-between gap-3 bg-card shadow-sm transition-all ${isDisabled ? 'border-destructive/40 bg-destructive/5' : 'border-border hover:border-[#D4AF37]/50'}`}>
                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-sm truncate flex items-center gap-1.5">
                    <span>{t.name || t.title}</span>
                    {t.category && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t.category}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate" dir="ltr">{toolKey}</div>
                </div>
                <Button
                  variant={isDisabled ? 'destructive' : 'ghost'}
                  size="sm"
                  onClick={() => toggleTool(toolKey)}
                  className={`shrink-0 font-bold ${!isDisabled ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}`}
                >
                  {isDisabled ? 'معطلة' : 'مفعلة'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== تبويب الإعدادات الكامل ====================
function ConfigTab() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('site_config');
      return saved ? JSON.parse(saved) : {
        site_name: 'أدواتك',
        site_description: 'منصة الأدوات الذكية الشاملة للمحتوى والتصميم والحسابات',
        ga_id: '',
        adsense_id: '',
        footer_text: 'جميع الحقوق محفوظة © 2026',
        maintenance_mode: false
      };
    } catch {
      return {};
    }
  });

  const handleSave = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('site_config', JSON.stringify(config));
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 bg-card p-6 rounded-2xl border border-border shadow-sm">
      {/* اسم ووصف الموقع */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">وصف الموقع (SEO & Meta)</label>
          <textarea
            rows={3}
            value={config.site_description || ''}
            onChange={(e) => setConfig({ ...config, site_description: e.target.value })}
            className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Analytics & AdSense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">معرّف Google Analytics (إن وجد)</label>
          <input
            type="text"
            placeholder="G-XXXXXXXXXX"
            value={config.ga_id || ''}
            onChange={(e) => setConfig({ ...config, ga_id: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">معرّف Google AdSense (إن وجد)</label>
          <input
            type="text"
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            value={config.adsense_id || ''}
            onChange={(e) => setConfig({ ...config, adsense_id: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* نص الحقوق */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">نص الحقوق التذييلي (Footer Text)</label>
        <input
          type="text"
          value={config.footer_text || ''}
          onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
        />
      </div>

      <hr className="border-border/60 my-4" />

      {/* وضع الصيانة */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#D4AF37]">حالة التشغيل والصيانة</h4>
        <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl border border-border/60">
          <div>
            <div className="font-semibold text-sm">وضع الصيانة الكامل</div>
            <div className="text-xs text-muted-foreground">عند تفعيله، سيتم إغلاق الواجهة الأمامية للزوار وعرض صفحة صيانة</div>
          </div>
          <button
            type="button"
            onClick={() => setConfig({ ...config, maintenance_mode: !config.maintenance_mode })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              config.maintenance_mode
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-muted text-foreground border border-border'
            }`}
          >
            {config.maintenance_mode ? 'مفعل (الموقع مغلق)' : 'معطل (الموقع يعمل)'}
          </button>
        </div>
      </div>

      {/* زر الحفظ */}
      <button
        type="submit"
        className="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-md mt-4"
      >
        حفظ كل التغييرات والإعدادات
      </button>
    </form>
  );
}

// ==================== تبويب رسائل التواصل الكامل ====================
function MessagesTab() {
  const cfg = useAdminApi();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    axios.get(`${API}/admin/messages`, cfg)
      .then((r) => setMessages(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('هل تريد حذف هذه الرسالة؟')) return;
    try {
      await axios.delete(`${API}/admin/messages/${id}`, cfg);
      toast.success('تم حذف الرسالة بنجاح');
      load();
    } catch {
      toast.error('تعذّر حذف الرسالة');
    }
  };

  const filteredMessages = messages.filter(m => 
    (m.name && m.name.toLowerCase().includes(search.toLowerCase())) ||
    (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
    (m.subject && m.subject.toLowerCase().includes(search.toLowerCase())) ||
    (m.message && m.message.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-[#D4AF37]" />
          <div>
            <h3 className="text-lg font-bold">رسائل التواصل الواردة ({messages.length})</h3>
            <p className="text-xs text-muted-foreground">إدارة وتصفح كافة الرسائل المستقبلة من نموذج اتصل بنا</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في الرسائل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pr-9 pl-4 py-1.5 text-sm outline-none focus:border-[#D4AF37]"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={load} title="تحديث"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">جاري تحميل الرسائل...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Mail className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">لا توجد رسائل واردة حالياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm hover:border-[#D4AF37]/40 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] font-bold grid place-items-center text-sm">
                    {m.name ? m.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-base leading-tight">{m.name}</div>
                    <a href={`mailto:${m.email}`} className="text-xs text-muted-foreground hover:text-[#D4AF37]" dir="ltr">{m.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                    {m.created_at ? new Date(m.created_at).toLocaleString('ar-SA') : 'منذ فترة'}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => del(m.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {m.subject && (
                <div className="font-semibold text-sm text-[#D4AF37] flex items-center gap-1.5">
                  <span>الموضوع:</span>
                  <span>{m.subject}</span>
                </div>
              )}
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-xl border border-border/40">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
