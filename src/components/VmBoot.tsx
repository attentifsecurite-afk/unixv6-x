import { useEffect, useRef, useState } from "react";
import { Reveal, usePrefersReducedMotion } from "./bits";

type Line = { text: string; cls?: string };

const BOOT_SEQ: (Line | { pause: number })[] = [
  { text: "SeaBIOS (version 1.16.2-qemu)", cls: "text-moss" },
  { text: "Machine : i386 · 800×600 · 128 Mo · CD-ROM", cls: "text-moss" },
  { text: "Booting from DVD/CD...", cls: "text-moss" },
  { pause: 4 },
  { text: "V6-X bootloader v0.1 — secteur 1 · signature 0xAA55 ok" },
  { text: "[ok] noyau chargé : 64 secteurs → 0x100000" },
  { text: "[ok] GDT : 5 segments (null · code32 · data32 · code16 · data16)" },
  { text: "[ok] IDT : 48 vecteurs — 0x20 horloge · 0x80 appels système" },
  { text: "[ok] A20 activée — 131 072 Ko détectés" },
  { text: "[ok] mode protégé 32 bits — saut vers kmain()" },
  { pause: 3 },
  { text: "V6-X kernel 0.1.0 (i386-elf-gcc)", cls: "text-amber" },
  { text: "[ok] PIC reprogrammée — IRQ0 → int 0x20 · 100 Hz" },
  { text: "[ok] allocateur noyau (C++) : 96 Mo libres sur 128" },
  { text: "[ok] table des agents : 0/64 — contrat 13 appels enregistré" },
  { text: "[ok] system/permissions …… monté" },
  { text: "[ok] system/firewall ……… monté" },
  { text: "[ok] system/antivirus …… en veille" },
  { text: "[ok] cognitive/ollama_bridge … hors ligne (pas de réseau)" },
  { pause: 2 },
  { text: "V6-X est en ligne — tapez « help ».", cls: "text-amber" },
];

function vmRun(cmd: string, tick: number): { lines: (string | Line)[]; action?: "reboot" | "halt" } {
  const c = cmd.trim();
  switch (c) {
    case "help":
      return {
        lines: [
          "Noyau V6-X — commandes :",
          "  syscalls   le contrat : 13 appels",
          "  agents     table des agents (64 max)",
          "  lsmod      modules system/ · cognitive/ · surface/",
          "  map        carte mémoire du noyau",
          "  gdt        dump de la GDT",
          "  uptime     ticks depuis le boot",
          "  reboot · shutdown · clear",
        ],
      };
    case "syscalls":
      return {
        lines: [
          "sysent_v6x[13] — le contrat d'intégration :",
          "  0 sys_open          4 sys_spawn        8 sys_ipc_send",
          "  1 sys_read          5 sys_exit         9 sys_ipc_receive",
          "  2 sys_write         6 sys_wait        10 sys_net_send",
          "  3 sys_close         7 sys_alloc       11 sys_net_receive",
          "                    12 sys_free",
          "état : enregistrés · stubs en attente du cœur de Driss",
        ],
      };
    case "agents":
      return {
        lines: [
          "  AGENT                 PID   ÉTAT      APPELS",
          "  system/permissions     1    actif     sys_open, sys_read",
          "  system/firewall        2    actif     sys_net_receive",
          "  system/antivirus       3    veille    sys_read",
          "  cognitive/ollama_bridge —   hors ligne (réseau coupé)",
          "3/64 agents — le reste attend les phases 07-09.",
        ],
      };
    case "lsmod":
      return {
        lines: [
          "system/      permissions ● firewall ● antivirus ◐ network ○ pkg_mgr ○",
          "cognitive/   ollama_bridge ○ llama ○ mistral_guard ○ memo0 ○ agent_rt ○",
          "surface/     app_runtime ○ office ○ search ○ gamma ○ access ○",
          "● actif · ◐ en veille · ○ prévu",
        ],
      };
    case "map":
      return {
        lines: [
          "0x00000000 - 0x000003FF   IDT (48 vecteurs)",
          "0x00000500 - 0x00007BFF   pile du noyau",
          "0x00007C00 - 0x00007DFF   bootloader (512 o)",
          "0x00100000 - 0x0018FFFF   v6x.bin (noyau, 576 Ko)",
          "0x00190000 - 0x07FFFFFF   tas noyau — allocateur C++",
          "128 Mo adressés · 96 Mo libres",
        ],
      };
    case "gdt":
      return {
        lines: [
          "GDT @ 0x00000400 — 5 segments :",
          "  #0 null      (obligatoire)",
          "  #1 code32    base 0x00000000 · lim 0xFFFFF · ring 0",
          "  #2 data32    base 0x00000000 · lim 0xFFFFF · ring 0",
          "  #3 code16    conservé pour le retour réel (ACPI)",
          "  #4 data16    idem",
        ],
      };
    case "uptime":
      return {
        lines: [`${(tick / 100).toFixed(1)} s — ${tick} ticks @ 100 Hz (PIT, canal 0)`],
      };
    case "reboot":
      return { lines: [{ text: "redémarrage demandé — triple fault volontaire…", cls: "text-amber" }], action: "reboot" };
    case "shutdown":
    case "shutdown -h now":
      return {
        lines: [
          { text: "acpi: demande d'arrêt reçue (int 0x80 → sys_exit)", cls: "text-moss" },
          { text: "acpi: agents terminés — antivirus, firewall, permissions", cls: "text-moss" },
          { text: "acpi: modules démontés · table vidée · PIC masquée", cls: "text-moss" },
          { text: "Halte du système.", cls: "text-amber" },
        ],
        action: "halt",
      };
    case "clear":
      return { lines: [] };
    case "":
      return { lines: [] };
    default:
      return { lines: [`v6x-sh: ${c} : commande inconnue — « help »`] };
  }
}

