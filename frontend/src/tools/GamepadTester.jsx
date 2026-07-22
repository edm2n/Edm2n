import React, { useState, useEffect, useRef } from 'react';

export default function GamepadTester() {
  const [pads, setPads] = useState([]);
  const [selectedPad, setSelectedPad] = useState(0);
  const canvasLRef = useRef(null);
  const canvasRRef = useRef(null);
  const requestRef = useRef(null);

  const clearCanvas = () => {
    [canvasLRef, canvasRRef].forEach((ref) => {
      if (ref.current) {
        const ctx = ref.current.getContext('2d');
        ctx.clearRect(0, 0, ref.current.width, ref.current.height);
      }
    });
  };

  // دالة لجلب لون الثيم الأساسي ديناميكياً للـ Canvas
  const getThemeColor = (cssVar, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const computed = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return computed ? computed : fallback;
  };

  const updateGamepads = () => {
    const rawPads = navigator.getGamepads ? navigator.getGamepads() : [];
    const active = [];
    for (let i = 0; i < rawPads.length; i++) {
      if (rawPads[i]) active.push(rawPads[i]);
    }
    setPads(active);

    if (active[selectedPad]) {
      const pad = active[selectedPad];
      const axes = pad.axes || [0, 0, 0, 0];

      drawStickPath(canvasLRef.current, axes[0], axes[1]);
      drawStickPath(canvasRRef.current, axes[2], axes[3]);
    }

    requestRef.current = requestAnimationFrame(updateGamepads);
  };

  const drawStickPath = (canvas, x, y) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = (canvas.width / 2) - 5;

    const px = cx + x * r;
    const py = cy + y * r;

    // استخدام لون الثيم الرئيسي لرسم النقاط
    ctx.fillStyle = getThemeColor('--primary', 'currentColor');
    ctx.fillRect(px, py, 2, 2);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGamepads);
    return () => cancelAnimationFrame(requestRef.current);
  }, [selectedPad]);

  const activePad = pads[selectedPad] || pads[0];

  // فحص حالة الضغط للأزرار
  const isBtnPressed = (index) => {
    if (!activePad || !activePad.buttons[index]) return false;
    return activePad.buttons[index].pressed;
  };

  // قيم حركة العصا
  const lx = activePad?.axes[0] || 0;
  const ly = activePad?.axes[1] || 0;
  const rx = activePad?.axes[2] || 0;
  const ry = activePad?.axes[3] || 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-card text-card-foreground font-sans rounded-2xl border border-border shadow-xl dir-ltr text-left">
      
      {/* 1. أزرار اختيار يد التحكم المضيئة المتفاعلة مع الثيم */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-border">
        {[0, 1, 2, 3].map((num) => {
          const isConnected = !!pads[num];
          return (
            <button
              key={num}
              onClick={() => setSelectedPad(num)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-w-[120px] text-center border ${
                selectedPad === num
                  ? 'bg-primary text-primary-foreground border-primary font-black shadow-md'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <div>Gamepad #{num + 1}</div>
              <div className={isConnected ? 'text-primary font-bold' : 'text-destructive font-normal'}>
                {isConnected ? 'Connected' : 'Not found'}
              </div>
            </button>
          );
        })}
      </div>

      {activePad ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* 2. القسم الأيسر: البيانات ورسائل الأزرار */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-background text-foreground text-xs font-mono p-3 rounded-xl border border-border break-all">
              <span className="font-bold text-primary">Gamepad ID: </span>
              {activePad.id}
            </div>

            <div className="grid grid-cols-2 gap-4 bg-background/60 p-3.5 rounded-xl border border-border text-xs font-mono">
              <div className="flex justify-between pr-2">
                <span className="text-muted-foreground">Left X →</span>
                <span className="text-primary font-bold">{lx.toFixed(3)}</span>
              </div>
              <div className="flex justify-between pr-2">
                <span className="text-muted-foreground">Left Y →</span>
                <span className="text-primary font-bold">{ly.toFixed(3)}</span>
              </div>
              <div className="flex justify-between pr-2">
                <span className="text-muted-foreground">Right X →</span>
                <span className="text-primary font-bold">{rx.toFixed(3)}</span>
              </div>
              <div className="flex justify-between pr-2">
                <span className="text-muted-foreground">Right Y →</span>
                <span className="text-primary font-bold">{ry.toFixed(3)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-primary mb-2">Buttons Status:</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {activePad.buttons.map((btn, bIdx) => (
                  <div
                    key={bIdx}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      btn.pressed
                        ? 'bg-primary border-primary text-primary-foreground font-black scale-105 shadow-md'
                        : 'bg-background border-border text-muted-foreground'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">B {bIdx}</div>
                    <div className="text-[10px] font-mono text-muted-foreground/80">
                      {btn.value.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. القسم الأيمن: الرسمة التفاعلية المجهزة للتكيف مع ثيم الموقع */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-background/50 p-5 rounded-2xl border border-border">
            
            {/* SVG اليد التفاعلية الحية مع الاستجابة لـ text-primary و fill-primary */}
            <div className="relative w-full max-w-[280px]">
              <svg className="w-full h-auto" viewBox="0 0 300 240" fill="none" stroke="currentColor" strokeWidth="2">
                {/* جسم اليد */}
                <path
                  d="M 60 50 C 90 40 210 40 240 50 C 270 60 285 140 260 210 C 250 230 220 220 200 170 C 170 150 130 150 100 170 C 80 220 50 230 40 210 C 15 140 30 60 60 50 Z"
                  className="stroke-primary/80 fill-background"
                  strokeWidth="2.5"
                />

                {/* Touchpad */}
                <rect x="105" y="55" width="90" height="45" rx="6" className={`transition-colors ${isBtnPressed(17) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />

                {/* L1 / R1 */}
                <rect x="55" y="25" width="40" height="15" rx="4" className={`transition-colors ${isBtnPressed(4) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />
                <rect x="205" y="25" width="40" height="15" rx="4" className={`transition-colors ${isBtnPressed(5) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />

                {/* L2 / R2 */}
                <rect x="65" y="8" width="20" height="14" rx="3" className={`transition-colors ${isBtnPressed(6) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />
                <rect x="215" y="8" width="20" height="14" rx="3" className={`transition-colors ${isBtnPressed(7) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />

                {/* D-Pad الأسهم */}
                <g className="stroke-primary/50">
                  <path d="M 65 100 L 75 100 L 75 90 L 85 90 L 85 100 L 95 100 L 95 110 L 85 110 L 85 120 L 75 120 L 75 110 L 65 110 Z" className="fill-card" />
                  <rect x="75" y="90" width="10" height="10" className={isBtnPressed(12) ? 'fill-primary' : 'fill-transparent'} />
                  <rect x="75" y="110" width="10" height="10" className={isBtnPressed(13) ? 'fill-primary' : 'fill-transparent'} />
                  <rect x="65" y="100" width="10" height="10" className={isBtnPressed(14) ? 'fill-primary' : 'fill-transparent'} />
                  <rect x="85" y="100" width="10" height="10" className={isBtnPressed(15) ? 'fill-primary' : 'fill-transparent'} />
                </g>

                {/* B0, B1, B2, B3 الأزرار */}
                <g>
                  <circle cx="225" cy="92" r="7" className={`transition-colors ${isBtnPressed(3) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />
                  <circle cx="240" cy="107" r="7" className={`transition-colors ${isBtnPressed(1) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />
                  <circle cx="225" cy="122" r="7" className={`transition-colors ${isBtnPressed(0) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />
                  <circle cx="210" cy="107" r="7" className={`transition-colors ${isBtnPressed(2) ? 'fill-primary' : 'fill-card'} stroke-primary/50`} />
                </g>

                {/* العصا اليسرى L3 */}
                <g transform={`translate(${lx * 8}, ${ly * 8})`}>
                  <circle cx="115" cy="155" r="18" className={`transition-colors ${isBtnPressed(10) ? 'fill-primary' : 'fill-card'} stroke-primary`} strokeWidth="2" />
                  <circle cx="115" cy="155" r="10" className="fill-background stroke-primary/50" />
                </g>

                {/* العصا اليمنى R3 */}
                <g transform={`translate(${rx * 8}, ${ry * 8})`}>
                  <circle cx="185" cy="155" r="18" className={`transition-colors ${isBtnPressed(11) ? 'fill-primary' : 'fill-card'} stroke-primary`} strokeWidth="2" />
                  <circle cx="185" cy="155" r="10" className="fill-background stroke-primary/50" />
                </g>
              </svg>
            </div>

            {/* رسم تتبع العصي */}
            <div className="flex gap-4 justify-center items-center mt-6">
              <div className="text-center">
                <div className="relative w-24 h-24 rounded-full border border-border bg-background flex items-center justify-center overflow-hidden">
                  <div className="absolute w-full h-[1px] bg-border" />
                  <div className="absolute h-full w-[1px] bg-border" />
                  <canvas ref={canvasLRef} width="96" height="96" className="absolute inset-0" />
                  <div
                    className="absolute w-2 h-2 bg-primary rounded-full shadow-sm"
                    style={{
                      transform: `translate(${lx * 38}px, ${ly * 38}px)`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono mt-1 block">Left Stick</span>
              </div>

              <div className="text-center">
                <div className="relative w-24 h-24 rounded-full border border-border bg-background flex items-center justify-center overflow-hidden">
                  <div className="absolute w-full h-[1px] bg-border" />
                  <div className="absolute h-full w-[1px] bg-border" />
                  <canvas ref={canvasRRef} width="96" height="96" className="absolute inset-0" />
                  <div
                    className="absolute w-2 h-2 bg-primary rounded-full shadow-sm"
                    style={{
                      transform: `translate(${rx * 38}px, ${ry * 38}px)`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono mt-1 block">Right Stick</span>
              </div>
            </div>

            <button
              onClick={clearCanvas}
              className="px-4 py-1.5 mt-4 bg-card hover:bg-accent text-card-foreground border border-border text-xs font-bold rounded-lg transition-all"
            >
              Clear Paths History (p)
            </button>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-background/50 rounded-xl border border-dashed border-border">
          <p className="text-base font-bold text-foreground mb-1">No Gamepad Connected</p>
          <p className="text-xs text-muted-foreground">
            Please connect your controller and press any button to activate.
          </p>
        </div>
      )}
    </div>
  );
}