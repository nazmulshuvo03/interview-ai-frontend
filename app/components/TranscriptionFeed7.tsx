"use client";

import { useEffect, useState, useRef } from "react";
import {
  TranscriptionSegment,
  Participant,
  TrackPublication,
  RoomEvent,
  LocalParticipant,
} from "livekit-client";
import { useMaybeRoomContext } from "@livekit/components-react";

type TranscriptEntry = {
  id: string;
  key: number;
  text: string;
  speaker: "user" | "ai";
  identity: string;
};

export default function Transcriptions() {
  const room = useMaybeRoomContext();
  const [transcriptions, setTranscriptions] = useState<TranscriptEntry[]>([]);
  const currentSpeaker = useRef<"user" | "ai" | null>(null);
  const currentMessage = useRef<TranscriptEntry | null>(null);

  // LocalStorage or DB entry point
  const storeTranscript = (entry: TranscriptEntry) => {
    if (!entry.text.trim()) return;

    // Save to state
    setTranscriptions((prev) => [...prev, entry]);

    // Save to localStorage
    try {
      const existing = JSON.parse(
        localStorage.getItem("interview_transcript") || "[]",
      );
      localStorage.setItem(
        "interview_transcript",
        JSON.stringify([...existing, entry]),
      );
    } catch (e) {
      console.error("Failed to store transcript in localStorage", e);
    }

    // TODO: Send transcriptions to Database
  };

  useEffect(() => {
    if (!room) return;

    const updateTranscriptions = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      publication?: TrackPublication,
    ) => {
      console.log("Transcription received", segments, participant, publication);

      for (const segment of segments) {
        const speaker: "user" | "ai" =
          participant instanceof LocalParticipant ? "user" : "ai";
        const identity = participant?.identity || speaker;

        if (currentSpeaker.current !== speaker) {
          if (currentMessage.current) {
            storeTranscript({ ...currentMessage.current });
          }
          currentMessage.current = {
            id: segment.id,
            key: segment.lastReceivedTime,
            text: segment.text,
            speaker,
            identity,
          };
          currentSpeaker.current = speaker;
        } else {
          if (currentMessage.current) {
            currentMessage.current.text = segment.text;
            currentMessage.current.key = segment.lastReceivedTime;
          } else {
            currentMessage.current = {
              id: segment.id,
              key: segment.lastReceivedTime,
              text: segment.text,
              speaker,
              identity,
            };
            currentSpeaker.current = speaker;
          }
        }

        if (segment.final && currentMessage.current) {
          storeTranscript({ ...currentMessage.current });
          currentMessage.current = null;
          currentSpeaker.current = null;
        }
      }
    };

    room.on(RoomEvent.TranscriptionReceived, updateTranscriptions);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateTranscriptions);
    };
  }, [room]);

  return (
    <ul>
      {transcriptions
        .sort((a, b) => a.key - b.key)
        .map((msg, index) => (
          <li key={`${msg.speaker}-${msg.key}-${index}`}>
            [{msg.identity}] {msg.text}
          </li>
        ))}
    </ul>
  );
}
