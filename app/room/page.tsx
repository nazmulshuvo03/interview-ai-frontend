"use client";

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import TranscriptionFeed from "../components/TranscriptionFeed";
import SummarizeTranscript from "../components/SummarizeTranscript";
import { useSearchParams, useRouter } from "next/navigation";
import { clearTranscriptions } from "@/lib/actions/transcriptions";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const room = searchParams.get("room") || "default-room";
  const name = searchParams.get("user") || "anonymous";
  const [token, setToken] = useState("");
  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      }),
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch(`/api/token?room=${room}&username=${name}`);
        const data = await resp.json();
        if (!mounted) return;
        if (data.token) {
          setToken(data.token);
          await roomInstance.connect(
            process.env.NEXT_PUBLIC_LIVEKIT_URL,
            data.token,
          );
        } else setToken("");
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      mounted = false;
      roomInstance.disconnect();
    };
  }, [roomInstance, room, name]);

  const handleLeave = async () => {
    clearTranscriptions();
    localStorage.removeItem("interview_transcript");
    await roomInstance.disconnect();
    router.push("/");
  };

  if (token === "") {
    return <div>Getting token...</div>;
  }

  return (
    <RoomContext.Provider value={roomInstance}>
      <div data-lk-theme="default" style={{ height: "100dvh" }}>
        <MyVideoConference />
        <RoomAudioRenderer />
        <ControlBar />
        <button
          onClick={handleLeave}
          className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Leave Room
        </button>
      </div>
      <SummarizeTranscript />
      <TranscriptionFeed />
    </RoomContext.Provider>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}
