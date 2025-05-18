import { useEffect, useState } from "react";
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
    { id: string; key: number; text: string; speaker: "user" | "ai" }[]
  >([]);

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

          if (speaker === "user") {
            // Push only if not already stored by unique lastReceivedTime
            const exists = updated.find(
              (m) => m.key === segment.lastReceivedTime && m.speaker === "user"
            );
            if (!exists) {
              updated.push({
                id: segment.id,
                key: segment.lastReceivedTime,
                text: segment.text,
                speaker,
              });
            }
          } else {
            const index = updated.findIndex(
              (m) => m.id === segment.id && m.speaker === "ai"
            );
            if (index !== -1) {
              updated[index] = {
                id: segment.id,
                key: segment.lastReceivedTime,
                text: segment.text,
                speaker,
              };
            } else {
              updated.push({
                id: segment.id,
                key: segment.lastReceivedTime,
                text: segment.text,
                speaker,
              });
            }
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
        .map((msg) => (
          <li key={`${msg.speaker}-${msg.key}`}>
            [{msg.speaker}] {msg.text}
          </li>
        ))}
    </ul>
  );
}
