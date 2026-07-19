// AI-powered tools (via backend Emergent LLM)
import React, { useState } from 'react';
import axios from 'axios';
import { Input, Select, Button, ResultBox } from '../lib/ui';
import { toast } from 'sonner';
import { Sparkles, Copy, Wand2, Stethoscope, Wrench, Palette, GraduationCap, Briefcase, Camera, Code, ChefHat } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BIO_TEMPLATES = [
  { id: 'doctor',     label: 'طبيب',       icon: Stethoscope, job: 'طبيب متخصص',        skills: 'الطب العام، متابعة المرضى، التشخيص الدقيق' },
  { id: 'engineer',   label: 'مهندس',      icon: Wrench,      job: 'مهندس',              skills: 'حل المشكلات، إدارة المشاريع، العمل الجماعي' },
  { id: 'designer',   label: 'مصمم',       icon: Palette,     job: 'مصمم UI/UX',          skills: 'Figma، تجربة المستخدم، الهوية البصرية' },
  { id: 'student',    label: 'طالب',       icon: GraduationCap, job: 'طالب جامعي',        skills: 'البحث، التعلم الذاتي، القراءة' },
  { id: 'business',   label: 'رجل أعمال',  icon: Briefcase,   job: 'رائد أعمال',          skills: 'ريادة الأعمال، القيادة، التسويق' },
  { id: 'photog',     label: 'مصور',       icon: Camera,      job: 'مصور فوتوغرافي',      skills: 'التصوير، المونتاج، السرد البصري' },
  { id: 'developer',  label: 'مطوّر',      icon: Code,        job: 'مطوّر ويب',           skills: 'React، Node.js، تجربة المستخدم' },
  { id: 'chef',       label: 'شيف',        icon: ChefHat,     job: 'طاهٍ محترف',          skills: 'الأكلات العربية، الحلويات، الابتكار في الطعام' },
];

export function AiBio() {
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [skills, setSkills] = useState('');
  const [tone, setTone] = useState('professional');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [tplId, setTplId] = useState('');

  const applyTemplate = (t) => {
    setTplId(t.id);
    setJob(t.job);
    setSkills(t.skills);
    toast.success(`تم اختيار قالب: ${t.label}`);
  };

  const gen = async () => {
    if (!name.trim() || !job.trim()) {
      toast.error('يرجى إدخال الاسم والمسمى الوظيفي');
      return;
    }
    setLoading(true); setBio('');
    try {
      const r = await axios.post(`${API}/ai/bio`, { name, job, skills, tone });
      setBio(r.data.bio);
    } catch (e) {
      toast.error('تعذّر توليد البايو، حاول مجدداً');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Templates */}
      <div>
        <div className="text-sm font-medium mb-2">اختر قالباً جاهزاً (اختياري):</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BIO_TEMPLATES.map((t) => {
            const Icon = t.icon;
            const active = tplId === t.id;
            return (
              <button
                key={t.id}
                data-testid={`bio-tpl-${t.id}`}
                onClick={() => applyTemplate(t)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-sm transition-colors ${
                  active ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-border hover:border-[#D4AF37]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input testid="bio-name" label="الاسم" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد الشمري" />
        <Input testid="bio-job" label="المسمى الوظيفي / المجال" value={job} onChange={(e) => setJob(e.target.value)} placeholder="مثال: مصمم UX / مطور ويب" />
      </div>
      <Input testid="bio-skills" label="المهارات والاهتمامات (اختياري)" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="مثال: React، القراءة، السفر" />
      <Select testid="bio-tone" label="نبرة الكتابة" value={tone} onChange={(e) => setTone(e.target.value)}>
        <option value="professional">احترافية</option>
        <option value="friendly">ودّية</option>
        <option value="creative">إبداعية</option>
      </Select>
      <Button testid="bio-gen" onClick={gen} disabled={loading}>
        <Wand2 className="h-4 w-4" />
        {loading ? 'جاري التوليد...' : 'ولّد البايو'}
      </Button>
      {bio && (
        <div data-testid="bio-result" className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 p-5 whitespace-pre-line leading-loose text-lg">
          {bio}
          <Button testid="bio-copy" variant="ghost" onClick={() => { navigator.clipboard.writeText(bio); toast.success('تم النسخ'); }} className="mt-4">
            <Copy className="h-4 w-4" /> انسخ البايو
          </Button>
        </div>
      )}
    </div>
  );
}
