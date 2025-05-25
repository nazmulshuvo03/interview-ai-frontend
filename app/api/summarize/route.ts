// pages/api/summarize.ts (or app/api/summarize/route.ts in app directory)
import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  console.log("transcript api body: ", transcript);

  // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  // const prompt = `Summarize this job interview:\n\n${transcript}`;
  // const result = await model.generateContent(prompt);
  // const response = await result.response;

  const prompt = `Summarize this job interview:\n\n${transcript}`;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return NextResponse.json({ summary: response.text });
}
