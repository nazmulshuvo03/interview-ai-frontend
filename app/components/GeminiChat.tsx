"use client";

import { useState } from "react";

export default function GeminiChat() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setReply("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || ""}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        },
      );

      const data = await res.json();
      setReply(data.reply || "No reply");
    } catch (err) {
      console.error(err);
      setReply("❌ Error calling Gemini API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 border rounded shadow space-y-4 bg-white">
      <h2 className="text-xl font-bold">💬 Ask Gemini</h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        rows={3}
        className="w-full p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={!input.trim() || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Thinking..." : "Ask Gemini"}
      </button>

      {reply && (
        <div className="p-3 border bg-gray-50 rounded">
          <strong>Gemini:</strong>
          <p>{reply}</p>
        </div>
      )}
    </div>
  );
}
