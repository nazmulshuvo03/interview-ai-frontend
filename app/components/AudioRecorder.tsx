"use client";

import { useEffect, useRef, useState } from "react";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  async function fetchDocs() {
    const res = await fetch("/api/whisper", {
      method: "GET",
    });
    console.log("Docs: ", res);
  }

  useEffect(() => {
    fetchDocs();
  }, []);

  const startRecording = async () => {
    setAudioURL(null);
    setTranscription(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        const file = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/whisper", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          console.log("Transcription response: ", result);
          setTranscription(result.text);
        } catch (err) {
          console.error("Transcription error:", err);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold">🎙 Whisper Audio Transcription</h2>
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded text-white ${recording ? "bg-red-600" : "bg-blue-600"}`}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioURL && (
        <div>
          <p className="mt-4 font-semibold">Playback:</p>
          <audio src={audioURL} controls className="w-full mt-2" />
        </div>
      )}

      {transcription && (
        <div className="mt-4 p-3 border bg-gray-50 rounded">
          <p className="font-semibold">Transcription:</p>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}
