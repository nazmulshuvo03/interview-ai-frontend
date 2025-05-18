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

  // Tracks current in-progress segment ID and who it belongs to
  const bufferRef = useRef<{ id: string | null; speaker: "user" | "ai" }>({
    id: null,
    speaker: "user",
  });

  useEffect(() => {
    const handleTranscription = (segments: TranscriptionSegment[]) => {
      console.log(segments);
      setMessages((prev) => {
        const updated = [...prev];

        for (const seg of segments) {
          let speaker: "user" | "ai";

          if (
            bufferRef.current.id !== seg.id &&
            seg.final &&
            bufferRef.current.id !== null
          ) {
            // New segment ID after a final one → switch speaker
            speaker = bufferRef.current.speaker === "user" ? "ai" : "user";
          } else {
            // Continuing same speaker
            speaker = bufferRef.current.speaker;
          }

          // Update buffer to current segment and speaker
          bufferRef.current = {
            id: seg.id,
            speaker,
          };

          const msg: Message = {
            id: seg.id,
            speaker,
            text: seg.text,
            final: seg.final,
            lastReceivedTime: seg.lastReceivedTime,
          };

          if (speaker === "user") {
            const exists = updated.find(
              (m) => m.lastReceivedTime === seg.lastReceivedTime,
            );
            if (!exists) updated.push(msg);
          } else {
            const idx = updated.findIndex((m) => m.id === seg.id);
            if (idx !== -1) {
              updated[idx] = msg;
            } else {
              updated.push(msg);
            }
          }
        }

        return updated;
      });
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room]);

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
