"use client";

import { useEffect, useState, useRef } from "react";
import { RoomEvent, TranscriptionSegment } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";

type Message = {
  id: string;
  speaker: "user" | "ai";
  text: string;
  final: boolean;
  lastReceivedTime: number;
};

export default function TranscriptionFeed() {
  const room = useRoomContext();
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const lastFinalRef = useRef(true);

  useEffect(() => {
    const handleTranscription = (segments: TranscriptionSegment[]) => {
      for (const seg of segments) {
        console.log(seg);
        const isUser = lastFinalRef.current === true;
        const speaker: "user" | "ai" = isUser ? "user" : "ai";
        const msg = {
          id: seg.id,
          speaker,
          text: seg.text,
          final: seg.final,
          lastReceivedTime: seg.lastReceivedTime,
        };

        if (speaker === "user") {
          setUserMessages((prev) => {
            // Never update user message — just push new
            const exists = prev.find(
              (m) => m.lastReceivedTime === seg.lastReceivedTime,
            );
            return exists ? prev : [...prev, msg];
          });
        } else {
          setAiMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === seg.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = msg;
              return updated;
            }
            return [...prev, msg];
          });
        }

        lastFinalRef.current = seg.final;
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room]);

  return (
    <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto p-4">
      {/* USER COLUMN */}
      <div className="space-y-2">
        <h3 className="font-bold text-blue-700">You</h3>
        {userMessages.map((msg) => (
          <div
            key={msg.lastReceivedTime}
            className={`p-2 rounded bg-blue-100 text-sm ${
              msg.final ? "opacity-100" : "opacity-60 italic"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* AI COLUMN */}
      <div className="space-y-2 text-right">
        <h3 className="font-bold text-purple-700">AI</h3>
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded bg-purple-100 text-sm inline-block ${
              msg.final ? "opacity-100" : "opacity-60 italic"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
