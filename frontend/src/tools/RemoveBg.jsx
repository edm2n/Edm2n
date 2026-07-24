import React, { useState } from 'react';
import { Sparkles, Download, Upload, Loader2, ShieldCheck } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

export default function RemoveBgTool() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("الرجاء اختيار ملف صورة صالح (PNG, JPG, WebP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت للمعالجة في المتصفح.");
        return;
      }

      setSelectedImage(URL.createObjectURL(file));
      setResultImage(null);
      setError("");
      processImageLocally(file);
    }
  };

  const processImageLocally = async (file) => {
    setLoading(true);
    setError("");
    setProgressText("جاري تحضير محرك الذكاء الاصطناعي (قد يستغرق وقتاً في المرة الأولى)...");

    try {
      // إعدادات محسنة لاختيار نموذج أعلى دقة للحفاظ على تفاصيل الملابس والأطراف
      const config = {
        // يمكنك التجربة بين 'medium' أو 'large' للحصول على دقة أعلى في تفاصيل الشعر والملابس
        model: 'medium', 
        progress: (key, current, total) => {
          if (total) {
            const percent = Math.round((current / total) * 100);
            setProgressText(`جاري المعالجة الذكية: ${percent}% (${key})`);
          } else {
            setProgressText(`جاري المعالجة: ${key}...`);
          }
        },
      };

      const blob = await removeBackground(file, config);
      const url = URL.createObjectURL(blob);
      setResultImage(url);
      setProgressText("اكتملت العملية!");
    } catch (err) {
      console.error("WASM Error:", err);
      setError(`تعذر إزالة الخلفية. تأكد من أن المتصفح يدعم WebAssembly وأن الصورة واضحة. التفاصيل: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgressText(""), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-xl text-right transition-colors" dir="rtl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">إزالة الخلفية (محلياً في المتصفح)</h2>
        <p className="text-sm text-muted-foreground">تتم المعالجة باستخدام جهازك مباشرة. لا يتم رفع الصورة للسيرفر.</p>
        
        {/* عبارة الأمان مع تأثير الوميض */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary/15 border border-primary/30 rounded-full text-xs text-primary font-bold shadow-sm animate-pulse">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>اطمئن، الصور لا تغادر جهازك أبداً؛ فالأداة تعمل 100% داخل متصفحك للحفاظ على خصوصيتك وأمان بياناتك بخصوصية تامة.</span>
        </div>
      </div>

      {!selectedImage && (
        <div className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-12 text-center transition-all cursor-pointer bg-background/50 hover:bg-primary/5">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageChange}
            className="hidden"
            id="rembg-upload"
          />
          <label htmlFor="rembg-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-full">
              <Upload className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground block mb-1">اضغط للرفع أو اسحب الصورة هنا</span>
              <span className="text-xs text-muted-foreground">يدعم PNG, JPG, WebP (الحد الأقصى 10 ميجا)</span>
            </div>
          </label>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-16 bg-background/80 rounded-2xl border border-border space-y-5 shadow-inner">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <div className="text-center">
            <p className="text-base font-bold text-foreground">جاري إزالة الخلفية بواسطة متصفحك...</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm">{progressText}</p>
            <p className="text-[10px] text-amber-600 mt-4">* قد تستغرق المعالجة وقتاً أطول في المرة الأولى لتحميل ملفات الذكاء الاصطناعي للمتصفح.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl text-center font-medium flex items-center gap-2 justify-center">
          <Sparkles className='w-4 h-4'/>
          {error}
        </div>
      )}

      {selectedImage && resultImage && !loading && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-background border border-border rounded-2xl">
              <p className="text-xs text-muted-foreground mb-2 text-center">الصورة الأصلية</p>
              <div className="flex items-center justify-center h-64 overflow-hidden rounded-lg">
                <img src={selectedImage} alt="Original" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
            
            <div className="p-4 bg-background border border-border rounded-2xl relative overflow-hidden">
              <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-full flex items-center gap-1.5 border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                <span>معالجة محلية بالكامل</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 text-center">النتيجة (بدون خلفية)</p>
              <div className="flex items-center justify-center h-64 rounded-lg" 
                   style={{ backgroundImage: 'linear-gradient(45deg, #e6e6e6 25%, transparent 25%), linear-gradient(-45deg, #e6e6e6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e6e6e6 75%), linear-gradient(-45deg, transparent 75%, #e6e6e6 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10, 10px -10px, -10px 0px' }}>
                <img src={resultImage} alt="Result" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border">
            <button
              onClick={() => { setSelectedImage(null); setResultImage(null); setError(""); }}
              className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold rounded-xl transition-all cursor-pointer"
            >
              رفع صورة أخرى
            </button>
            <a
              href={resultImage}
              download="removed-bg-secure.png"
              className="px-10 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer text-lg"
            >
              <Download className="w-5 h-5" />
              <span>تحميل الصورة الشفافة (PNG)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}