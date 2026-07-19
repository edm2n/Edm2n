// Admin Panel - login + manage pages + tools + config
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Input, Button } from '../lib/ui';
import { TOOLS } from '../lib/toolsRegistry';
import { LogOut, Trash2, Eye, EyeOff, Plus, Save } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'admin_token';

function useAdminApi() {
  const token = localStorage.getItem(TOKEN_KEY);
  const cfg = { headers: { Authorization: `Bearer ${token}` } };
  return cfg;
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [tab, setTab] = useState('pages');
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
        <Button testid="admin-logout" variant="ghost" onClick={logout}><LogOut className="h-4 w-4" /> خروج</Button>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          ['pages', 'الصفحات المخصصة'],
          ['tools', 'إدارة الأدوات'],
          ['config', 'الإعدادات'],
          ['messages', 'رسائل التواصل'],
        ].map(([k, v]) => (
          <button key={k} onClick={() => setTab(k)} data-testid={`admin-tab-${k}`} className={`rounded-full px-4 py-2 text-sm font-medium ${tab === k ? 'bg-[#D4AF37] text-black' : 'border border-border'}`}>
            {v}
          </button>
        ))}
      </div>

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
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">تسجيل دخول المدير</h1>
        <form onSubmit={submit} className="space-y-4">
          <Input testid="admin-username" label="اسم المستخدم" value={u} onChange={(e) => setU(e.target.value)} dir="ltr" autoComplete="username" />
          <Input testid="admin-password" label="كلمة المرور" type="password" value={p} onChange={(e) => setP(e.target.value)} dir="ltr" autoComplete="current-password" />
          <Button testid="admin-login" type="submit" disabled={loading}>{loading ? '...' : 'دخول'}</Button>
        </form>
      </div>
    </div>
  );
}

