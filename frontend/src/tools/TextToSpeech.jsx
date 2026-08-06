import React, { useState, useEffect } from 'react';
import { Volume2, Play, Square, ShieldCheck, Sparkles, Sliders, Zap } from 'lucide-react';

export default function TextToSpeechTool() {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      const sortedVoices = availableVoices.sort((a, b) => {
        const aIsArabic = a.lang.startsWith('ar');
        const bIsArabic = b.lang.startsWith('ar');
        if (aIsArabic !== bIsArabic) return bIsArabic - aIsArabic;

        const aIsNatural = a.name.includes('Natural') || a.name.includes('Google') || a.name.includes('Neural') || a.name.includes('Naayf') || a.name.includes('Zina');
        const bIsNatural = b.name.includes('Natural') || b.name.includes('Google') || b.name.includes('Neural') || b.name.includes('Naayf') || b.name.includes('Zina');
        return bIsNatural - aIsNatural;
      });

      setVoices(sortedVoices);

      const bestArabic = sortedVoices.find(v => v.lang.startsWith('ar'));

      if (bestArabic) {
        setSelectedVoice(bestArabic.name);
      } else if (sortedVoices.length > 0) {
        setSelectedVoice(sortedVoices[0].name);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const handleSpeak = () => {
    if (!text.trim()) return;

    if (!('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم خاصية النطق الصوتي.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 bg-card border border-border rounded-3xl shadow-2xl text-right transition-colors my-6" dir="rtl">
      
      {/* العنوان والشعار */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-primary/10 text-primary rounded-2xl mb-3 shadow-inner">
          <Volume2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-1">المحرك الصوتي الذكي</h2>
        <p className="text-xs text-muted-foreground">حول النصوص إلى كلام طبيعي وبشري مباشرة داخل متصفحك</p>
        
        <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-bold shadow-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>آمن تماماً: المعالجة تتم محلياً ولا يتم رفع بياناتك أبداً</span>
        </div>
      </div>

      <div className="space-y-5 mb-6">
        
        {/* صندوق النص */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب أو الصق النص هنا... (نصيحة: ضع علامات الترقيم كالفاصلة والنقطة لضبط النبرة الطبيعية)"
            className="w-full h-40 p-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none shadow-sm transition-all text-sm leading-relaxed"
          />
          <div className="absolute bottom-3 left-3 text-[11px] text-muted-foreground bg-card/80 px-2 py-1 rounded-md border border-border">
            {text.length} حرف
          </div>
        </div>

        {/* إعدادات الصوت والسرعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* اختيار الصوت */}
          <div className="p-4 bg-background/50 border border-border rounded-2xl space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>الصوت واللهجة المفضلة</span>
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang}) {voice.lang.startsWith('ar') ? '⭐ عربي' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* أزرار السرعة السريعة */}
          <div className="p-4 bg-background/50 border border-border rounded-2xl space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>سرعة القراءة</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0.8, 1.0, 1.2, 1.5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRate(s)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    rate === s 
                      ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                      : 'bg-background border border-border text-muted-foreground hover:bg-border/50'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* شريط التحكم في النبرة */}
        <div className="p-4 bg-background/50 border border-border rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-foreground">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span>حدة النبرة الصوتية</span>
            </span>
            <span className="text-primary font-mono">{pitch}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

      </div>

      {/* زر التشغيل والإيقاف الرئيسي */}
      <div>
        {!isSpeaking ? (
          <button
            onClick={handleSpeak}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl hover:scale-[1.01]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>ابدأ النطق الصوتي الآن</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-full py-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl animate-pulse"
          >
            <Square className="w-5 h-5 fill-current" />
            <span>إيقاف القراءة</span>
          </button>
        )}
      </div>

    </div>
  );
}
