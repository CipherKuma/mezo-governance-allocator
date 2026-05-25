import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const now = Math.floor(Date.now() / 1000);
  const epoch = await env.DB.prepare(
    "SELECT * FROM epochs WHERE start_time <= ? AND end_time > ? ORDER BY epoch_number DESC LIMIT 1",
  )
    .bind(now, now)
    .first();
  if (!epoch) return Response.json({ active: false });
  return Response.json({ active: true, ...epoch });
};
