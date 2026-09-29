import { useEffect, useRef, useState } from "react";
import { Reveal } from "./bits";

/* ═══════════ Types ═══════════ */

interface Message {
  role: "user" | "agent";
  text: string;
  timestamp: number;
}

/* ═══════════ Particules holographiques ═══════════ */

function HologramParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-phos/40 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════ Agent holographique ═══════════ */

export default function HologramAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: "Bonjour. Je suis l'agent IA de V6-X. Parlez-moi naturellement, je vous écoute.",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ═══════════ Initialisation reconnaissance vocale ═══════════ */

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserInput(finalTranscript);
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  /* ═══════════ Scroll automatique ═══════════ */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ═══════════ Traitement de l'entrée utilisateur ═══════════ */

  const handleUserInput = async (text: string) => {
    if (!text.trim()) return;

    // Ajouter le message utilisateur
    setMessages((prev) => [
      ...prev,
      { role: "user", text: text.trim(), timestamp: Date.now() },
    ]);

    // Générer une réponse (simulation - à remplacer par vrai LLM)
    const response = generateResponse(text.trim());

    // Attendre un peu pour simuler le traitement
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Ajouter la réponse de l'agent
    setMessages((prev) => [
      ...prev,
      { role: "agent", text: response, timestamp: Date.now() },
    ]);

    // Prononcer la réponse
    speak(response);
  };

  /* ═══════════ Génération de réponse ═══════════ */

  const generateResponse = (input: string): string => {
    const lower = input.toLowerCase();

    // Salutations
    if (lower.match(/bonjour|salut|hello|hey/)) {
      return "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
    }

    // Questions sur V6-X
    if (lower.match(/v6-x|v6x|système|os/)) {
      return "V6-X est un système d'exploitation inspiré d'UNIX V6, recodé en cinq langages : Java pour la sécurité, C++ pour la mémoire, C# pour la machine, Go pour la rapidité, et Python pour l'IA. Il utilise 13 appels système et 15 modules fédérés.";
    }

    // Questions sur les modules
    if (lower.match(/module|system|cognitive|surface/)) {
      return "Les modules sont organisés en trois couches : system pour la sécurité et le réseau, cognitive pour l'IA locale et la mémoire chiffrée, et surface pour les applications utilisateur. Ils communiquent via IPC sans jamais toucher au noyau.";
    }

    // Questions sur le boot
    if (lower.match(/boot|démarrer|usb|qemu/)) {
      return "V6-X peut démarrer en virtuel avec QEMU ou sur clé USB bootable. Le bootloader charge le noyau en mode protégé 32 bits, puis les modules se montent progressivement via le contrat d'intégration.";
    }

    // Questions sur l'IA
    if (lower.match(/ia|intelligence|agent|cognitif/)) {
      return "L'IA de V6-X fonctionne localement via ollama_bridge et llama. Elle comprend vos intentions, compose des plans d'action, et les exécute via les appels système. Tout reste chiffré sur votre appareil.";
    }

    // Aide
    if (lower.match(/aide|help|comment/)) {
      return "Je peux vous expliquer V6-X, ses modules, son fonctionnement, ou répondre à vos questions sur le développement. Posez-moi simplement votre question en français.";
    }

    // Remerciements
    if (lower.match(/merci|thanks/)) {
      return "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.";
    }

    // Réponse par défaut
    return "Je comprends votre question. V6-X est un projet ambitieux qui recrée UNIX V6 avec une architecture moderne orientée IA. Pouvez-vous préciser ce que vous souhaitez savoir ?";
  };

  /* ═══════════ Synthèse vocale ═══════════ */

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Arrêter toute synthèse en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.95; // Légèrement plus lent pour plus de naturel
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Chercher une voix française naturelle
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(
      (v) => v.lang.startsWith("fr") && v.name.toLowerCase().includes("natural")
    ) || voices.find((v) => v.lang.startsWith("fr"));

    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  /* ═══════════ Contrôle micro ═══════════ */

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  /* ═══════════ Envoi texte ═══════════ */

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserInput(inputText);
      setInputText("");
    }
  };

  return (
    <Reveal>
      <div className="relative border-2 border-phos/30 bg-gradient-to-br from-panel via-panel2 to-panel overflow-hidden">
        {/* Effet holographique */}
        <HologramParticles />
        
        {/* Lignes de balayage */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-phos/10 to-transparent animate-pulse" />
        </div>

        {/* Contenu */}
        <div className="relative z-10 p-6 sm:p-8">
          {/* En-tête */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-phos/30 to-amber/20 border-2 border-phos/50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-phos" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m11-11h-6m-6 0H1" />
                </svg>
              </div>
              {(isListening || isSpeaking) && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-crt text-2xl text-phos glow">Agent IA V6-X</h3>
              <p className="font-mono text-[11px] text-moss">
                {isListening ? "🎤 Écoute en cours..." : isSpeaking ? "🔊 Parle..." : "💬 Prêt à dialoguer"}
              </p>
            </div>
          </div>

          {/* Zone de conversation */}
          <div className="border border-line bg-night/60 rounded-lg p-4 h-[400px] overflow-y-auto mb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-lg ${
                    msg.role === "user"
                      ? "bg-amber/20 border border-amber/40 text-ink"
                      : "bg-phos/10 border border-phos/30 text-ink"
                  }`}
                >
                  <div className="font-mono text-[10px] text-dim mb-1">
                    {msg.role === "user" ? "Vous" : "Agent IA"}
                  </div>
                  <div className="text-[13px] leading-relaxed">{msg.text}</div>
                </div>
              </div>
            ))}
            
            {/* Transcript en cours */}
            {transcript && isListening && (
              <div className="mb-4 flex justify-end">
                <div className="max-w-[80%] px-4 py-2.5 rounded-lg bg-amber/10 border border-amber/30 text-moss italic">
                  <div className="font-mono text-[10px] text-dim mb-1">Transcription...</div>
                  <div className="text-[13px]">{transcript}</div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Contrôles */}
          <div className="flex gap-3">
            {/* Bouton micro */}
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-5 py-3 border-2 rounded-lg font-mono text-sm transition-all ${
                isListening
                  ? "border-amber bg-amber/20 text-amber shadow-[0_0_20px_-4px_rgba(255,180,84,0.6)]"
                  : "border-phos/50 bg-phos/10 text-phos hover:border-phos hover:bg-phos/20"
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              {isListening ? "Arrêter" : "Parler"}
            </button>

            {/* Formulaire texte */}
            <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ou tapez votre message..."
                className="flex-1 px-4 py-3 bg-night/60 border border-line rounded-lg font-mono text-sm text-ink placeholder:text-dim focus:outline-none focus:border-phos/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 border-2 border-phos/50 bg-phos/10 text-phos rounded-lg font-mono text-sm hover:border-phos hover:bg-phos/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Envoyer
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="mt-4 text-center">
            <p className="font-mono text-[10px] text-dim">
              💡 Parlez naturellement en français · L'agent comprend et répond avec une voix humaine
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
