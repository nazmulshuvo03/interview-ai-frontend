import {
  TrackReferenceOrPlaceholder,
  useLocalParticipant,
  useTrackTranscription,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMemo } from "react";

export default function useLocalMicTrack() {
  const { microphoneTrack, localParticipant } = useLocalParticipant();

  console.log(
    "microphoneTrack",
    microphoneTrack,
    useTrackTranscription({
      participant: localParticipant,
      source: Track.Source.Microphone,
      publication: microphoneTrack,
    })
  );

  const micTrackRef: TrackReferenceOrPlaceholder = useMemo(() => {
    return {
      participant: localParticipant,
      source: Track.Source.Microphone,
      publication: microphoneTrack,
    };
  }, [localParticipant, microphoneTrack]);

  return micTrackRef;
}