const VM_CMDS = ["help", "syscalls", "agents", "map", "uptime", "reboot"];

const HOSTS = [
  { os: "macOS", install: "brew install qemu", run: "qemu-system-i386 -cdrom v6x.iso -m 128M" },
  { os: "Linux", install: "sudo apt install qemu-system-x86", run: "qemu-system-i386 -cdrom v6x.iso -m 128M" },
  { os: "Windows", install: "winget install SoftwareFreedomConservancy.QEMU", run: "qemu-system-i386.exe -cdrom v6x.iso -m 128M" },
];

const CHAIN = [
  { t: "BIOS — SeaBIOS", d: "Fourni par QEMU. Il cherche un secteur amorçable sur le CD et saute en 0x7C00.", f: "qemu", n: "0x7C00" },
  { t: "Bootloader V6-X", d: "512 octets, signature 0xAA55. Charge le noyau secteur par secteur depuis le CD.", f: "boot/boot.asm", n: "NASM" },
  { t: "Mode protégé 32 bits", d: "GDT 5 segments, IDT 48 vecteurs, ligne A20, saut loin vers 0x100000.", f: "boot/boot2.asm", n: "GDT · IDT" },
  { t: "Noyau v6x.bin", d: "_start → kmain() : PIC, PIT 100 Hz, allocateur C++, table des agents.", f: "kernel/main.c", n: "C" },
  { t: "Le contrat", d: "sysent_v6x[13] enregistré — de sys_open à sys_net_receive.", f: "kernel/sysent.c", n: "13 appels" },
  { t: "Modules system/", d: "permissions, firewall, antivirus montent en premier — par IPC, jamais dans le noyau.", f: "system/*", n: "IPC" },
];

