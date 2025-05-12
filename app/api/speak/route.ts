import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const whisperRes = await fetch(`${process.env.SST_URL}/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const audio = await whisperRes.arrayBuffer();

  return new Response(audio, {
    headers: {
      "Content-Type": "audio/wav",
    },
  });
}
