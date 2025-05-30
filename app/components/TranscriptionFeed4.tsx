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
  const [messages, setMessages] = useState<Message[]>([]);
  const lastFinalRef = useRef(true);

  useEffect(() => {
    const handleTranscription = (segments: TranscriptionSegment[]) => {
      setMessages((prev) => {
        const updated = [...prev];

        for (const seg of segments) {
          const speaker: "user" | "ai" = lastFinalRef.current ? "user" : "ai";
          const msg: Message = {
            id: seg.id,
            speaker,
            text: seg.text,
            final: seg.final,
            lastReceivedTime: seg.lastReceivedTime,
          };

          if (speaker === "user") {
            // Always add user messages — use lastReceivedTime as unique key
            const exists = updated.find(
              (m) => m.lastReceivedTime === seg.lastReceivedTime,
            );
            if (!exists) updated.push(msg);
          } else {
            // AI: update if ID exists, else push
            const idx = updated.findIndex((m) => m.id === seg.id);
            if (idx !== -1) {
              updated[idx] = msg;
            } else {
              updated.push(msg);
            }
          }

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

  // Sort by time for correct order
  const sortedMessages = [...messages].sort(
    (a, b) => a.lastReceivedTime - b.lastReceivedTime,
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-2">
      <h2 className="font-semibold text-lg mb-3">💬 Chat</h2>
      {sortedMessages.map((msg) => (
        <div
          key={msg.lastReceivedTime}
          className={`max-w-[80%] px-3 py-2 rounded text-sm ${
            msg.speaker === "user"
              ? "bg-blue-100 text-left self-start"
              : "bg-purple-100 text-right self-end ml-auto"
          } ${msg.final ? "opacity-100" : "opacity-60 italic"}`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
