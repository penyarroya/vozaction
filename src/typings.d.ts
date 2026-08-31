// src/typings.d.ts
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  var SpeechRecognition: {
    new(): SpeechRecognition;
    prototype: SpeechRecognition;
  };

  interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onend: (event: any) => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
    onstart: (event: any) => void;
    start: () => void;
    stop: () => void;
    abort: () => void;
  }
}

export {};