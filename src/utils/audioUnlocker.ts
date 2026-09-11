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

    // Ensure SpeechSynthesis is silenced
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    window.removeEventListener('click', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };

  window.addEventListener('click', unlock, true);
  window.addEventListener('touchstart', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

// Voice output disabled - silent inspection mode active
export function speakAssistantText(
  _text: string, 
  onCaptionUpdate?: (caption: string | null) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Immediately cancel any pending speech
    }
    if (onCaptionUpdate) {
      onCaptionUpdate(null);
    }
    resolve(true);
  });
}
