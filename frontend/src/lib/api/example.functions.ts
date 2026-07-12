"use server";

import { z } from "zod";
import { getServerConfig } from "../config.server";

// Migrated to Next.js Server Action. Can be invoked directly from client components.
export async function getGreeting({ name }: { name: string }) {
  const parsed = z.object({ name: z.string().min(1) }).safeParse({ name });
  if (!parsed.success) {
    throw new Error("Invalid input");
  }
  const config = getServerConfig();
  return {
    greeting: `Hello, ${parsed.data.name}!`,
    mode: config.nodeEnv ?? "unknown",
  };
}
