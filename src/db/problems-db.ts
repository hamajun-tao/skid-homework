import Dexie, { type Table } from "dexie";
import type { Solution, FileStatus } from "@/store/problems-store";

export interface HomeworkRecord {
  id: string;
  blob: Blob; // The image file content
  fileName: string;
  mimeType: string;
  source: "upload" | "camera";
  status: FileStatus;
  createdAt: number;

  // The solution is embedded directly.
  // If undefined, no solution has been generated yet.
  solution?: Solution;
}

export class ProblemsDatabase extends Dexie {
  homeworks!: Table<HomeworkRecord>;

  constructor() {
    super("ProblemsDB");
    this.version(1).stores({
      homeworks: "id, createdAt, status", // Primary key and searchable indexes
    });
  }
}

export const db = new ProblemsDatabase();
