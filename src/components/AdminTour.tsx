"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

export interface TourStep {
  selector: string | null; // null = centro da tela (intro step)
  title: string;
  body: string;
  icon?: string;
}

interface AdminTourProps {
  steps: TourStep[];
  storageKey: string;
}

interface Rect { top: number; left: number; width: number; height: number }

const PAD = 10;
const TIP_W = 300;

function getRect(selector: string | null): Rect | null {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function tooltipPosition(rect: Rect | null): React.CSSProperties {
  if (!rect) {
    return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - rect.top - rect.height;
  const spaceAbove = rect.top;
  const cenX = rect.left + rect.width / 2;
  let left = Math.max(12, Math.min(cenX - TIP_W / 2, vw - TIP_W - 12));

  if (spaceBelow >= 200 || spaceBelow > spaceAbove) {
    return { position: "fixed", top: rect.top + rect.height + PAD + 8, left };
  }
  return { position: "fixed", bottom: vh - rect.top + PAD + 8, left };
}

export default function AdminTour({ steps, storageKey }: AdminTourProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [settling, setSettling] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-show on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(storageKey)) {
      const t = setTimeout(() => setOpen(true), 1100);
      return () => clearTimeout(t);
    }
  }, [storageKey]);

  // Keyboard: Esc closes, arrow keys navigate
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft")  go(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Update rect on scroll/resize
  const syncRect = useCallback(() => {
    if (!open) return;
    setRect(getRect(steps[step]?.selector ?? null));
  }, [open, step, steps]);

  useEffect(() => {
    window.addEventListener("scroll",  syncRect, { passive: true });
    window.addEventListener("resize",  syncRect);
    return () => {
      window.removeEventListener("scroll",  syncRect);
      window.removeEventListener("resize",  syncRect);
    };
  }, [syncRect]);

  // Scroll to target + measure rect after settling
  useEffect(() => {
    if (!open) return;
    setSettling(true);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);

    const sel = steps[step]?.selector;
    if (sel) {
      document.querySelector(sel)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    scrollTimer.current = setTimeout(() => {
      setRect(getRect(sel ?? null));
      setSettling(false);
    }, 420);

    return () => { if (scrollTimer.current) clearTimeout(scrollTimer.current); };
  }, [open, step, steps]);

  const close = () => {
    localStorage.setItem(storageKey, "1");
    setOpen(false);
  };

  const go = (dir: 1 | -1) => {
    const next = step + dir;
    if (next < 0 || next >= steps.length) return;
    setStep(next);
  };

  const finish = () => {
    if (step < steps.length - 1) go(1);
    else close();
  };

  const tipStyle = tooltipPosition(rect);
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <>
      {/* Floating help button — always visible */}
      <button
        onClick={() => { setStep(0); setOpen(true); }}
        title="Iniciar tour de ajuda"
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-stone-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label="Ajuda"
      >
        <Sparkles className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Spotlight overlay */}
            <div className="fixed inset-0 z-[9990] pointer-events-none" aria-hidden>
              {rect && !settling && (
                <div
                  style={{
                    position: "fixed",
                    top:    rect.top    - PAD,
                    left:   rect.left   - PAD,
                    width:  rect.width  + PAD * 2,
                    height: rect.height + PAD * 2,
                    borderRadius: 8,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.58)",
                    outline: "2px solid rgba(255,255,255,0.35)",
                    transition: "top 0.38s cubic-bezier(.4,0,.2,1), left 0.38s cubic-bezier(.4,0,.2,1), width 0.38s cubic-bezier(.4,0,.2,1), height 0.38s cubic-bezier(.4,0,.2,1)",
                    zIndex: 9990,
                  }}
                />
              )}
              {/* Full dark bg when no rect (intro step) */}
              {!rect && (
                <div className="absolute inset-0 bg-black/55" />
              )}
            </div>

            {/* Click-through backdrop (closes on click) */}
            <div
              className="fixed inset-0 z-[9991] cursor-pointer"
              onClick={close}
              aria-hidden
            />

            {/* Tooltip card */}
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed z-[9999] shadow-2xl rounded-2xl overflow-hidden bg-white"
              style={{ width: TIP_W, ...tipStyle }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div className="h-1 bg-stone-100">
                <motion.div
                  className="h-full bg-stone-900"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>

              <div className="p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {steps[step].icon && (
                      <span className="text-lg leading-none">{steps[step].icon}</span>
                    )}
                    <div>
                      <p className="text-[8px] tracking-[0.4em] uppercase opacity-30 font-bold mb-0.5">
                        {step + 1} / {steps.length}
                      </p>
                      <h3 className="text-[13px] font-black text-stone-900 leading-snug">
                        {steps[step].title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={close}
                    className="shrink-0 p-1 rounded-full hover:bg-stone-100 transition-colors mt-0.5"
                    aria-label="Fechar"
                  >
                    <X className="h-3.5 w-3.5 text-stone-400" />
                  </button>
                </div>

                {/* Body */}
                <p className="text-[11.5px] leading-relaxed text-stone-500">
                  {steps[step].body}
                </p>

                {/* Dot indicators */}
                <div className="flex items-center gap-1 justify-center">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`transition-all duration-200 rounded-full ${
                        i === step
                          ? "w-4 h-1.5 bg-stone-900"
                          : "w-1.5 h-1.5 bg-stone-200 hover:bg-stone-400"
                      }`}
                      aria-label={`Ir para passo ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={close}
                    className="text-[9px] tracking-[0.35em] uppercase opacity-25 hover:opacity-50 transition-opacity font-bold"
                  >
                    Pular tour
                  </button>
                  <div className="flex items-center gap-1.5">
                    {step > 0 && (
                      <button
                        onClick={() => go(-1)}
                        className="flex items-center gap-0.5 text-[9px] tracking-wider uppercase font-bold text-stone-400 hover:text-stone-700 transition-colors px-3 py-2 rounded-xl hover:bg-stone-100"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Voltar
                      </button>
                    )}
                    <button
                      onClick={finish}
                      className="flex items-center gap-1 text-[9px] tracking-wider uppercase font-black text-white bg-stone-900 hover:bg-stone-700 active:bg-stone-800 transition-colors px-4 py-2 rounded-xl"
                    >
                      {step === steps.length - 1 ? "Concluir ✓" : "Próximo"}
                      {step < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
