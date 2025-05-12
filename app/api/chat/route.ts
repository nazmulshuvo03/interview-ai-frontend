import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const response = await fetch(`${process.env.SST_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
