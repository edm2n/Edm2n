import React, { useState } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function RemoveBg() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('يرجى اختيار صورة صالحة (PNG, JPG, WEBP)');
      return;
    }
    setError(null);
    setProcessedImage(null);
    
    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);

    processRemoveBg(file);
  };

  const processRemoveBg = async (file) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API}/remove-bg`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'فشلت معالجة الصورة');
      }

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);
      setProcessedImage(resultUrl);
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء إزالة الخلفية. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {!originalImage && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
          }}
          className="rounded-2xl border-2 border-dashed border-[#D4AF37]/40 p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 hover:border-[#D4AF37]"
        >
          <label className="cursor-pointer">
            <span className="inline-block px-6 py-2.5 bg-[#D4AF37] text-black font-semibold text-sm rounded-xl hover:opacity-90 transition-all shadow">
              تفريغ صورة
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
          </label>
          <p className="text-xs text-muted-foreground font-medium">
            أو اسحب الصورة وضعها هنا
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs text-center font-medium">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center p-8 rounded-2xl border border-border/60 space-y-3">
          <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-muted-foreground font-medium">جاري تفريغ الصورة تلقائياً...</p>
        </div>
      )}

      {originalImage && !loading && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* المعاينة الأصلية */}
            <div className="rounded-2xl border border-border/60 p-4 flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-3 font-semibold">الصورة الأصلية</span>
              <div className="w-full h-56 flex items-center justify-center rounded-xl overflow-hidden bg-background border border-border/40">
                <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain" />
              </div>
            </div>

            {/* المعاينة المفرغة */}
            <div className="rounded-2xl border border-border/60 p-4 flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-3 font-semibold">بدون خلفية (PNG)</span>
              <div 
                className="w-full h-56 flex items-center justify-center rounded-xl overflow-hidden border border-border/40 bg-background"
                style={{
                  backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
                  backgroundSize: '12px 12px',
                }}
              >
                {processedImage ? (
                  <img src={processedImage} alt="Processed" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">تعذّرت المعالجة</span>
                )}
              </div>
            </div>

          </div>

          {/* أزرار الإجراءات بنفس ألوان ثيم موقعك الذهبي والرمادي الهادئ */}
          <div className="flex flex-wrap gap-3 items-center justify-center pt-2">
            {processedImage && (
              <a
                href={processedImage}
                download="removed-bg.png"
                className="px-6 py-2 bg-[#D4AF37] text-black text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow"
              >
                تحميل الصورة المفرغة
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                setOriginalImage(null);
                setProcessedImage(null);
              }}
              className="px-5 py-2 rounded-xl border border-border text-xs font-medium hover:bg-border/20 transition-all text-muted-foreground"
            >
              صورة أخرى
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RemoveBg;