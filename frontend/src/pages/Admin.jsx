// Admin Panel - login + manage pages + tools + config
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Input, Button } from '../lib/ui';
import { TOOLS, TOOL_MAP } from '../lib/toolsRegistry';
import { LogOut, Trash2, Eye, EyeOff, Plus, Save, BarChart3, Users, FileText, Wrench, Wand2, Sparkles, ExternalLink, Image as ImageIcon } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = 'admin_token';

function useAdminApi() {
  const token = localStorage.getItem(TOKEN_KEY);
  const cfg = { headers: { Authorization: `Bearer ${token}` } };
  return cfg;
}

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
        <Button testid="admin-logout" variant="ghost" onClick={logout}><LogOut className="h-4 w-4" /> خروج</Button>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          ['stats', 'الإحصائيات'],
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
  const [fetchQuery, setFetchQuery] = useState('');
  const [fetching, setFetching] = useState(false);

  const load = () => axios.get(`${API}/admin/pages`, cfg).then((r) => setPages(r.data));
  useEffect(() => { load(); }, []);

  const empty = { slug: '', title: '', content: '', excerpt: '', image: '', source_url: '', published: true };

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

  const smartFetch = async () => {
    if (!fetchQuery.trim()) { toast.error('أدخل رابطاً أو كلمة مفتاحية'); return; }
    setFetching(true);
    try {
      const r = await axios.post(`${API}/admin/smart-fetch`, { query: fetchQuery }, cfg);
      setEditing({
        slug: r.data.slug,
        title: r.data.title,
        content: r.data.content + (r.data.source_url ? `\n\n---\n\n*المصدر: [${r.data.source_url}](${r.data.source_url})*` : ''),
        excerpt: r.data.excerpt,
        image: r.data.image,
        source_url: r.data.source_url,
        published: true,
      });
      toast.success('تم جلب المحتوى — راجعه ثم احفظ');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'تعذّر الجلب');
    } finally { setFetching(false); }
  };

  const smartFetchAndSave = async () => {
    if (!fetchQuery.trim()) { toast.error('أدخل رابطاً أو كلمة مفتاحية'); return; }
    if (!confirm('سيتم الجلب وحفظه ونشره مباشرة. متابعة؟')) return;
    setFetching(true);
    try {
      const r = await axios.post(`${API}/admin/smart-fetch-save`, { query: fetchQuery, publish: true }, cfg);
      toast.success(`تم النشر: ${r.data.title}`);
      setFetchQuery(''); load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'تعذّر الجلب والنشر');
    } finally { setFetching(false); }
  };

  if (editing) return <PageEditor page={editing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div className="space-y-4">
      {/* Smart Fetch */}
      <div className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 bg-[#D4AF37]/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <h3 className="font-bold">جلب ذكي (Smart Fetcher)</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          الصق رابط مقال، أو اكتب كلمة مفتاحية — سنجلب لك العنوان والمحتوى والصورة تلقائياً بعد تنظيفه من الإعلانات.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            data-testid="admin-fetch-input"
            value={fetchQuery}
            onChange={(e) => setFetchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && smartFetch()}
            placeholder="مثال: https://example.com/article  أو  فوائد القهوة"
            dir="auto"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 outline-none focus:border-[#D4AF37]"
          />
          <Button testid="admin-fetch-preview" onClick={smartFetch} disabled={fetching}>
            <Wand2 className="h-4 w-4" /> {fetching ? 'جاري الجلب...' : 'جلب ذكي'}
          </Button>
          <Button testid="admin-fetch-publish" variant="ghost" onClick={smartFetchAndSave} disabled={fetching}>
            جلب ونشر مباشر
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">صفحاتك المخصصة ({pages.length})</h3>
        <Button testid="admin-new-page" onClick={() => setEditing(empty)}><Plus className="h-4 w-4" /> صفحة يدوياً</Button>
      </div>

      {pages.map((p) => (
        <div key={p.id} className="rounded-2xl border border-border p-4 flex items-center justify-between gap-3" data-testid={`admin-page-${p.slug}`}>
          {p.image ? (
            <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0" onError={(e) => e.target.style.display = 'none'} />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-muted grid place-items-center shrink-0"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{p.title}</div>
            <div className="text-xs text-muted-foreground truncate" dir="ltr">/p/{p.slug} — {p.published ? 'منشورة' : 'مسودة'}</div>
            {p.source_url && (
              <a href={p.source_url} target="_blank" rel="noreferrer" className="text-xs text-[#D4AF37] inline-flex items-center gap-1" dir="ltr">
                <ExternalLink className="h-3 w-3" /> المصدر
              </a>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button testid={`admin-edit-${p.slug}`} variant="ghost" onClick={() => setEditing(p)}>تعديل</Button>
            <Button testid={`admin-del-${p.slug}`} variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
      {pages.length === 0 && <p className="text-muted-foreground text-center py-8">لا توجد صفحات بعد — جرّب الجلب الذكي أو أنشئ صفحة يدوياً</p>}
    </div>
  );
}

function PageEditor({ page, onSave, onCancel }) {
  const [p, setP] = useState(page);
  const [preview, setPreview] = useState(false);
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!preview) return;
    (async () => {
      const { marked } = await import('marked');
      const DOMPurify = (await import('dompurify')).default;
      marked.setOptions({ gfm: true, breaks: true });
      setHtml(DOMPurify.sanitize(marked.parse(p.content || '')));
    })();
  }, [preview, p.content]);

  const insertSnippet = (before, after = '') => {
    setP({ ...p, content: (p.content || '') + '\n' + before + 'اكتب هنا' + after });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border p-6 bg-card">
      <Input testid="pe-slug" label="الرابط (بالإنجليزية أو العربية، مثال: my-article)" value={p.slug} onChange={(e) => setP({ ...p, slug: e.target.value })} dir="ltr" />
      <Input testid="pe-title" label="العنوان" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} />
      <Input testid="pe-image" label="رابط الصورة البارزة (اختياري)" value={p.image || ''} onChange={(e) => setP({ ...p, image: e.target.value })} dir="ltr" placeholder="https://..." />
      {p.image && (
        <img src={p.image} alt="" className="rounded-2xl max-h-48 object-cover" onError={(e) => e.target.style.display = 'none'} />
      )}
      <Input testid="pe-excerpt" label="مقتطف قصير (يظهر في الصفحة الرئيسية)" value={p.excerpt || ''} onChange={(e) => setP({ ...p, excerpt: e.target.value })} placeholder="١-٢ جملة تصف الموضوع" />

      {/* Markdown toolbar shortcuts */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          ['# عنوان كبير', '# '],
          ['## عنوان', '## '],
          ['**غامق**', '**', '**'],
          ['*مائل*', '*', '*'],
          ['- قائمة', '- '],
          ['1. مرقّمة', '1. '],
          ['[رابط](url)', '[', '](https://example.com)'],
          ['> اقتباس', '> '],
          ['`كود`', '`', '`'],
          ['خط فاصل', '\n---\n'],
        ].map(([label, b, a]) => (
          <button key={label} type="button" onClick={() => insertSnippet(b, a || '')} data-testid={`pe-md-${label}`} className="rounded-lg border border-border px-2 py-1 hover:border-[#D4AF37]">
            {label}
          </button>
        ))}
        <button type="button" onClick={() => setPreview(!preview)} data-testid="pe-preview" className={`rounded-lg px-3 py-1 font-semibold ${preview ? 'bg-[#D4AF37] text-black' : 'border border-border'}`}>
          {preview ? 'تحرير' : 'معاينة'}
        </button>
      </div>

      {!preview ? (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">المحتوى (Markdown مدعوم — استخدم الأزرار أعلاه)</span>
          <textarea data-testid="pe-content" value={p.content} onChange={(e) => setP({ ...p, content: e.target.value })} rows={16} className="w-full rounded-xl border border-input bg-background px-4 py-3 leading-loose font-mono text-sm" />
        </label>
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 p-5">
          <div className="text-xs text-muted-foreground mb-2">معاينة</div>
          <div className="markdown-content leading-loose" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}

      <details className="text-sm rounded-xl border border-border p-3">
        <summary className="cursor-pointer font-semibold">دليل Markdown السريع</summary>
        <pre className="mt-3 text-xs whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed" dir="ltr">
{`# عنوان رئيسي
## عنوان فرعي
### عنوان أصغر

**نص غامق**    *نص مائل*    ~~محذوف~~

- قائمة نقطية
- عنصر آخر

1. قائمة مرقّمة
2. عنصر ثانٍ

[نص الرابط](https://example.com)

> اقتباس مميّز

\`كود قصير\`

---  (خط فاصل)

| عمود ١ | عمود ٢ |
|--------|--------|
| قيمة | قيمة |
`}
        </pre>
      </details>

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

function StatCard({ label, value, sub, icon: Icon, testid }) {
  return (
    <div data-testid={testid} className="rounded-2xl border border-border p-5 bg-card">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="h-5 w-5 text-[#D4AF37]" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-black text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function StatsTab() {
  const cfg = useAdminApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    axios.get(`${API}/admin/stats`, cfg).then((r) => setStats(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-muted-foreground text-center py-8">جاري تحميل الإحصائيات...</p>;
  if (!stats) return <p className="text-destructive">تعذّر تحميل الإحصائيات</p>;

  const maxDaily = Math.max(1, ...(stats.contacts_daily || []).map((d) => d.count));

  return (
    <div className="space-y-6" data-testid="stats-container">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard testid="stat-views" label="مجموع مشاهدات الأدوات" value={stats.total_views.toLocaleString('ar-SA')} sub={`${stats.total_tools_tracked} أداة مُتَتبَّعة`} icon={BarChart3} />
        <StatCard testid="stat-contacts-total" label="إجمالي الرسائل" value={stats.contacts.total} icon={Users} />
        <StatCard testid="stat-contacts-week" label="رسائل آخر ٧ أيام" value={stats.contacts.last_7d} sub={`${stats.contacts.last_30d} خلال آخر ٣٠ يوم`} icon={Users} />
        <StatCard testid="stat-pages" label="الصفحات المخصصة" value={stats.total_pages} icon={FileText} />
      </div>

      {/* Contacts daily bar chart */}
      <div className="rounded-2xl border border-border p-5 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-[#D4AF37]" />
          <h3 className="font-semibold">رسائل التواصل — آخر ١٤ يوماً</h3>
        </div>
        {stats.contacts_daily.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">لا توجد رسائل بعد</p>
        ) : (
          <div className="flex items-end gap-2 h-40" data-testid="stats-daily-chart">
            {stats.contacts_daily.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
                <div className="text-xs text-[#D4AF37] font-semibold">{d.count}</div>
                <div className="w-full bg-[#D4AF37] rounded-t-lg" style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: 2 }} />
                <div className="text-[10px] text-muted-foreground" dir="ltr">{d.date.slice(5)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top tools */}
      <div className="rounded-2xl border border-border p-5 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5 text-[#D4AF37]" />
          <h3 className="font-semibold">الأدوات الأكثر زيارة</h3>
        </div>
        {stats.top_tools.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات زيارات بعد</p>
        ) : (
          <ol className="space-y-2" data-testid="stats-top-tools">
            {stats.top_tools.map((t, i) => {
              const tool = TOOL_MAP[t.slug];
              const name = tool?.name || t.slug;
              const maxCount = stats.top_tools[0].count;
              const pct = (t.count / maxCount) * 100;
              return (
                <li key={t.slug} data-testid={`stats-top-${t.slug}`} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${i < 3 ? 'bg-[#D4AF37] text-black' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                      <span className="font-semibold truncate">{name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#D4AF37] tabular-nums">{t.count.toLocaleString('ar-SA')}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37]" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
