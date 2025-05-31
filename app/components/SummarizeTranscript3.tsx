"use client";

import { useState } from "react";
import { getAllTranscriptions } from "@/lib/actions/transcriptions";

export default function SummarizeTranscript() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    setLoading(true);
    setSummary("");

    try {
      const entries = await getAllTranscriptions();

      if (!entries || entries.length === 0) {
        setSummary("No transcription data found.");
        setLoading(false);
        return;
      }

      const transcriptText = entries
        .map((entry) => `${entry.speaker.toUpperCase()}: ${entry.text}`)
        .join("\n");

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: transcriptText }),
      });

      const data = await response.json();
      console.log("transcript api response: ", data);

      if (response.ok && data.summary) {
        setSummary(data.summary);
      } else {
        setSummary("Failed to generate summary.");
      }
    } catch (err) {
      console.error(err);
      setSummary("Request failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={handleSummarize}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Summarizing..." : "Summarize Conversation"}
      </button>

      {summary && (
        <div className="mt-4 p-3 bg-gray-100 rounded border">
          <h3 className="font-semibold mb-2">Summary:</h3>
          <pre className="whitespace-pre-wrap">{summary}</pre>
        </div>
      )}
    </div>
  );
}
