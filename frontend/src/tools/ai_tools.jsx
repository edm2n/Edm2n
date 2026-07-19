// AI-powered tools (via backend Emergent LLM)
import React, { useState } from 'react';
import axios from 'axios';
import { Input, Select, Button, ResultBox } from '../lib/ui';
import { toast } from 'sonner';
import { Sparkles, Copy, Wand2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AiBio() {
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [skills, setSkills] = useState('');
  const [tone, setTone] = useState('professional');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

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
