import { useEffect, useState, useRef } from "react";
import {
  TranscriptionSegment,
  Participant,
  TrackPublication,
  RoomEvent,
  LocalParticipant,
} from "livekit-client";
import { useMaybeRoomContext } from "@livekit/components-react";

export default function Transcriptions() {
  const room = useMaybeRoomContext();
  const [transcriptions, setTranscriptions] = useState<
    {
      id: string;
      key: number;
      text: string;
      speaker: "user" | "ai";
      identity: string;
    }[]
  >([]);
  const currentSpeaker = useRef<"user" | "ai" | null>(null);
  const currentMessage = useRef<{
    id: string;
    key: number;
    text: string;
    speaker: "user" | "ai";
    identity: string;
  } | null>(null);

  useEffect(() => {
    if (!room) return;

    const updateTranscriptions = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      publication?: TrackPublication
    ) => {
      console.log("Transcription received", segments, participant, publication);

      setTranscriptions((prev) => {
        const updated = [...prev];
        for (const segment of segments) {
          const speaker: "user" | "ai" =
            participant instanceof LocalParticipant ? "user" : "ai";
          const identity = participant?.identity || speaker;

          if (currentSpeaker.current !== speaker) {
            // Speaker switched — push the current message if it exists
            if (currentMessage.current) {
              updated.push({ ...currentMessage.current });
            }
            // Start a new message
            currentMessage.current = {
              id: segment.id,
              key: segment.lastReceivedTime,
              text: segment.text,
              speaker,
              identity,
            };
            currentSpeaker.current = speaker;
          } else {
            // Same speaker — update current message
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

          // If final, commit immediately
          if (segment.final && currentMessage.current) {
            updated.push({ ...currentMessage.current });
            currentMessage.current = null;
            currentSpeaker.current = null;
          }
        }
        return updated;
      });
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