export default function VmBoot() {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<"off" | "booting" | "live" | "halt">("off");
  const [lines, setLines] = useState<Line[]>([]);
  const [partial, setPartial] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const progress = useRef({ i: 0, c: 0 });
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const start = () => {
    progress.current = { i: 0, c: 0 };
    setLines([]);
    setPartial(null);
    setTick(0);
    setState("booting");
  };

  useEffect(() => {
    if (state !== "booting") return;
    if (reduced) {
      setLines(BOOT_SEQ.filter((e): e is Line => "text" in e));
      setState("live");
      return;
    }
    const id = window.setInterval(() => {
      const st = progress.current;
      const ev = BOOT_SEQ[st.i];
      if (!ev) {
        setState("live");
        return;
      }
      if ("pause" in ev) {
        st.c++;
        if (st.c > ev.pause) {
          st.c = 0;
          st.i++;
        }
      } else if (ev.text.startsWith("V6-X") && ev.cls === "text-amber") {
        st.c += 2;
        setPartial(ev.text.slice(0, st.c));
        if (st.c >= ev.text.length) {
          setLines((l) => [...l, ev]);
          setPartial(null);
          st.i++;
          st.c = 0;
        }
      } else {
        setLines((l) => [...l, ev]);
        st.i++;
      }
    }, 60);
    return () => window.clearInterval(id);
  }, [state, reduced]);

  useEffect(() => {
    if (state !== "live") return;
    const id = window.setInterval(() => setTick((t) => t + 10), 100);
    return () => window.clearInterval(id);
  }, [state]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, partial, state]);

  const submit = (raw: string) => {
    const res = vmRun(raw, tick);
    const norm: Line[] = res.lines.map((l) => (typeof l === "string" ? { text: l } : l));
    if (raw.trim() && raw.trim() !== "clear") {
      setLines((l) => [...l, { text: "v6x# " + raw.trim(), cls: "text-ink" }, ...norm]);
    } else if (raw.trim() === "clear") {
      setLines([]);
    }
    setInput("");
    if (res.action === "reboot") window.setTimeout(start, 500);
    if (res.action === "halt") window.setTimeout(() => setState("halt"), 700);
  };

  const copyHost = async (os: string, install: string, run: string) => {
    try {
      await navigator.clipboard.writeText(`${install}\n${run}`);
      setCopied(os);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const statusLed =
    state === "live" ? "bg-phos animate-pulse-dot" : state === "booting" ? "bg-amber animate-pulse-dot" : "bg-line2";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr] items-start">
        <div className="border border-line2 bg-[#04080580] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9),0_0_50px_-18px_rgba(92,230,139,0.3)]">
          <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e0655a]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-phos/80" />
            <span className="ml-3 font-mono text-[11px] tracking-[0.18em] text-moss uppercase truncate">
              QEMU — v6x.iso {state === "live" ? "[Running]" : state === "booting" ? "[Starting…]" : "[Stopped]"}
            </span>
            <span className="ml-auto flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusLed}`} />
              {state === "off" ? "éteinte" : state === "booting" ? "boot" : state === "live" ? "en ligne" : "halte"}
            </span>
          </div>

          <div
            ref={bodyRef}
            onClick={() => inputRef.current?.focus()}
            className="relative h-[420px] sm:h-[460px] overflow-y-auto px-4 sm:px-5 py-4 font-mono text-[12.5px] leading-[1.6] cursor-text"
          >
            {state === "off" && (
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                <button
                  onClick={start}
                  aria-label="Démarrer la machine virtuelle"
                  className="group flex h-20 w-20 items-center justify-center border-2 border-phos/60 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(92,230,139,0.6)] hover:scale-105 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-phos transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M7 4.5v15" />
                    <path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor" stroke="none" />
                  </svg>
                </button>
                <div>
                  <div className="font-crt text-3xl text-phos glow">DÉMARRER LA VM</div>
                  <div className="mt-1.5 font-mono text-[11px] text-dim">
                    v6x.iso prête · BIOS → bootloader → mode protégé → noyau
                  </div>
                </div>
              </div>
            )}

            {state === "halt" && (
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                <div className="font-mono text-sm text-moss">— système arrêté proprement (ACPI) —</div>
                <button
                  onClick={start}
                  className="border border-amber/70 px-5 py-2.5 font-mono text-xs tracking-[0.25em] text-amber uppercase transition-all hover:bg-amber hover:text-night"
                >
                  redémarrer ▸
                </button>
              </div>
            )}

            {(state === "booting" || state === "live") && (
              <>
                {lines.map((ln, i) => (
                  <div key={i} className={ln.cls ?? "text-phos/90 term-glow"}>
                    {ln.text === "" ? "\u00A0" : ln.text}
                  </div>
                ))}
                {partial !== null && (
                  <div className="text-phos term-glow">
                    {partial}
                    <span className="animate-blink">▊</span>
                  </div>
                )}
                {state === "live" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit(input);
                    }}
                    className="flex items-center"
                  >
                    <span className="text-amber">{"v6x# "}</span>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-ink caret-phos placeholder:text-dim"
                      placeholder="help"
                      aria-label="Console du noyau V6-X"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <span className="text-phos animate-blink" aria-hidden>▊</span>
                  </form>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line bg-panel2/80 px-4 py-2 font-mono text-[10px] text-dim">
            <span>i386 · ring 0</span>
            <span className="text-moss tabular-nums">tick {String(tick).padStart(6, "0")}</span>
            <span>agents 3/64</span>
            <span className="hidden sm:inline">128 Mo · 96 libres</span>
            <span className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-phos/70" />HDD</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber/70" />CD</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-line2" />NET</span>
            </span>
          </div>
        </div>

        <div className="space-y-5">
          <Reveal>
            <div className="border border-line bg-panel/80 p-5">
              <div className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase mb-1">Une image, trois hôtes</div>
              <p className="text-[12.5px] leading-relaxed text-moss">
                La même <span className="font-mono text-ink">v6x.iso</span> démarre partout — on installe QEMU,
                on lance, le noyau ne sait même pas sur quel OS il tourne.
              </p>
            </div>
          </Reveal>

          {HOSTS.map((h) => (
            <Reveal key={h.os} delay={100}>
              <div className="group border border-line bg-panel/80 transition-all duration-200 hover:border-line2 hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 border-b border-line/70 px-4 py-2.5">
                  <span className="font-crt text-xl text-ink tracking-wide">{h.os}</span>
                  <button
                    onClick={() => copyHost(h.os, h.install, h.run)}
                    className={`ml-auto border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.18em] uppercase transition-all ${
                      copied === h.os
                        ? "border-phos/70 text-phos"
                        : "border-line2 text-dim hover:text-amber hover:border-amber/60"
                    }`}
                  >
                    {copied === h.os ? "copié ✓" : "copier"}
                  </button>
                </div>
                <div className="px-4 py-3 font-mono text-[11.5px] leading-[1.8]">
                  <div className="text-dim">$ {h.install}</div>
                  <div className="text-phos/90">$ {h.run}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {state === "live" && (
        <div className="flex flex-wrap gap-2">
          {VM_CMDS.map((c) => (
            <button
              key={c}
              onClick={() => {
                submit(c);
                inputRef.current?.focus();
              }}
              className="border border-line bg-panel px-3 py-1.5 font-mono text-[11px] text-moss transition-all duration-200 hover:border-amber/60 hover:text-amber hover:-translate-y-0.5"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
        <Reveal>
          <div className="border border-line bg-panel/70 p-5 sm:p-7">
            <div className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase mb-6">
              La chaîne de boot — du courant au shell
            </div>
            <ol className="relative space-y-6 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-line2">
              {CHAIN.map((s, i) => (
                <li key={s.t} className="group relative pl-11">
                  <span className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center border border-line2 bg-night font-mono text-[11px] text-phos transition-all duration-200 group-hover:border-phos/70 group-hover:shadow-[0_0_16px_-4px_rgba(92,230,139,0.6)]">
                    {i + 1}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-[14px] text-ink group-hover:text-phos transition-colors">{s.t}</span>
                    <span className="font-mono text-[10px] text-dim">{s.n}</span>
                    <span className="ml-auto border border-line2 px-1.5 py-0.5 font-mono text-[9.5px] text-moss">{s.f}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-moss">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="border border-line bg-[#04080570]">
            <div className="flex items-center gap-3 border-b border-line bg-panel2 px-4 py-3">
              <span className="font-mono text-xs text-phos term-glow">Makefile — 4 cibles</span>
              <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-dim uppercase">toolchain</span>
            </div>
            <pre className="overflow-x-auto px-4 sm:px-5 py-5 font-mono text-[12px] leading-[1.8]">
{`$ make            # nasm boot.asm + i386-elf-gcc noyau
$ make iso        # v6x.iso amorçable (BIOS legacy)
$ make run        # qemu-system-i386 -cdrom v6x.iso -m 128M
$ make debug      # idem + -s -S → gdb : break kmain`}
            </pre>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
