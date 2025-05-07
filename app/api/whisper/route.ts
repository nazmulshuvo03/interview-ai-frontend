import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.SST_URL}/docs`, {
      method: "GET",
    });
    return new Response(JSON.stringify(res), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to connect to local Whisper" }),
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
    });
  }

  const localWhisperForm = new FormData();
  localWhisperForm.append("file", file, "recording.webm");

  try {
    const whisperRes = await fetch(`${process.env.SST_URL}/transcribe`, {
      method: "POST",
      body: localWhisperForm,
    });

    const data = await whisperRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Local Whisper error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to connect to local Whisper" }),
      { status: 500 },
    );
  }
}
