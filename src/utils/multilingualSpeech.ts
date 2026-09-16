/**
 * Speech Recognition and Voice Synthesis Engine
 * Clean English (en-US) and Standard Hindi (hi-IN).
 * Note: Hinglish voice assistance removed as requested.
 */

export type InspectionLanguage = 'en' | 'hi';

export interface LanguageOption {
  code: InspectionLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  speechLang: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English (US/UK)',
    flag: '🇬🇧',
    speechLang: 'en-US'
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिंदी (Standard)',
    flag: '🇮🇳',
    speechLang: 'hi-IN'
  }
];

/**
 * Initializes and starts Web Speech Recognition
 */
export function startMultilingualRecognition(
  lang: InspectionLanguage,
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError: (err: any) => void
): any {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError(new Error('Speech recognition not supported in this browser'));
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onend = onEnd;
    recognition.onerror = onError;

    recognition.start();
    return recognition;
  } catch (err) {
    onError(err);
    return null;
  }
}

/**
 * Speaks text using Web SpeechSynthesis API
 */
export function speakInspectionVoice(
  text: string,
  lang: InspectionLanguage,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (lang === 'hi') {
        const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
        if (hindiVoice) utterance.voice = hindiVoice;
      } else {
        const engVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en-GB') && v.name.includes('Natural')) ||
                         voices.find(v => v.lang.startsWith('en'));
        if (engVoice) utterance.voice = engVoice;
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopInspectionVoice(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Generates audio narration text for an inspection result
 */
export function generateVoiceCopilotScript(
  inspectionData: any,
  lang: InspectionLanguage
): string {
  const isSupported = inspectionData.inspectionEligible !== false;
  const assetName = inspectionData.assetName || inspectionData.detectedCategory || 'Asset';
  const score = inspectionData.healthScore?.finalScore ?? 75;
  const defectsCount = Array.isArray(inspectionData.defects) ? inspectionData.defects.length : 0;

  if (lang === 'hi') {
    if (!isSupported) {
      return `ध्यान दें: अपलोड की गई छवि किसी समर्थित औद्योगिक या सिविल ढांचे से मेल नहीं खाती। दोष निरीक्षण लागू नहीं है।`;
    }
    if (defectsCount === 0) {
      return `${assetName} का निरीक्षण पूरा हुआ। कोई दृश्य दोष नहीं पाया गया। स्वास्थ्य स्कोर ${score} है।`;
    }
    return `${assetName} का एआई दृश्य निरीक्षण पूरा हुआ। ${defectsCount} दृश्य विसंगतियाँ पाई गई हैं। स्वास्थ्य स्कोर ${score} है। योग्य इंजीनियर द्वारा पुष्टि आवश्यक है।`;
  }

  // English
  if (!isSupported) {
    return `Notice: The uploaded image does not contain a supported industrial or infrastructure asset. Flaw inspection is not applicable.`;
  }
  if (defectsCount === 0) {
    return `Visual inspection of ${assetName} completed. No visible surface defects detected. Asset health score is ${score} out of 100.`;
  }
  return `AI visual inspection of ${assetName} completed. ${defectsCount} visual finding${defectsCount === 1 ? '' : 's'} identified with a health score of ${score}. Professional engineering verification is recommended.`;
}

/**
 * Provides truthful, non-hallucinatory copilot answers to inspector voice inquiries
 */
export function generateInspectorAnswer(
  questionText: string,
  lang: InspectionLanguage,
  context: {
    assetName?: string;
    healthScore?: number;
    status?: string;
    defects?: Array<{ name: string; severity: string; metricText?: string }>;
    failureHorizon?: string;
    diagnosticSummary?: string;
  }
): string {
  const q = questionText.toLowerCase();
  const defects = context.defects || [];
  const defectCount = defects.length;
  const topDefect = defects[0]?.name || (lang === 'hi' ? 'कोई गंभीर दोष नहीं' : 'No major defects');
  const score = context.healthScore ?? 80;
  const status = context.status || (score >= 80 ? 'Healthy' : score >= 60 ? 'Attention Needed' : 'Critical');
  const asset = context.assetName || (lang === 'hi' ? 'एसेट' : 'Asset');

  // 1. DEFECTS
  if (
    q.includes('defect') ||
    q.includes('problem') ||
    q.includes('crack') ||
    q.includes('damage') ||
    q.includes('खामियां') ||
    q.includes('समस्या') ||
    q.includes('दोष')
  ) {
    if (lang === 'hi') {
      if (defectCount === 0) return `${asset} में कोई दृश्य दोष नहीं पाया गया। सतह की स्थिति सामान्य प्रतीत होती है।`;
      return `${asset} में कुल ${defectCount} दृश्य विसंगतियाँ पाई गई हैं। मुख्य निष्कर्ष: ${topDefect}। योग्य इंजीनियर द्वारा स्थलीय सत्यापन की सलाह दी जाती है।`;
    }
    if (defectCount === 0) return `No visible defects were identified on ${asset}. Surface visual condition appears nominal.`;
    return `A total of ${defectCount} visual anomaly finding(s) were observed on ${asset}. Primary finding: ${topDefect}. Qualified on-site engineering verification is recommended.`;
  }

  // 2. HEALTH SCORE / STATUS
  if (
    q.includes('health') ||
    q.includes('score') ||
    q.includes('condition') ||
    q.includes('status') ||
    q.includes('स्थिति') ||
    q.includes('स्कोर')
  ) {
    if (lang === 'hi') {
      return `${asset} का वर्तमान दृश्य स्वास्थ्य स्कोर ${score}/100 है (${status})। यह 40/30/20/10 भारित विश्लेषण पर आधारित है।`;
    }
    return `The visual health score for ${asset} is ${score}/100 with status '${status}', calculated using the transparent 40/30/20/10 weighted formula.`;
  }

  // 3. FAILURE HORIZON / LIFETIME
  if (
    q.includes('failure') ||
    q.includes('horizon') ||
    q.includes('life') ||
    q.includes('timeline') ||
    q.includes('समय') ||
    q.includes('फेलियर')
  ) {
    if (lang === 'hi') {
      return `विफलता समय-सीमा का निर्धारण योग्य संरचनात्मक इंजीनियर द्वारा कैलिब्रेटेड मापों के आधार पर ही किया जाना चाहिए। एआई केवल प्रारंभिक दृश्य संकेत प्रदान करता है।`;
    }
    return `Failure horizon estimation requires calibrated physical measurements and certified structural engineering evaluation. The AI platform provides preliminary visual observations only.`;
  }

  // 4. ACTION / MAINTENANCE / REPAIR / STEPS
  if (
    q.includes('action') ||
    q.includes('repair') ||
    q.includes('maintenance') ||
    q.includes('step') ||
    q.includes('उपाय') ||
    q.includes('कदम')
  ) {
    if (lang === 'hi') {
      return `सिफारिश किए गए सुरक्षित कदम: 1. चिह्नित क्षेत्र की भौतिक जांच करें। 2. क्लोज़-अप तस्वीरें लें। 3. कैलिब्रेटेड उपकरणों से माप लें। 4. योग्य इंजीनियर से समीक्षा कराएं।`;
    }
    return `Recommended 5-step workflow: 1. Review flagged area manually on site. 2. Capture high-resolution close-up imagery. 3. Perform calibrated physical measurement. 4. Obtain qualified engineer sign-off before repairs.`;
  }

  // DEFAULT SUMMARY
  if (lang === 'hi') {
    return `${asset} का एआई सारांश: स्वास्थ्य स्कोर ${score}/100 (${status}), कुल ${defectCount} दृश्य निष्कर्ष। पेशेवर इंजीनियरिंग सत्यापन आवश्यक है।`;
  }
  return `AI Inspection summary for ${asset}: Health score ${score}/100 (${status}) with ${defectCount} visual finding(s). Professional engineering verification recommended.`;
}

