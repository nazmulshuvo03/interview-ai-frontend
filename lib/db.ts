// app/db.ts
import Dexie, { Table } from "dexie";

export interface TranscriptEntry {
  id: string;
  key: number;
  text: string;
  speaker: "user" | "ai";
  identity: string;
}

class TranscriptionDB extends Dexie {
  transcriptions!: Table<TranscriptEntry>;

  constructor() {
    super("TranscriptionDatabase");
    this.version(1).stores({
      transcriptions: "++key, id, speaker, identity",
    });
  }
}

export const db = new TranscriptionDB();
