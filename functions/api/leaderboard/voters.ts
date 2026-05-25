import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    `SELECT wallet_address, display_name, total_votes_cast
     FROM profiles
     WHERE total_votes_cast > 0
     ORDER BY total_votes_cast DESC
     LIMIT 50`,
  ).all();
  return Response.json(results);
};
