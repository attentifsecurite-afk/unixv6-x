import { useState } from "react";
import { Reveal } from "./bits";

/* ═══════════ fichiers source réels ═══════════ */

const FILES = {
  "boot/boot.asm": {
    lang: "nasm",
    code: `; V6-X bootloader — 512 octets, signature 0xAA55
; Charge le noyau depuis le secteur 2 et saute en mode protégé

BITS 16
ORG 0x7C00

start:
    ; Initialiser les segments
    cli
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00
    sti

    ; Afficher un message
    mov si, msg
    call print

    ; Charger le noyau (secteur 2, 64 secteurs = 32 Ko)
    mov ah, 0x02        ; fonction read
    mov al, 64          ; nombre de secteurs
    mov ch, 0           ; cylindre 0
    mov cl, 2           ; secteur 2 (après bootloader)
    mov dh, 0           ; tête 0
    mov dl, [boot_drive]
    mov bx, 0x1000      ; adresse de chargement
    int 0x13
    jc disk_error

    ; Activer la ligne A20
    in al, 0x92
    or al, 2
    out 0x92, al

    ; Charger la GDT
    lgdt [gdt_desc]

    ; Activer le mode protégé
    mov eax, cr0
    or eax, 1
    mov cr0, eax

    ; Sauter en mode 32 bits
    jmp 0x08:protected_mode

disk_error:
    mov si, err_msg
    call print
    jmp $

print:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    mov bx, 0x0007
    int 0x10
    jmp print
.done:
    ret

msg:        db "V6-X bootloader...", 13, 10, 0
err_msg:    db "Disk error!", 0
boot_drive: db 0

; GDT — 3 segments : null, code, data
gdt_start:
    dd 0, 0                     ; null descriptor
gdt_code:
    dw 0xFFFF                   ; limit 0-15
    dw 0x0000                   ; base 0-15
    db 0x00                     ; base 16-23
    db 10011010b                ; access: present, ring 0, code, readable
    db 11001111b                ; granularity: 4K, 32-bit, limit 16-19
    db 0x00                     ; base 24-31
gdt_data:
    dw 0xFFFF
    dw 0x0000
    db 0x00
    db 10010010b                ; data segment
    db 11001111b
    db 0x00
gdt_end:

gdt_desc:
    dw gdt_end - gdt_start - 1
    dd gdt_start

TIMES 510 - ($ - $$) db 0
DW 0xAA55

; ═══════════ Mode protégé 32 bits ═══════════

BITS 32

protected_mode:
    ; Initialiser les segments de données
    mov ax, 0x10
    mov ds, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    mov ss, ax
    mov esp, 0x90000

    ; Sauter au noyau (chargé en 0x1000)
    jmp 0x1000

TIMES 1024 - ($ - $$) db 0`,
  },

  "kernel/main.c": {
    lang: "c",
    code: `/* V6-X kernel — noyau minimal en C */
/* Compile avec i386-elf-gcc -m32 -ffreestanding -nostdlib */

typedef unsigned int uint32;
typedef unsigned short uint16;
typedef unsigned char uint8;

/* ═══════════ Affichage VGA ═══════════ */

#define VGA_BASE 0xB8000
#define VGA_WIDTH 80
#define VGA_HEIGHT 25

static uint16 *vga = (uint16 *)VGA_BASE;
static int cursor_x = 0;
static int cursor_y = 0;

void vga_clear() {
    for (int i = 0; i < VGA_WIDTH * VGA_HEIGHT; i++) {
        vga[i] = 0x0720;  /* fond noir, texte blanc, espace */
    }
    cursor_x = 0;
    cursor_y = 0;
}

void vga_putchar(char c) {
    if (c == '\\n') {
        cursor_x = 0;
        cursor_y++;
    } else if (c == '\\r') {
        cursor_x = 0;
    } else {
        vga[cursor_y * VGA_WIDTH + cursor_x] = 0x0700 | c;
        cursor_x++;
        if (cursor_x >= VGA_WIDTH) {
            cursor_x = 0;
            cursor_y++;
        }
    }
    if (cursor_y >= VGA_HEIGHT) {
        /* scroll */
        for (int i = 0; i < (VGA_HEIGHT - 1) * VGA_WIDTH; i++) {
            vga[i] = vga[i + VGA_WIDTH];
        }
        for (int i = (VGA_HEIGHT - 1) * VGA_WIDTH; i < VGA_HEIGHT * VGA_WIDTH; i++) {
            vga[i] = 0x0720;
        }
        cursor_y = VGA_HEIGHT - 1;
    }
}

void vga_puts(const char *s) {
    while (*s) {
        vga_putchar(*s++);
    }
}

/* ═══════════ Ports I/O ═══════════ */

void outb(uint16 port, uint8 val) {
    __asm__ volatile ("outb %0, %1" : : "a"(val), "Nd"(port));
}

uint8 inb(uint16 port) {
    uint8 ret;
    __asm__ volatile ("inb %1, %0" : "=a"(ret) : "Nd"(port));
    return ret;
}

/* ═══════════ Entrée clavier ═══════════ */

static const char scancode_to_ascii[] = {
    0, 0, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\\b',
    '\\t', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\n',
    0, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '\`', 0, '\\\\',
    'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 0, '*', 0, ' '
};

char keyboard_getchar() {
    uint8 scancode = inb(0x60);
    if (scancode < sizeof(scancode_to_ascii)) {
        return scancode_to_ascii[scancode];
    }
    return 0;
}

/* ═══════════ Point d'entrée du noyau ═══════════ */

void kmain() {
    vga_clear();
    vga_puts("V6-X kernel 0.1.0\\n");
    vga_puts("Noyau charge avec succes.\\n\\n");
    vga_puts("Contrat d'integration : 13 appels systeme\\n");
    vga_puts("  sys_open, sys_read, sys_write, sys_close\\n");
    vga_puts("  sys_spawn, sys_exit, sys_wait\\n");
    vga_puts("  sys_alloc, sys_free\\n");
    vga_puts("  sys_ipc_send, sys_ipc_receive\\n");
    vga_puts("  sys_net_send, sys_net_receive\\n\\n");
    vga_puts("Modules :\\n");
    vga_puts("  system/permissions ... monte\\n");
    vga_puts("  system/firewall ...... monte\\n");
    vga_puts("  system/antivirus ..... en veille\\n\\n");
    vga_puts("Tapez une commande : ");

    /* Boucle interactive minimale */
    char buf[80];
    int pos = 0;

    while (1) {
        char c = keyboard_getchar();
        if (c == 0) continue;

        if (c == '\\n') {
            vga_putchar('\\n');
            buf[pos] = 0;

            /* Traitement des commandes */
            if (pos == 4 && buf[0] == 'h' && buf[1] == 'e' && buf[2] == 'l' && buf[3] == 'p') {
                vga_puts("Commandes : help, clear, reboot\\n");
            } else if (pos == 5 && buf[0] == 'c' && buf[1] == 'l' && buf[2] == 'e' && buf[3] == 'a' && buf[4] == 'r') {
                vga_clear();
            } else if (pos == 6 && buf[0] == 'r' && buf[1] == 'e' && buf[2] == 'b' && buf[3] == 'o' && buf[4] == 'o' && buf[5] == 't') {
                /* Triple fault volontaire */
                __asm__ volatile ("int3");
            } else if (pos > 0) {
                vga_puts("Commande inconnue : ");
                vga_puts(buf);
                vga_putchar('\\n');
            }

            vga_puts("v6x# ");
            pos = 0;
        } else if (c == '\\b') {
            if (pos > 0) {
                pos--;
                cursor_x--;
                vga[cursor_y * VGA_WIDTH + cursor_x] = 0x0720;
            }
        } else if (pos < 79) {
            buf[pos++] = c;
            vga_putchar(c);
        }
    }
}`,
  },

  "kernel/linker.ld": {
    lang: "ld",
    code: `/* Script de liaison pour V6-X */
/* Place le noyau en 0x1000 (après le bootloader) */

ENTRY(_start)

SECTIONS
{
    . = 0x1000;

    .text : {
        *(.text)
    }

    .rodata : {
        *(.rodata*)
    }

    .data : {
        *(.data)
    }

    .bss : {
        *(.bss)
    }
}`,
  },

  "Makefile": {
    lang: "makefile",
    code: `# V6-X Makefile — compile le bootloader et le noyau
# Nécessite : nasm, i386-elf-gcc, i386-elf-ld, xorriso

CC = i386-elf-gcc
LD = i386-elf-ld
NASM = nasm

CFLAGS = -m32 -ffreestanding -fno-pie -nostdlib -O2 -Wall
LDFLAGS = -T kernel/linker.ld -nostdlib

# Cibles principales
all: v6x.iso

# Compiler le bootloader
boot/boot.bin: boot/boot.asm
	$(NASM) -f bin -o $@ $<

# Compiler le noyau
kernel/main.o: kernel/main.c
	$(CC) $(CFLAGS) -c -o $@ $<

kernel/kernel.bin: kernel/main.o
	$(LD) $(LDFLAGS) -o $@ $<

# Créer l'image disque
v6x.img: boot/boot.bin kernel/kernel.bin
	cat boot/boot.bin kernel/kernel.bin > $@

# Créer l'ISO bootable
v6x.iso: v6x.img
	mkdir -p iso/boot
	cp v6x.img iso/boot/v6x.img
	xorriso -as mkisofs -b boot/v6x.img -no-emul-boot -boot-load-size 4 \\
		-o v6x.iso iso
	rm -rf iso

# Tester dans QEMU
run: v6x.iso
	qemu-system-i386 -cdrom v6x.iso -m 128M

# Déboguer avec GDB
debug: v6x.iso
	qemu-system-i386 -cdrom v6x.iso -m 128M -s -S &
	@echo "GDB : target remote localhost:1234"
	@echo "      break kmain"
	@echo "      continue"

# Créer la clé USB bootable
usb: v6x.img
	@echo "⚠ ATTENTION : Cette opération efface TOUT le contenu de la clé USB"
	@echo "Identifiez votre clé avec : lsblk"
	@read -p "Entrez le device (ex: /dev/sdX) : " DEV; \\
	sudo dd if=v6x.img of=$$DEV bs=4M status=progress oflag=sync

# Nettoyer
clean:
	rm -f boot/boot.bin kernel/main.o kernel/kernel.bin v6x.img v6x.iso

.PHONY: all run debug usb clean`,
  },
};

