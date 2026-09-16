import { useEffect, useState } from "react";
import VmBoot from "./components/VmBoot";
import UsbBoot from "./components/UsbBoot";
import RealSystem from "./components/RealSystem";
import { Reveal, Scramble, SectionHead } from "./components/bits";

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const t = now.toLocaleTimeString("fr-FR", { hour12: false });
  return (
    <span className="font-mono text-xs text-moss tabular-nums">
      <span className="text-phos">▮</span> {t} <span className="hidden sm:inline text-dim">· tty0</span>
    </span>
  );
}

/* ═══════════ drapeaux ═══════════ */
function Flag({ c }: { c: "fr" | "gb" | "es" | "us" }) {
  const common = { className: "h-[13px] w-[20px] shrink-0 border border-line2", style: { borderRadius: 2 } };
  if (c === "fr")
    return (
      <svg viewBox="0 0 20 13" {...common} aria-hidden>
        <rect width="6.7" height="13" fill="#2b4f9e" />
        <rect x="6.7" width="6.6" height="13" fill="#e8e6df" />
        <rect x="13.3" width="6.7" height="13" fill="#c33b33" />
      </svg>
    );
  if (c === "gb")
    return (
      <svg viewBox="0 0 20 13" {...common} aria-hidden>
        <rect width="20" height="13" fill="#26356e" />
        <path d="M0 0 L20 13 M20 0 L0 13" stroke="#e8e6df" strokeWidth="3" />
        <path d="M0 0 L20 13 M20 0 L0 13" stroke="#c33b33" strokeWidth="1.3" />
        <path d="M10 0 V13 M0 6.5 H20" stroke="#e8e6df" strokeWidth="4.4" />
        <path d="M10 0 V13 M0 6.5 H20" stroke="#c33b33" strokeWidth="2.4" />
      </svg>
    );
  if (c === "es")
    return (
      <svg viewBox="0 0 20 13" {...common} aria-hidden>
        <rect width="20" height="13" fill="#c33b33" />
        <rect y="3.25" width="20" height="6.5" fill="#e2b53a" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 13" {...common} aria-hidden>
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} y={i * 1.86} width="20" height="1" fill={i % 2 ? "#e8e6df" : "#c33b33"} />
      ))}
      <rect width="9" height="6.5" fill="#26356e" />
    </svg>
  );
}

const PHONES = [
  { c: "fr" as const, label: "+33 6 58 63 59 04", href: "tel:+33658635904", flag: "France" },
  { c: "gb" as const, label: "+44 7591 665201", href: "tel:+447591665201", flag: "Royaume-Uni" },
  { c: "es" as const, label: "+34 673 075 445", href: "tel:+34673075445", flag: "Espagne" },
  { c: "us" as const, label: "+1 302 353 2616", href: "tel:+13023532616", flag: "États-Unis" },
];

