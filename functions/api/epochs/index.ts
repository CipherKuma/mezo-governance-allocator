import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM epochs ORDER BY epoch_number DESC LIMIT 20",
  ).all();
  return Response.json(results);
};
