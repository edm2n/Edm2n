import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GamepadTester from './GamepadTester';

export default function UniversalWidget({ apiUrl, slug }) {
  // 1. استدعاء جميع الـ Hooks في البداية دائماً وقبل أي شرط
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. جلب البيانات التفاعلية من الـ API (مع تجاهل الـ Fetch لأداة اليد)
  useEffect(() => {
    if (!apiUrl || slug === 'gamepad-tester') return;

    setLoading(true);
    setError(null);

    axios.get(apiUrl)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("تعذر جلب البيانات الحية من الرابط المحدد.");
        setLoading(false);
      });
  }, [apiUrl, slug]);

  // 3. التحقق من الـ slug واسترجاع المكون المخصص (بعد تعريف الـ Hooks بسلام)
  switch (slug) {
    case 'gamepad-tester':
      return <GamepadTester />;
  }

  // حالة التحميل (Loading State)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/90 text-emerald-400 rounded-3xl border border-slate-800 my-6 shadow-2xl">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wide">جاري بناء الواجهة التفاعلية الحية...</p>
      </div>
    );
  }

  // حالة الخطأ (Error State)
  if (error) {
    return (
      <div className="p-8 bg-slate-900 text-red-400 rounded-3xl border border-red-900/30 text-center my-6 shadow-xl">
        <p className="font-bold text-lg mb-2">⚠️ حدث خطأ أثناء الاتصال</p>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // 4. دالة التفكيك التفاعلي الذكي (Dynamic Rendering)
  const renderInteractiveData = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return <span className="text-emerald-400 font-bold dir-ltr inline-block">{String(obj)}</span>;
    }

    if (Array.isArray(obj)) {
      const filteredList = obj.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filteredList.length === 0) {
        return <div className="p-4 text-center text-gray-500 text-sm">لا توجد نتائج تطابق بحثك.</div>;
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredList.slice(0, 18).map((item, idx) => (
            <div 
              key={idx} 
              className="p-5 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-200 shadow-md flex flex-col justify-between"
            >
              {renderInteractiveData(item)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3 w-full">
        {Object.entries(obj).map(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            return (
              <div key={key} className="mt-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                <h4 className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  {key}
                </h4>
                {renderInteractiveData(val)}
              </div>
            );
          }

          if (typeof val === 'string' && val.match(/\.(jpeg|jpg|gif|png|svg)$/i)) {
            return (
              <div key={key} className="my-2 text-center">
                <img src={val} alt={key} className="max-h-40 mx-auto rounded-lg object-contain border border-slate-700" />
              </div>
            );
          }

          return (
            <div key={key} className="flex justify-between items-center p-2.5 bg-slate-800/40 rounded-lg text-sm border border-slate-700/20">
              <span className="text-gray-400 font-medium capitalize">{key}</span>
              <span className="text-emerald-300 font-bold dir-ltr">{String(val)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl max-w-6xl mx-auto my-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            أداة حية تفاعلية
          </h2>
          <p className="text-xs text-gray-400 mt-1 dir-ltr truncate max-w-md">{apiUrl}</p>
        </div>

        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="🔍 بحث سريع في البيانات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-slate-800 text-sm rounded-xl border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="mt-4">
        {renderInteractiveData(data)}
      </div>
    </div>
  );
}