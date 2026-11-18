# 🎙️ Agent IA Holographique V6-X

## ✨ Fonctionnalités

### 🗣️ Détection Vocale Automatique
- **Reconnaissance vocale en français** via Web Speech API
- Détection automatique de la parole
- Transcription en temps réel
- Support des accents et variantes du français

### 🔊 Synthèse Vocale Humanisée
- **Voix françaises naturelles** (pas robotique)
- Ton conversationnel et chaleureux
- Rythme adapté au dialogue
- Sélection automatique de la meilleure voix disponible

### 🌐 Interface Holographique
- Effets visuels de particules animées
- Lignes de balayage style hologramme
- Indicateurs d'état (écoute/parole)
- Design futuriste et immersif

### 💬 Conversation Intelligente
- Compréhension du contexte V6-X
- Réponses adaptées sur :
  - Le système d'exploitation V6-X
  - Les modules (system/, cognitive/, surface/)
  - Le boot virtuel et USB
  - L'architecture et les appels système
- Dialogue naturel en français

## 🚀 Utilisation

### Mode Vocal (Recommandé)
1. Cliquez sur le bouton **"🎤 Parler"**
2. Autorisez l'accès au microphone
3. Parlez naturellement en français
4. L'agent transcrit et répond avec sa voix

### Mode Texte
1. Tapez votre message dans le champ de saisie
2. Appuyez sur **Entrée** ou cliquez **"Envoyer"**
3. L'agent répond vocalement

## 🎯 Exemples de Conversations

### Salutations
```
Vous : "Bonjour !"
Agent : "Bonjour ! Comment puis-je vous aider aujourd'hui ?"
```

### Questions sur V6-X
```
Vous : "C'est quoi V6-X ?"
Agent : "V6-X est un système d'exploitation inspiré d'UNIX V6, recodé en cinq langages..."
```

### Questions Techniques
```
Vous : "Comment fonctionne le boot USB ?"
Agent : "V6-X peut démarrer en virtuel avec QEMU ou sur clé USB bootable..."
```

### Aide
```
Vous : "Aide-moi"
Agent : "Je peux vous expliquer V6-X, ses modules, son fonctionnement..."
```

## 🔧 Configuration Technique

### Navigateurs Supportés
- ✅ **Chrome** (recommandé)
- ✅ **Edge**
- ✅ **Safari** (limité)
- ⚠️ **Firefox** (reconnaissance vocale limitée)

### Permissions Requises
- 🎤 Accès au microphone (pour la voix)
- 🔊 Autorisation audio (pour la synthèse)

### APIs Utilisées
- `SpeechRecognition` (Web Speech API)
- `SpeechSynthesis` (Web Speech API)
- Langue : `fr-FR`

## 🎨 Personnalisation

### Modifier les Réponses
Éditez la fonction `generateResponse()` dans `HologramAgent.tsx` :

```typescript
const generateResponse = (input: string): string => {
  const lower = input.toLowerCase();
  
  // Ajoutez vos propres patterns
  if (lower.match(/votre_pattern/)) {
    return "Votre réponse personnalisée";
  }
  
  // ...
};
```

### Changer la Voix
Modifiez les paramètres dans la fonction `speak()` :

```typescript
utterance.rate = 0.95;  // Vitesse (0.5 à 2.0)
utterance.pitch = 1.0;  // Tonalité (0 à 2)
utterance.volume = 1.0; // Volume (0 à 1)
```

### Connecter un Vrai LLM
Remplacez `generateResponse()` par un appel API :

```typescript
const generateResponse = async (input: string): Promise<string> => {
  const response = await fetch('/api/agent', {
    method: 'POST',
    body: JSON.stringify({ message: input })
  });
  const data = await response.json();
  return data.response;
};
```

## 🔌 Intégration avec Ollama

Pour connecter l'agent à Ollama (IA locale) :

```typescript
const generateResponse = async (input: string): Promise<string> => {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt: input,
      stream: false
    })
  });
  const data = await response.json();
  return data.response;
};
```

## 🎭 Effets Visuels

### Particules Holographiques
- 40 particules animées
- Mouvement aléatoire
- Opacité variable
- Couleur phosphore (#5ce68b)

### Indicateurs d'État
- 🟢 **Vert** : Prêt à écouter
- 🟠 **Orange** : Écoute en cours
- 🔵 **Bleu** : Parle (synthèse vocale)

## 🌍 Support Multilingue

Pour ajouter d'autres langues, modifiez :

```typescript
recognition.lang = "fr-FR";  // Changez vers "en-US", "es-ES", etc.
utterance.lang = "fr-FR";    // Même langue pour la synthèse
```

## 🐛 Dépannage

### Le micro ne fonctionne pas
- Vérifiez les permissions du navigateur
- Assurez-vous qu'aucune autre application n'utilise le micro
- Rechargez la page

### Pas de son
- Vérifiez le volume système
- Assurez-vous que le navigateur n'est pas en mode silencieux
- Essayez un autre navigateur

### La reconnaissance est lente
- Parlez clairement et distinctement
- Réduisez le bruit ambiant
- Utilisez Chrome pour de meilleures performances

## 📊 Architecture

```
HologramAgent.tsx
├── SpeechRecognition (entrée vocale)
│   ├── Détection automatique
│   ├── Transcription fr-FR
│   └── Gestion des erreurs
├── generateResponse() (logique IA)
│   ├── Patterns de conversation
│   ├── Contexte V6-X
│   └── Réponses naturelles
├── SpeechSynthesis (sortie vocale)
│   ├── Voix françaises
│   ├── Paramètres humanisés
│   └── Synchronisation UI
└── Interface Holographique
    ├── Particules animées
    ├── Indicateurs d'état
    └── Design futuriste
```

## 🔮 Améliorations Futures

- [ ] Intégration Ollama pour IA locale
- [ ] Reconnaissance d'intentions avancée
- [ ] Mémoire conversationnelle
- [ ] Commandes vocales système
- [ ] Avatar 3D animé
- [ ] Support multilingue simultané
- [ ] Mode hors-ligne complet

## 📝 Notes

L'agent utilise actuellement des réponses prédéfinies. Pour une IA conversationnelle complète, connectez-le à :
- **Ollama** (local, privé)
- **OpenAI API** (cloud, puissant)
- **Anthropic Claude** (cloud, nuancé)
- **Mistral AI** (européen, souverain)

---

**Créé par SECUTOR PRO LLC** · Agent IA holographique pour V6-X
