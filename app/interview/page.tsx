"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import TranscriptionFeed from "../components/TranscriptionFeed";

export default function InterviewPage() {
  const [token, setToken] = useState<string | null>(null);
  const roomName = "interview-room";
  const username = "user-" + Math.floor(Math.random() * 10000);

  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch(
        `/api/token?room=${roomName}&username=${username}`,
      );
      const data = await res.json();
      setToken(data.token);
    };
    fetchToken();
  }, []);

  if (!token) return <div>Loading...</div>;

  return (
    <div style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}>
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        connect={true}
        audio={true}
        video={false}
        data-lk-theme="default"
      >
        <VideoConference />
        <TranscriptionFeed />
      </LiveKitRoom>
    </div>
  );
}
