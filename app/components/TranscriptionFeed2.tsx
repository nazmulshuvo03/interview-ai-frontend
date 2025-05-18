"use client";

import { useEffect, useState, useRef } from "react";
import { RoomEvent, TranscriptionSegment } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";

type Message = {
  id: string;
  speaker: "user" | "ai";
  text: string;
  final: boolean;
};

export default function TranscriptionFeed() {
  const room = useRoomContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const lastFinalRef = useRef(true); // helps us detect speaker role

  useEffect(() => {
    const handleTranscription = (segments: TranscriptionSegment[]) => {
      console.log(segments);
      setMessages((prev) => {
        const updated = [...prev];

        for (const seg of segments) {
          const isUser = lastFinalRef.current === true;
          const speaker: "user" | "ai" = isUser ? "user" : "ai";

          const index = updated.findIndex((m) => m.id === seg.id);

          if (isUser) {
            // 👤 USER: always add, never update
            if (index === -1) {
              updated.push({
                id: seg.id,
                speaker,
                text: seg.text,
                final: seg.final,
              });
            }
          } else {
            // 🤖 AI: update if existing, else add new
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                text: seg.text,
                final: seg.final,
              };
            } else {
              updated.push({
                id: seg.id,
                speaker,
                text: seg.text,
                final: seg.final,
              });
            }
          }

          // Always track final status
          lastFinalRef.current = seg.final;
        }

        return updated;
      });
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room]);

  return (
    <div className="p-4 space-y-2 max-w-2xl mx-auto bg-gray-50 rounded">
      <h2 className="font-semibold text-lg mb-2">🎙 Live Transcript</h2>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`px-3 py-2 rounded text-sm ${
            msg.speaker === "user"
              ? "bg-white text-left"
              : "bg-blue-100 text-right"
          } ${msg.final ? "opacity-100" : "opacity-60 italic"}`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
