/**
 * Browser Audio Autoplay & Speech Synthesis Unlocker
 * Solves Chrome/Safari/Edge Autoplay restrictions by unlocking AudioContext on user gesture
 * and providing synchronized closed captions so assistant communication is never silent.
 */

let sharedAudioContext: AudioContext | null = null;
let isAudioUnlocked = false;

export function getUnlockedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

export function unlockBrowserAudio() {
  if (isAudioUnlocked || typeof window === 'undefined') return;

  const unlock = () => {
    const ctx = getUnlockedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        isAudioUnlocked = true;
      }).catch(() => {});
    } else {
      isAudioUnlocked = true;
    }

    // Warm-up SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }

    window.removeEventListener('click', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };

  window.addEventListener('click', unlock, true);
  window.addEventListener('touchstart', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

// Speak assistant response with fallback callbacks for closed captioning
export function speakAssistantText(
  text: string, 
  onCaptionUpdate?: (caption: string | null) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Always update Closed Captions so assistant is never "mute"
    if (onCaptionUpdate) {
      onCaptionUpdate(text);
    }

    if (!('speechSynthesis' in window)) {
      setTimeout(() => {
        if (onCaptionUpdate) onCaptionUpdate(null);
        resolve(false);
      }, 4000);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        if (onCaptionUpdate) onCaptionUpdate(null);
        resolve(true);
      };

      utterance.onerror = () => {
        if (onCaptionUpdate) onCaptionUpdate(null);
        resolve(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setTimeout(() => {
        if (onCaptionUpdate) onCaptionUpdate(null);
        resolve(false);
      }, 4000);
    }
  });
}