/* ═══════════ dépendances ═══════════ */

const DEPS = {
  linux: [
    { pkg: "nasm", cmd: "sudo apt install nasm" },
    { pkg: "gcc-i386-elf", cmd: "sudo apt install gcc-i386-elf" },
    { pkg: "binutils-i386-elf", cmd: "sudo apt install binutils-i386-elf" },
    { pkg: "xorriso", cmd: "sudo apt install xorriso" },
    { pkg: "qemu-system-x86", cmd: "sudo apt install qemu-system-x86" },
  ],
  macos: [
    { pkg: "nasm", cmd: "brew install nasm" },
    { pkg: "i386-elf-gcc", cmd: "brew install i386-elf-gcc" },
    { pkg: "xorriso", cmd: "brew install xorriso" },
    { pkg: "qemu", cmd: "brew install qemu" },
  ],
  windows: [
    { pkg: "NASM", url: "nasm.us" },
    { pkg: "GCC cross-compiler i386-elf", url: "github.com/lordmilker/i686-elf-tools" },
    { pkg: "xorriso", url: "gnu.org/software/xorriso" },
    { pkg: "QEMU", cmd: "winget install SoftwareFreedomConservancy.QEMU" },
  ],
};

/* ═══════════ composant ═══════════ */

export default function RealSystem() {
  const [activeFile, setActiveFile] = useState<keyof typeof FILES>("boot/boot.asm");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeOs, setActiveOs] = useState<"linux" | "macos" | "windows">("linux");

  const copyFile = async (name: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(name);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const file = FILES[activeFile];

  return (
    <div className="space-y-8">
      {/* ═══ avertissement ═══ */}
      <Reveal>
        <div className="border-l-4 border-amber bg-amber/[0.05] px-5 py-4">
          <p className="text-[13px] leading-relaxed text-ink/90">
            <span className="font-mono text-amber font-bold">⚠ AVERTISSEMENT —</span> Ce code est un{" "}
            <span className="text-ink">kit de démarrage minimal</span>. Il affiche du texte et lit le clavier,
            mais n'implémente pas encore les 13 appels système, la mémoire virtuelle, ni les modules. C'est
            la base sur laquelle vous allez construire le vrai V6-X.
          </p>
        </div>
      </Reveal>

      {/* ═══ explorateur de fichiers ═══ */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start">
          {/* arbre de fichiers */}
          <div className="border border-line bg-panel/70">
            <div className="border-b border-line bg-panel2 px-4 py-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase">
                Arborescence V6-X
              </span>
            </div>
            <div className="p-3">
              <div className="px-2 py-1 font-mono text-xs text-amber">v6x/</div>
              <div className="ml-3 border-l border-line">
                <div className="px-2 py-1 font-mono text-[11px] text-moss">├─ boot/</div>
                <button
                  onClick={() => setActiveFile("boot/boot.asm")}
                  className={`w-full text-left pl-6 pr-2 py-1.5 font-mono text-[12px] transition-all ${
                    activeFile === "boot/boot.asm"
                      ? "bg-phos/10 text-phos border-l-2 border-phos"
                      : "text-moss hover:text-ink hover:bg-panel3 border-l-2 border-transparent"
                  }`}
                >
                  boot.asm
                </button>
                <div className="px-2 py-1 font-mono text-[11px] text-moss">├─ kernel/</div>
                <button
                  onClick={() => setActiveFile("kernel/main.c")}
                  className={`w-full text-left pl-6 pr-2 py-1.5 font-mono text-[12px] transition-all ${
                    activeFile === "kernel/main.c"
                      ? "bg-phos/10 text-phos border-l-2 border-phos"
                      : "text-moss hover:text-ink hover:bg-panel3 border-l-2 border-transparent"
                  }`}
                >
                  main.c
                </button>
                <button
                  onClick={() => setActiveFile("kernel/linker.ld")}
                  className={`w-full text-left pl-6 pr-2 py-1.5 font-mono text-[12px] transition-all ${
                    activeFile === "kernel/linker.ld"
                      ? "bg-phos/10 text-phos border-l-2 border-phos"
                      : "text-moss hover:text-ink hover:bg-panel3 border-l-2 border-transparent"
                  }`}
                >
                  linker.ld
                </button>
                <button
                  onClick={() => setActiveFile("Makefile")}
                  className={`w-full text-left pl-4 pr-2 py-1.5 font-mono text-[12px] transition-all ${
                    activeFile === "Makefile"
                      ? "bg-phos/10 text-phos border-l-2 border-phos"
                      : "text-moss hover:text-ink hover:bg-panel3 border-l-2 border-transparent"
                  }`}
                >
                  Makefile
                </button>
              </div>
            </div>
          </div>

          {/* visionneuse de code */}
          <div className="border border-line bg-[#04080570] min-w-0">
            <div className="flex items-center gap-3 border-b border-line bg-panel2 px-4 py-3">
              <span className="font-mono text-xs text-phos term-glow">{activeFile}</span>
              <button
                onClick={() => copyFile(activeFile, file.code)}
                className={`ml-auto border px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] uppercase transition-all ${
                  copied === activeFile
                    ? "border-phos/70 text-phos"
                    : "border-line2 text-dim hover:text-amber hover:border-amber/60"
                }`}
              >
                {copied === activeFile ? "copié ✓" : "copier"}
              </button>
            </div>
            <pre className="overflow-x-auto px-4 sm:px-5 py-5 font-mono text-[12px] leading-[1.7] max-h-[600px] overflow-y-auto">
              {file.code.split("\n").map((ln, li) => (
                <div key={li} className="flex">
                  <span className="w-8 shrink-0 select-none text-right pr-3 text-dim/70">{li + 1}</span>
                  <span
                    className={
                      ln.trim().startsWith(";") || ln.trim().startsWith("//") || ln.trim().startsWith("/*") || ln.trim().startsWith("*")
                        ? "text-moss/80 italic whitespace-pre"
                        : "text-ink/90 whitespace-pre"
                    }
                  >
                    {ln === "" ? " " : ln}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </Reveal>

      {/* ═══ dépendances ═══ */}
      <Reveal>
        <div className="border border-line bg-panel/70">
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel2 px-4 py-3">
            <span className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase">
              Dépendances à installer
            </span>
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

          <div className="p-5">
            <ul className="space-y-3">
              {DEPS[activeOs].map((d) => (
                <li key={d.pkg} className="flex items-center gap-4">
                  <span className="font-mono text-[13px] text-ink w-48">{d.pkg}</span>
                  {'cmd' in d && d.cmd && (
                    <code className="flex-1 font-mono text-[11.5px] text-phos/90 border border-line bg-[#04080570] px-3 py-2 overflow-x-auto">
                      $ {d.cmd}
                    </code>
                  )}
                  {'url' in d && d.url && (
                    <a
                      href={`https://${d.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 font-mono text-[11.5px] text-amber underline decoration-line2 underline-offset-4 hover:text-phos transition-colors"
                    >
                      {d.url} ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      {/* ═══ workflow ═══ */}
      <Reveal>
        <div className="border border-line bg-panel/70 p-5 sm:p-7">
          <div className="font-mono text-[10px] tracking-[0.25em] text-amber uppercase mb-6">
            Workflow de compilation
          </div>
          <div className="space-y-4 font-mono text-[12.5px] leading-[1.8]">
            <div>
              <span className="text-dim"># 1. Cloner ou créer les fichiers</span>
              <div className="text-phos/90">$ mkdir v6x && cd v6x</div>
              <div className="text-phos/90">$ # Copier boot/boot.asm, kernel/main.c, kernel/linker.ld, Makefile</div>
            </div>
            <div>
              <span className="text-dim"># 2. Compiler</span>
              <div className="text-phos/90">$ make</div>
            </div>
            <div>
              <span className="text-dim"># 3. Tester dans QEMU</span>
              <div className="text-phos/90">$ make run</div>
            </div>
            <div>
              <span className="text-dim"># 4. Créer la clé USB (optionnel)</span>
              <div className="text-phos/90">$ make usb</div>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <p className="text-[12px] leading-relaxed text-dim">
              <span className="text-amber">💡 Prochaine étape :</span> une fois ce noyau minimal fonctionnel,
              vous implémentez les 13 appels système (sys_open → sys_net_receive), puis vous montez les
              modules system/ · cognitive/ · surface/ via IPC.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
