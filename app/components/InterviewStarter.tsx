"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function InterviewStarter() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleStart = async () => {
    const room = `interview-${uuidv4()}`;
    try {
      // Create room explicitly with metadata (instructions)
      await fetch("/api/create-room", {
        method: "POST",
        body: JSON.stringify({
          room,
          instructions:
            "The name of the user is Nazmul Alom. He is a Full Stack Developer with 6 years of experience. He is applying for a Full stack developer position at Upsurge. Main focus of the interview will be React, NextJs and NodeJs, with PostgreSQL database",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const safeName =
        username.trim() || `user-${Math.floor(Math.random() * 1000)}`;

      router.push(`/room?room=${room}&user=${encodeURIComponent(safeName)}`);
    } catch (err) {
      alert("Error creating room: ", err);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Start a New Interview</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleStart}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Start Interview
      </button>
    </div>
  );
}
