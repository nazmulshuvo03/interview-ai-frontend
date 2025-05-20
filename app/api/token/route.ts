import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

// Do not cache endpoint result
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");
  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 },
    );
  } else if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" query parameter' },
      { status: 400 },
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  const customInstructions =
    "The name of the user is Nazmul Alom. He is a Full Stack Developer with 6 years of experience. He is applying for a Full stack developer position at Upsurge. Main focus of the interview will be React, NextJs and NodeJs, with PostgreSQL database";

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    metadata: JSON.stringify({ instructions: customInstructions }),
  });

  return NextResponse.json(
    { token: await at.toJwt() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
