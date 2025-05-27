import { db, TranscriptEntry } from "@/lib/db";

export async function getAllTranscriptions() {
  const all = await db.transcriptions.orderBy("key").toArray();
  return all;
}

export async function addTranscription(entry: TranscriptEntry) {
  console.log("add transcriptions: ", entry);
  await db.transcriptions.add(entry);
}

export async function clearTranscriptions() {
  await db.transcriptions.clear();
}
