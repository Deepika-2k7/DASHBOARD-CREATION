import type { IncomingMessage, ServerResponse } from "http";
import { app, initializeDatabase } from "../server/src/index.js";

let dbInitialized = false;

const ensureDatabase = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  await ensureDatabase();
  return app(req as any, res as any);
};
