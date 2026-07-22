import React, { useState } from 'react';
import { Volume2, Loader2, Sparkles, Play } from 'lucide-react';

export default function TextToSpeechTool() {
  const [text, setText] = useState("أهلاً بكم مجدداً في البرنامج. سنتحدث اليوم عن كيف يمكن للعادة الصغيرة أن تُحدث تغييرات كبيرة مع مرور الوقت.");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("الرجاء إدخال نص لتحويله");
      return;
    }

    setLoading(true);
    setError("");
    setAudioUrl(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("فشل توليد الصوت من السيرفر");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال، يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl text-right" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl">
          <Volume2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">تحويل النص إلى صوت طبيعي</h2>
          <p className="text-sm text-slate-400">استمتع بصوت بشري نقي وعالي الجودة فوراً</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            أدخل النص المراد تحويله:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full p-4 bg-slate-950/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
            placeholder="اكتب النص هنا..."
            maxLength={400}
          />
          <div className="text-xs text-slate-500 mt-1 text-left">{text.length}/400 حرف</div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري توليد الصوت الطبيعي...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>توليد واستماع الصوت</span>
            </>
          )}
        </button>

        {audioUrl && (
          <div className="mt-6 p-4 bg-slate-950 border border-purple-500/30 rounded-xl animate-fade-in">
            <p className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4" /> الصوت جاهز الآن بنبرة طبيعية:
            </p>
            <audio controls autoPlay src={audioUrl} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}