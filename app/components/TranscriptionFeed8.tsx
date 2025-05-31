"use client";

import { useEffect, useRef } from "react";
import {
  TranscriptionSegment,
  Participant,
  TrackPublication,
  RoomEvent,
  LocalParticipant,
} from "livekit-client";
import { useMaybeRoomContext } from "@livekit/components-react";
import { TranscriptEntry } from "@/lib/db";
import { addTranscription } from "@/lib/actions/transcriptions";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import SummarizeTranscript from "./SummarizeTranscript";

export default function TranscriptionFeed() {
  const room = useMaybeRoomContext();
  const currentSpeaker = useRef<"user" | "ai" | null>(null);
  const currentMessage = useRef<TranscriptEntry | null>(null);

  const transcriptions = useLiveQuery(() =>
    db.transcriptions.orderBy("key").toArray()
  );

  const storeTranscript = async (entry: TranscriptEntry) => {
    if (!entry.text.trim()) return;
    try {
      await addTranscription(entry);
    } catch (err) {
      console.error("Failed to save transcription", err);
    }
  };

  useEffect(() => {
    if (!room) return;

    const updateTranscriptions = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      publication?: TrackPublication
    ) => {
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

  if (!transcriptions) return <p className="p-4">Loading...</p>;

  return (
    <div>
      <SummarizeTranscript />
      <ul className="p-4 space-y-2">
        {transcriptions.map((msg) => (
          <li key={`${msg.speaker}-${msg.key}`} className="text-sm">
            <strong>[{msg.speaker}]</strong> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
