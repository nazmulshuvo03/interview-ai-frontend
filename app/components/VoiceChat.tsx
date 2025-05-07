"use client";

import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceChat: React.FC = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [finalText, setFinalText] = useState<string | null>(null);

  useEffect(() => {
    if (!listening && transcript) {
      // Save or send transcript when user stops talking
      setFinalText(transcript);

      // Example placeholder: send to your GPT API
      // await fetch('/api/gpt', { method: 'POST', body: JSON.stringify({ message: transcript }) });
    }
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <p>🎤 Microphone: {listening ? "on" : "off"}</p>
      <div className="space-x-2">
        <button
          onClick={() =>
            SpeechRecognition.startListening({
              continuous: false,
              language: "en-US",
            })
          }
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Start
        </button>
        <button
          onClick={SpeechRecognition.stopListening}
          className="px-4 py-2 rounded bg-gray-600 text-white"
        >
          Stop
        </button>
        <button
          onClick={resetTranscript}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          Reset
        </button>
      </div>
      <div className="border p-4 rounded bg-gray-50 min-h-[100px]">
        <p className="text-sm text-gray-500">Live Transcript:</p>
        <p>{transcript}</p>
      </div>
      {finalText && (
        <div className="border p-4 rounded bg-green-50 min-h-[100px]">
          <p className="text-sm text-gray-500">Final Transcript:</p>
          <p>{finalText}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
