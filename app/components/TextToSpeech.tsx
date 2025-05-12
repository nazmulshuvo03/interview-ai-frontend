"use client";

import { useState } from "react";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const handleSpeak = async () => {
    setLoading(true);
    setAudioURL(null);

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Failed to generate speech");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate speech");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold">🗣 Text-to-Speech</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to speak"
        className="w-full p-2 border rounded"
        rows={3}
      />

      <button
        onClick={handleSpeak}
        disabled={loading || !text.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Speak"}
      </button>

      {audioURL && (
        <audio controls autoPlay className="w-full">
          <source src={audioURL} type="audio/wav" />
          Your browser does not support audio playback.
        </audio>
      )}
    </div>
  );
}
