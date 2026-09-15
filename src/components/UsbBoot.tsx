import { useState } from "react";
import { Reveal } from "./bits";

/* ═══════════ schéma de la clé USB ═══════════ */

function UsbDiagram() {
  return (
    <div className="border border-line bg-[#04080570] p-6 sm:p-8">
      <div className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase mb-4">
        Structure de la clé USB bootable
      </div>
      <div className="flex items-center gap-2 mb-6">
        <svg viewBox="0 0 80 40" className="h-12 w-24 text-ink" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="0" y="8" width="20" height="24" rx="2" fill="#2c402b" />
          <rect x="20" y="0" width="60" height="40" rx="3" />
          <circle cx="30" cy="20" r="3" fill="#5ce68b" />
          <rect x="40" y="15" width="30" height="10" rx="1" fill="#2c402b" />
        </svg>
        <span className="font-mono text-sm text-ink">USB 3.0 · 8 Go minimum · MBR ou GPT</span>
      </div>

      <div className="space-y-3">
        {[
          { name: "MBR / GPT", size: "512 o / 1 Ko", color: "#5ce68b", desc: "Table de partition — indique où booter" },
          { name: "Partition bootable", size: "~64 Mo", color: "#ffb454", desc: "v6x.bin + bootloader — marquée active" },
          { name: "Partition données", size: "restant", color: "#9ff0b6", desc: "Espace libre pour vos fichiers (optionnel)" },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-4">
            <div className="h-8 w-32 sm:w-48 border-2 rounded" style={{ borderColor: p.color, backgroundColor: `${p.color}15` }} />
            <div className="flex-1">
              <div className="font-mono text-[13px] text-ink">{p.name}</div>
              <div className="font-mono text-[10px] text-dim">{p.size}</div>
            </div>
            <div className="hidden sm:block text-[11.5px] text-moss max-w-xs">{p.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-line pt-4">
        <p className="text-[12px] leading-relaxed text-dim">
          <span className="text-amber">⚠</span> La partition bootable contient le bootloader (512 o) et le noyau (v6x.bin).
          Le BIOS/UEFI la charge en mémoire à 0x7C00, puis le bootloader passe la main au noyau en mode protégé.
        </p>
      </div>
    </div>
  );
}

/* ═══════════ commandes par OS ═══════════ */

const CMDS = {
  linux: {
    title: "Linux (dd)",
    steps: [
      { label: "Identifier la clé", cmd: "lsblk", note: "Repérer /dev/sdX (remplacer X par la lettre)" },
      { label: "Démonter", cmd: "sudo umount /dev/sdX*", note: "Toutes les partitions de la clé" },
      { label: "Écrire l'image", cmd: "sudo dd if=v6x.iso of=/dev/sdX bs=4M status=progress oflag=sync", note: "⚠ Remplacer sdX — pas sda1 !" },
      { label: "Synchroniser", cmd: "sync", note: "Vider les caches avant de retirer" },
    ],
    warn: "dd écrase TOUT sans confirmation. Vérifiez le device deux fois.",
  },
  macos: {
    title: "macOS (dd)",
    steps: [
      { label: "Identifier", cmd: "diskutil list", note: "Repérer /dev/diskN (ex: disk2)" },
      { label: "Démonter", cmd: "diskutil unmountDisk /dev/diskN", note: "Remplacer N par le numéro" },
      { label: "Convertir l'image", cmd: "hdiutil convert -format UDRW -o v6x.img v6x.iso", note: "macOS préfère .img" },
      { label: "Écrire", cmd: "sudo dd if=v6x.img of=/dev/rdiskN bs=4m", note: "rdiskN = raw, plus rapide" },
      { label: "Éjecter", cmd: "diskutil eject /dev/diskN", note: "Avant de retirer physiquement" },
    ],
    warn: "Sur macOS, utilisez /dev/rdiskN (raw) — 10× plus rapide que /dev/diskN.",
  },
  windows: {
    title: "Windows (Rufus)",
    steps: [
      { label: "Télécharger Rufus", cmd: "rufus-akeo.ie", note: "Gratuit, open-source, portable" },
      { label: "Sélectionner la clé", cmd: "Périphérique → votre USB", note: "Vérifiez la taille" },
      { label: "Sélectionner l'image", cmd: "SÉLECTION → v6x.iso", note: "Mode ISO image" },
      { label: "Schéma de partition", cmd: "MBR (BIOS) ou GPT (UEFI)", note: "MBR pour compatibilité max" },
      { label: "Démarrer", cmd: "DÉMARRER → OK", note: "Confirmer l'effacement" },
    ],
    warn: "Rufus formate automatiquement — sauvegardez vos données avant.",
  },
};

/* ═══════════ précautions ═══════════ */

const WARNINGS = [
  { icon: "⚠", title: "Sauvegardez vos données", text: "L'opération efface TOUT le contenu de la clé USB." },
  { icon: "🔍", title: "Vérifiez le device", text: "Un mauvais /dev/sdX peut détruire votre disque dur." },
  { icon: "⏱", title: "Patience", text: "dd peut prendre 5-10 minutes. Ne l'interrompez pas." },
  { icon: "🔌", title: "Alimentation stable", text: "Pas de veille, pas de débranchement pendant l'écriture." },
];

/* ═══════════ boot sur vrai matériel ═══════════ */

const BOOT_STEPS = [
  { n: 1, t: "Insérer la clé", d: "Brancher la USB sur un port USB 2.0 (plus compatible que USB 3)." },
  { n: 2, t: "Accéder au BIOS/UEFI", d: "Appuyer sur F2, F12, DEL ou ESC au démarrage (varie selon le fabricant)." },
  { n: 3, t: "Désactiver Secure Boot", d: "V6-X n'est pas signé Microsoft — Secure Boot doit être OFF." },
  { n: 4, t: "Sélectionner le boot", d: "Choisir « USB Storage » ou « Removable Device » dans l'ordre de boot." },
  { n: 5, t: "Sauvegarder et redémarrer", d: "F10 (généralement) → le système démarre depuis la clé." },
  { n: 6, t: "V6-X charge", d: "Bootloader → noyau → modules → shell. Bienvenue sur le métal." },
];

/* ═══════════ composant principal ═══════════ */

export default function UsbBoot() {
  const [activeOs, setActiveOs] = useState<"linux" | "macos" | "windows">("linux");
  const [copied, setCopied] = useState<string | null>(null);

  const copyCmd = async (cmd: string, key: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const cmds = CMDS[activeOs];

  return (
    <div className="space-y-8">
      {/* ═══ diagramme ═══ */}
      <Reveal>
        <UsbDiagram />
      </Reveal>

      {/* ═══ commandes ═══ */}
      <Reveal>
        <div className="border border-line bg-panel/70">
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel2 px-4 py-3">
            <span className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase">Créer la clé bootable</span>
            <div className="ml-auto flex gap-2">
              {(["linux", "macos", "windows"] as const).map((os) => (
                <button
                  key={os}
                  onClick={() => setActiveOs(os)}
                  className={`border px-3 py-1.5 font-mono text-[11px] tracking-[0.15em] uppercase transition-all ${
                    activeOs === os
                      ? "border-phos/70 bg-phos/10 text-phos"
                      : "border-line2 text-dim hover:text-ink hover:border-line"
                  }`}
                >
                  {os}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <h3 className="font-crt text-2xl text-ink mb-4">{cmds.title}</h3>

            <div className="space-y-4">
              {cmds.steps.map((s, i) => (
                <div key={i} className="group flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-line2 bg-night font-mono text-[11px] text-phos">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                      <span className="font-mono text-[13px] text-ink">{s.label}</span>
                      <button
                        onClick={() => copyCmd(s.cmd, `${activeOs}-${i}`)}
                        className={`ml-auto border px-2 py-0.5 font-mono text-[9px] tracking-[0.15em] uppercase transition-all ${
                          copied === `${activeOs}-${i}`
                            ? "border-phos/70 text-phos"
                            : "border-line2 text-dim hover:text-amber hover:border-amber/60"
                        }`}
                      >
                        {copied === `${activeOs}-${i}` ? "copié ✓" : "copier"}
                      </button>
                    </div>
                    <div className="border border-line bg-[#04080570] px-3 py-2 font-mono text-[11.5px] text-phos/90 overflow-x-auto">
                      <code>$ {s.cmd}</code>
                    </div>
                    <div className="mt-1 text-[11px] text-dim">{s.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-l-2 border-amber bg-amber/[0.05] px-4 py-3">
              <p className="text-[12px] leading-relaxed text-ink/80">
                <span className="font-mono text-amber">⚠ ATTENTION —</span> {cmds.warn}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ═══ précautions ═══ */}
      <Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {WARNINGS.map((w) => (
            <div key={w.title} className="border border-line bg-panel/80 p-4 transition-all duration-200 hover:border-amber/50 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{w.icon}</span>
                <span className="font-mono text-[13px] text-ink">{w.title}</span>
              </div>
              <p className="text-[12px] leading-relaxed text-moss">{w.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ═══ boot sur vrai matériel ═══ */}
      <Reveal>
        <div className="border border-line bg-panel/70 p-5 sm:p-7">
          <div className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase mb-6">
            Démarrer V6-X sur vrai matériel
          </div>
          <ol className="relative space-y-5 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-line2">
            {BOOT_STEPS.map((s) => (
              <li key={s.n} className="group relative pl-11">
                <span className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center border border-line2 bg-night font-mono text-[11px] text-phos transition-all duration-200 group-hover:border-phos/70 group-hover:shadow-[0_0_16px_-4px_rgba(92,230,139,0.6)]">
                  {s.n}
                </span>
                <div className="font-mono text-[14px] text-ink group-hover:text-phos transition-colors">{s.t}</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-moss">{s.d}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 border-t border-line pt-5">
            <p className="text-[12px] leading-relaxed text-dim">
              <span className="text-amber">💡 Conseil :</span> commencez par un vieux PC de test. Les premiers boots sur vrai matériel
              révèlent des problèmes de pilotes (GPU, WiFi, USB 3) que QEMU ne montre pas.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ═══ artefacts ═══ */}
      <Reveal>
        <div className="border border-line bg-panel/80 p-5">
          <div className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase mb-3">Fichiers générés</div>
          <div className="flex flex-wrap gap-2">
            {["v6x.iso", "v6x.img (macOS)", "bootloader.bin", "v6x.bin", "Makefile.usb"].map((f) => (
              <span key={f} className="border border-line2 bg-night/60 px-2.5 py-1 font-mono text-[10.5px] text-moss">
                {f}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-dim">
            <code className="text-moss">make usb</code> génère automatiquement <code className="text-amber">v6x.iso</code> et affiche
            les commandes pour votre OS.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
