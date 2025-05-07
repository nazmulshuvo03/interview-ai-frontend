declare module "react-speech-recognition" {
  export interface UseSpeechRecognitionOptions {
    commands?: any[];
  }

  export interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
  }

  export interface SpeechRecognitionHook {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
  }

  const useSpeechRecognition: (
    options?: UseSpeechRecognitionOptions,
  ) => SpeechRecognitionHook;

  const SpeechRecognition: {
    startListening: (options?: {
      continuous?: boolean;
      language?: string;
    }) => void;
    stopListening: () => void;
    abortListening: () => void;
  };

  export { useSpeechRecognition, SpeechRecognition };
  export default SpeechRecognition;
}
