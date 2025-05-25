// pages/api/create-room.ts
import { NextRequest, NextResponse } from "next/server";
import { Room, RoomServiceClient } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  const { room, name, instructions } = await req.json();

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  const wsUrl = process.env.LIVEKIT_URL!;

  const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);

  console.log("instructions: ", instructions);

  await svc.createRoom({
    name: room,
    // username: name,
    metadata: JSON.stringify({ instructions }),
    emptyTimeout: 60, // optional
  });

  return NextResponse.json({ success: true });
}