function PagesTab() {
  const cfg = useAdminApi();
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => axios.get(`${API}/admin/pages`, cfg).then((r) => setPages(r.data));
  useEffect(() => { load(); }, []);

  const empty = { slug: '', title: '', content: '', published: true };

  const save = async (page) => {
    try {
      if (page.id) await axios.put(`${API}/admin/pages/${page.id}`, page, cfg);
      else await axios.post(`${API}/admin/pages`, page, cfg);
      toast.success('تم الحفظ');
      setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || 'فشل الحفظ'); }
  };

  const del = async (id) => {
    if (!confirm('هل تريد حذف هذه الصفحة؟')) return;
    await axios.delete(`${API}/admin/pages/${id}`, cfg);
    toast.success('تم الحذف'); load();
  };

  if (editing) return <PageEditor page={editing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div className="space-y-4">
      <Button testid="admin-new-page" onClick={() => setEditing(empty)}><Plus className="h-4 w-4" /> صفحة جديدة</Button>
      {pages.map((p) => (
        <div key={p.id} className="rounded-2xl border border-border p-4 flex items-center justify-between" data-testid={`admin-page-${p.slug}`}>
          <div>
            <div className="font-bold">{p.title}</div>
            <div className="text-sm text-muted-foreground" dir="ltr">/p/{p.slug} — {p.published ? 'منشورة' : 'مسودة'}</div>
          </div>
          <div className="flex gap-2">
            <Button testid={`admin-edit-${p.slug}`} variant="ghost" onClick={() => setEditing(p)}>تعديل</Button>
            <Button testid={`admin-del-${p.slug}`} variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
      {pages.length === 0 && <p className="text-muted-foreground text-center py-8">لا توجد صفحات بعد</p>}
    </div>
  );
}

function PageEditor({ page, onSave, onCancel }) {
  const [p, setP] = useState(page);
  return (
    <div className="space-y-4 rounded-2xl border border-border p-6 bg-card">
      <Input testid="pe-slug" label="الرابط (بالإنجليزية، مثال: my-article)" value={p.slug} onChange={(e) => setP({ ...p, slug: e.target.value })} dir="ltr" />
      <Input testid="pe-title" label="العنوان" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">المحتوى (يدعم Markdown البسيط)</span>
        <textarea data-testid="pe-content" value={p.content} onChange={(e) => setP({ ...p, content: e.target.value })} rows={12} className="w-full rounded-xl border border-input bg-background px-4 py-3 leading-loose" />
      </label>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={p.published} onChange={(e) => setP({ ...p, published: e.target.checked })} data-testid="pe-published" />
        منشورة
      </label>
      <div className="flex gap-2">
        <Button testid="pe-save" onClick={() => onSave(p)}><Save className="h-4 w-4" /> حفظ</Button>
        <Button testid="pe-cancel" variant="ghost" onClick={onCancel}>إلغاء</Button>
      </div>
    </div>
  );
}

function ToolsTab() {
  const cfg = useAdminApi();
  const [overrides, setOverrides] = useState({});
  const [q, setQ] = useState('');

  const load = () => axios.get(`${API}/tools/overrides`).then((r) => {
    setOverrides(Object.fromEntries(r.data.map((o) => [o.slug, o])));
  });
  useEffect(() => { load(); }, []);

  const save = async (slug, patch) => {
    const current = overrides[slug] || { slug, hidden: false, name: null, desc: null, featured: false };
    const merged = { ...current, ...patch };
    try {
      await axios.put(`${API}/admin/tools/${slug}`, merged, cfg);
      setOverrides({ ...overrides, [slug]: merged });
      toast.success('تم الحفظ');
    } catch { toast.error('فشل الحفظ'); }
  };

  const list = TOOLS.filter((t) => !q || t.name.includes(q) || t.slug.includes(q));

  return (
    <div className="space-y-4">
      <Input testid="admin-tools-search" placeholder="ابحث عن أداة" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="space-y-2 max-h-[70vh] overflow-y-auto">
        {list.map((t) => {
          const o = overrides[t.slug];
          const hidden = o?.hidden;
          return (
            <div key={t.slug} className="flex items-center justify-between rounded-xl border border-border p-3" data-testid={`admin-tool-${t.slug}`}>
              <div>
                <div className="font-semibold">{o?.name || t.name}</div>
                <div className="text-xs text-muted-foreground" dir="ltr">{t.slug}</div>
              </div>
              <div className="flex gap-2">
                <button data-testid={`admin-tool-toggle-${t.slug}`} onClick={() => save(t.slug, { hidden: !hidden })} className={`rounded-lg border border-border p-2 ${hidden ? 'text-muted-foreground' : 'text-[#D4AF37]'}`}>
                  {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConfigTab() {
  const cfg = useAdminApi();
  const [config, setConfig] = useState({ ga_id: '', editor_picks: [] });
  const [picksText, setPicksText] = useState('');

  useEffect(() => {
    axios.get(`${API}/admin/config`, cfg).then((r) => {
      setConfig(r.data);
      setPicksText((r.data.editor_picks || []).join(', '));
    });
  }, []);

  const save = async () => {
    const picks = picksText.split(',').map((s) => s.trim()).filter(Boolean);
    const body = { ...config, editor_picks: picks };
    try {
      await axios.put(`${API}/admin/config`, body, cfg);
      toast.success('تم حفظ الإعدادات (قد تحتاج تحديث الصفحة الرئيسية)');
    } catch { toast.error('فشل الحفظ'); }
  };

  return (
    <div className="space-y-4">
      <Input testid="cf-ga" label="Google Analytics ID (مثال: G-XXXXXXX)" value={config.ga_id} onChange={(e) => setConfig({ ...config, ga_id: e.target.value })} dir="ltr" />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">قائمة "اخترنا لكم" (slugs مفصولة بفاصلة)</span>
        <textarea data-testid="cf-picks" value={picksText} onChange={(e) => setPicksText(e.target.value)} rows={3} dir="ltr" className="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm" placeholder="zakat, prayer-times, gold-price, currency" />
        <span className="mt-1 block text-xs text-muted-foreground">استخدم slug الأداة (مثال: zakat, prayer-times). راجع قائمة الأدوات في تبويب "إدارة الأدوات".</span>
      </label>
      <Button testid="cf-save" onClick={save}><Save className="h-4 w-4" /> حفظ الإعدادات</Button>
    </div>
  );
}

function MessagesTab() {
  const cfg = useAdminApi();
  const [msgs, setMsgs] = useState([]);
  useEffect(() => { axios.get(`${API}/admin/contacts`, cfg).then((r) => setMsgs(r.data)); }, []);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{msgs.length} رسالة</p>
      {msgs.map((m) => (
        <div key={m.id} className="rounded-2xl border border-border p-4" data-testid={`msg-${m.id}`}>
          <div className="flex justify-between mb-2">
            <b>{m.name}</b>
            <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString('ar-SA')}</span>
          </div>
          <a href={`mailto:${m.email}`} className="text-sm text-[#D4AF37]" dir="ltr">{m.email}</a>
          <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
        </div>
      ))}
    </div>
  );
}
