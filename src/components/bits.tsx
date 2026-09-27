import { useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useInView<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function Reveal({
  children,
  delay = 0,
  variant = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: "up" | "left";
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${variant === "up" ? "rvl" : "rvl-left"} ${inView ? "rvl-on" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const GLYPHS = "▓▒░<>/\\{}[]#$%&@0123456789";

export function Scramble({ text, className = "", speed = 26 }: { text: string; className?: string; speed?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.3);
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  const done = useRef(false);

  useEffect(() => {
    if (!inView || done.current) return;
    done.current = true;
    if (reduced) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = Math.max(14, text.length * 2.2);
    const id = window.setInterval(() => {
      frame++;
      const settled = Math.floor((frame / total) * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === " " || i < settled) s += c;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (settled >= text.length) {
        setOut(text);
        window.clearInterval(id);
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [inView, reduced, text, speed]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {out || "\u00A0"}
    </span>
  );
}

export function SectionHead({
  index,
  kicker,
  title,
  sub,
}: {
  index: string;
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal>
      <div className="mb-10 md:mb-14">
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-xs tracking-[0.3em] text-amber uppercase">{index}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-line2 to-transparent" />
          <span className="font-mono text-[11px] tracking-[0.25em] text-moss uppercase hidden sm:inline">{kicker}</span>
        </div>
        <h2 className="font-crt text-4xl sm:text-5xl md:text-6xl text-phos glow leading-[0.95] tracking-wide">
          <Scramble text={title} />
        </h2>
        {sub && <p className="mt-5 max-w-2xl text-moss text-sm md:text-base leading-relaxed">{sub}</p>}
      </div>
    </Reveal>
  );
}