export default function App() {
  return (
    <div className="relative z-10 min-h-screen">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="sticky top-0 z-50 border-b border-line bg-night/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6 py-3">
          <a href="#" className="flex items-baseline gap-2.5 group">
            <span className="font-crt text-3xl text-phos glow leading-none group-hover:text-phos2 transition-colors">
              V6-X
            </span>
            <span className="hidden md:inline font-mono text-[10px] tracking-[0.22em] text-dim uppercase">
              recoder unix v6 · de a à z
            </span>
          </a>
          <nav className="ml-auto hidden lg:flex items-center gap-5">
            <a href="#boot" className="font-mono text-[11px] tracking-[0.15em] text-moss uppercase transition-colors hover:text-phos">
              00 Boot
            </a>
            <a href="#usb" className="font-mono text-[11px] tracking-[0.15em] text-moss uppercase transition-colors hover:text-phos">
              01 USB
            </a>
            <a href="#real" className="font-mono text-[11px] tracking-[0.15em] text-moss uppercase transition-colors hover:text-phos">
              02 Réel
            </a>
          </nav>
          <Clock />
        </div>
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16 pb-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-start">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 border border-phos/40 bg-phos/10 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-phos animate-pulse-dot" />
                  <span className="font-mono text-[10px] tracking-[0.25em] text-phos uppercase">Feu vert accordé</span>
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
                  pilote : Driss · ing. IA cognitive fédérée hybride
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="font-crt leading-[0.9] tracking-wide">
                <span className="block text-6xl sm:text-7xl xl:text-8xl text-phos glow">
                  <Scramble text="RECODER" />
                </span>
                <span className="block text-6xl sm:text-7xl xl:text-8xl text-ink">
                  <Scramble text="UNIX V6" speed={30} />
                </span>
                <span className="block mt-3 text-3xl sm:text-4xl text-amber glow-amber font-mono tracking-[0.3em]">
                  DE A À Z
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-moss">
                Le cœur en <span className="text-ink">cinq langages</span> —{" "}
                <span className="text-[#e0655a]">Java la sécurité</span>,{" "}
                <span className="text-[#6fb3e0]">C++ la mémoire</span>,{" "}
                <span className="text-[#9a7ad1]">C# la machine</span>,{" "}
                <span className="text-[#5cc8e6]">Go la rapidité</span>,{" "}
                <span className="text-[#ffd34e]">Python l'IA</span>. Autour :{" "}
                <span className="text-ink">15 modules</span> fédérés, branchés au noyau par{" "}
                <span className="text-amber">13 appels système</span>. Ni Linux, ni Android — V6, relu et
                prolongé.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="border border-line bg-panel/80 p-5 transition-all duration-300 hover:border-phos/50 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(92,230,139,0.35)]">
                  <div className="font-mono text-[10px] tracking-[0.25em] text-phos uppercase mb-2">
                    Toi — le cœur V6-X
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-moss">
                    Recoder le noyau : processus, fichiers, mémoire, IPC. Phases{" "}
                    <span className="text-phos">01-02 faites</span>, <span className="text-amber">03-04 en cours</span>.
                  </p>
                </div>
                <div className="border border-line bg-panel/80 p-5 transition-all duration-300 hover:border-amber/50 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(255,180,84,0.3)]">
                  <div className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase mb-2">
                    L'IA — les modules
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-moss">
                    system/ · cognitive/ · surface/ — préparés autour du noyau, sans jamais y toucher. On
                    assemble par étapes.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} variant="left">
            <div className="border border-line2 bg-[#04080580] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9),0_0_50px_-18px_rgba(92,230,139,0.3)]">
              <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e0655a]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-phos/80" />
                <span className="ml-3 font-mono text-[11px] tracking-[0.18em] text-moss uppercase">
                  Terminal PDP-11 · tty0 · 9600 bauds
                </span>
              </div>
              <div className="px-4 sm:px-5 py-6 font-mono text-[12.5px] leading-[1.6]">
                <div className="text-phos term-glow">:boot rk(0,0)unix</div>
                <div className="text-phos/90">Boot</div>
                <div className="text-phos/90">: unix</div>
                <div className="text-phos/90">mem = 1035</div>
                <div className="text-phos/90">unix</div>
                <div className="mt-3 text-ink/80">UNIX V6 — PDP-11/40 · Bell Labs, février 1975</div>
                <div className="text-ink/80">9 000 lignes de C entre vous et le métal.</div>
                <div className="mt-3 text-ink/80">Tapez « help » dans la VM ci-dessous ▾</div>
                <div className="mt-2 flex items-center">
                  <span className="text-amber"># </span>
                  <span className="text-phos animate-blink">▊</span>
                </div>
              </div>
            </div>
            <p className="mt-3 font-mono text-[10.5px] text-dim">
              Le shell Thompson original — recodé en TypeScript pour la démo.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ 00 · BOOT VIRTUEL ═══════════ */}
      <section id="boot" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 scroll-mt-16">
        <SectionHead
          index="00"
          kicker="qemu · une image, trois hôtes"
          title="LE BOOT VIRTUEL"
          sub="Premier objectif : un OS pour PC qui démarre en virtuel. La même v6x.iso boote sur macOS, Windows et Linux — BIOS, bootloader de 512 octets, mode protégé, noyau en C. Tout se casse et se répare ici, avant le métal."
        />
        <VmBoot />
      </section>

      {/* ═══════════ 01 · BOOT USB ═══════════ */}
      <section id="usb" className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 scroll-mt-16">
          <SectionHead
            index="01"
            kicker="du virtuel au réel · clé USB bootable"
            title="LE BOOT USB"
            sub="Deuxième objectif : une clé USB bootable qui démarre V6-X sur vrai matériel. Même image, même noyau — mais cette fois, les pilotes GPU, WiFi et USB 3 doivent fonctionner sans émulateur."
          />
          <UsbBoot />
        </div>
      </section>

      {/* ═══════════ 02 · SYSTÈME RÉEL ═══════════ */}
      <section id="real" className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 scroll-mt-16">
          <SectionHead
            index="02"
            kicker="code source complet · prêt à compiler"
            title="SYSTÈME RÉEL"
            sub="Le kit de démarrage V6-X : bootloader en NASM, noyau en C, script de liaison, Makefile. Copiez les fichiers, installez les dépendances, compilez, testez dans QEMU ou sur USB. C'est la base sur laquelle vous allez construire les 13 appels système et les 15 modules."
          />
          <RealSystem />
        </div>
      </section>

      {/* ═══════════ SIGNATURE SECUTOR PRO LLC ═══════════ */}
      <footer id="signature" className="relative border-t border-line bg-night">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-8">
          <Reveal>
            <div className="flex items-center gap-4 mb-10">
              <span className="font-mono text-xs tracking-[0.3em] text-amber uppercase">Créé par</span>
              <span className="h-px flex-1 bg-gradient-to-r from-line2 to-transparent" />
              <span className="hidden sm:inline font-mono text-[10px] tracking-[0.25em] text-dim uppercase">
                extrait de registre · société mère
              </span>
            </div>
          </Reveal>

          <div className="grid gap-10 lg:grid-cols-12 items-start">
            <Reveal variant="left" className="lg:col-span-5">
              <div className="flex items-start gap-5">
                <svg viewBox="0 0 64 64" className="h-16 w-16 text-phos" fill="none" stroke="currentColor" aria-hidden>
                  <path d="M32 4 L56 13 V32 c0 14-10 24-24 28 C18 56 8 46 8 32 V13 Z" strokeWidth="2.4" />
                  <path d="M32 10 L50 17 V32 c0 11-8 19-18 22.5 C22 51 14 43 14 32 V17 Z" strokeWidth="1" opacity="0.45" />
                  <circle cx="32" cy="27" r="6.5" strokeWidth="2.2" />
                  <path d="M32 33.5 V44 M28 40 h8" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="32" cy="27" r="1.6" fill="currentColor" stroke="none" />
                </svg>
                <div>
                  <div className="font-crt leading-[0.92]">
                    <span className="block text-5xl sm:text-6xl text-phos glow tracking-wide">SECUTOR</span>
                    <span className="block text-5xl sm:text-6xl text-ink tracking-wide">
                      PRO<span className="ml-3 align-middle border border-amber/60 px-2 py-0.5 font-mono text-lg tracking-[0.3em] text-amber">LLC</span>
                    </span>
                  </div>
                  <div className="mt-3 font-mono text-[11px] tracking-[0.2em] text-dim uppercase">USA — Lewes, Delaware</div>
                </div>
              </div>

              <ul className="mt-8 space-y-1.5">
                {[
                  { t: "Private Security", d: "Protection physique et opérationnelle" },
                  { t: "Investigation", d: "Enquêtes privées et numériques" },
                  { t: "Cybersecurity", d: "Durcissement, audit, réponse à incident" },
                  { t: "Cybercrime", d: "Traque, preuves et dossiers judiciaires" },
                ].map((s) => (
                  <li
                    key={s.t}
                    className="group flex items-center gap-4 border border-line bg-panel/70 px-4 py-3 transition-all duration-300 hover:border-amber/50 hover:bg-panel2 hover:translate-x-1"
                  >
                    <span className="text-amber transition-transform duration-300 group-hover:scale-110">▸</span>
                    <div>
                      <div className="font-mono text-[13px] text-ink tracking-wide">{s.t}</div>
                      <div className="text-[11.5px] text-dim">{s.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-7">
              <div className="group relative border border-line2 bg-gradient-to-b from-panel2 to-panel px-6 sm:px-8 py-7">
                <div className="pointer-events-none absolute right-5 top-6 hidden sm:block rotate-[7deg] border-2 border-amber/50 text-amber/60 px-3 py-1.5 text-center font-mono text-[9px] leading-tight tracking-[0.22em] uppercase">
                  Registered
                  <br />
                  State of Delaware
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-amber uppercase">Registry record</span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.2em] text-phos uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-phos animate-pulse-dot" /> société active
                  </span>
                </div>

                <dl className="mt-6 space-y-4">
                  {[
                    ["Jurisdiction", "United States — Delaware"],
                    ["Registry · File Number", "3240873"],
                    ["FinCEN ID", "3000-0005-8776"],
                    ["Registered address", "16192 Coastal Highway, Lewes, DE 19958, United States"],
                    ["Operating scope", "Private Security · Investigation · Cybersecurity · Cybercrime"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline gap-3">
                      <dt className="shrink-0 font-mono text-[10px] tracking-[0.22em] text-dim uppercase">{label}</dt>
                      <span className="flex-1 border-b border-dotted border-line2 translate-y-[-3px]" aria-hidden />
                      <dd className="text-[13.5px] text-right sm:text-left max-w-[62%] leading-snug text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-6 border border-line bg-panel/70">
                <div className="grid sm:grid-cols-[1fr_1fr] border-b border-line divide-y sm:divide-y-0 sm:divide-x divide-line">
                  <a
                    href="mailto:contact@secutorpro.com"
                    className="group flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-panel2"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                      <rect x="3" y="5.5" width="18" height="13" rx="1" />
                      <path d="M3.5 6.5 L12 13 L20.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Écrire</div>
                      <div className="font-mono text-[13.5px] text-ink group-hover:text-phos transition-colors">contact@secutorpro.com</div>
                    </div>
                  </a>
                  <a
                    href="https://secutorpro.com"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-panel2"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                      <circle cx="12" cy="12" r="8.5" />
                      <ellipse cx="12" cy="12" rx="3.8" ry="8.5" />
                      <path d="M3.5 12 H20.5" />
                    </svg>
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase">Site</div>
                      <div className="font-mono text-[13.5px] text-ink group-hover:text-phos transition-colors">
                        secutorpro.com<span className="ml-1 text-phos opacity-0 transition-opacity group-hover:opacity-100">↗</span>
                      </div>
                    </div>
                  </a>
                </div>

                <div className="px-5 py-4">
                  <div className="font-mono text-[10px] tracking-[0.25em] text-dim uppercase mb-3">Lignes directes — 24/7</div>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-3">
                    {PHONES.map((p) => (
                      <a
                        key={p.label}
                        href={p.href}
                        title={p.flag}
                        className="group flex items-center gap-2.5 border border-line bg-night/60 px-3 py-2.5 transition-all duration-200 hover:border-phos/50 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_-14px_rgba(92,230,139,0.45)]"
                      >
                        <Flag c={p.c} />
                        <span className="font-mono text-[12px] text-ink group-hover:text-phos transition-colors tabular-nums">
                          {p.label}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-12 border-t border-line pt-6 flex flex-col md:flex-row items-start md:items-center gap-3">
            <p className="font-mono text-[11px] text-dim leading-relaxed">
              <span className="text-ink">© 2026 SECUTOR PRO LLC</span> · Lewes, Delaware, USA —{" "}
              <span className="text-moss">V6-X : cœur par Driss · modules par l'IA · assemblage par étapes</span>
            </p>
            <a
              href="https://www.tom-yam.or.jp/2238/src/"
              target="_blank"
              rel="noreferrer"
              className="md:ml-auto font-mono text-[11px] text-moss underline decoration-line2 underline-offset-4 hover:text-phos transition-colors"
            >
              sources UNIX V6 (1975) — tom-yam.or.jp/2238/src/
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
