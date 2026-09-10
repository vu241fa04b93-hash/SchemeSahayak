import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: {results: ArrayLike<ArrayLike<{transcript: string;}>>;}) => void) | null;
  onerror: ((event: {error: string;}) => void) | null;
  onend: (() => void) | null;
}

type Ctor = new () => SpeechRecognitionLike;

function getConstructor(): Ctor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {SpeechRecognition?: Ctor;webkitSpeechRecognition?: Ctor;};
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechState {
  /** false when the browser has no Web Speech API — hide the button entirely */
  supported: boolean;
  listening: boolean;
  blocked: boolean;
  start: () => void;
  stop: () => void;
}

/**
 * Real Web Speech API. The transcript is handed back to the caller so it can
 * be dropped into the input for editing before sending.
 */
export function useSpeechRecognition(
locale: string,
onTranscript: (text: string) => void)
: SpeechState {
  const [supported] = useState<boolean>(() => getConstructor() !== null);
  const [listening, setListening] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const ref = useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = useRef(onTranscript);
  callbackRef.current = onTranscript;

  useEffect(() => {
    return () => {
      try {
        ref.current?.stop();
      } catch {

        /* already stopped */}
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = getConstructor();
    if (!Ctor) return;
    try {
      ref.current?.stop();
    } catch {

      /* no active session */}

    const recognition = new Ctor();
    recognition.lang = locale;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) callbackRef.current(transcript.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') setBlocked(true);
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    ref.current = recognition;
    setBlocked(false);
    try {
      recognition.start();
      setListening(true);
    } catch {
      setBlocked(true);
      setListening(false);
    }
  }, [locale]);

  const stop = useCallback(() => {
    try {
      ref.current?.stop();
    } catch {

      /* already stopped */}
    setListening(false);
  }, []);

  return { supported, listening, blocked, start, stop };
}