import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const num = parseInt(params.number as string, 10);
  if (isNaN(num)) return new Response("invalid epoch number", { status: 400 });

  const epoch = await env.DB.prepare(
    "SELECT * FROM epochs WHERE epoch_number = ?",
  )
    .bind(num)
    .first();
  if (!epoch) return new Response("not found", { status: 404 });

  const { results: epochResults } = await env.DB.prepare(
    `SELECT er.*, g.name as gauge_name FROM epoch_results er
     JOIN gauges g ON er.gauge_id = g.id
     WHERE er.epoch_number = ? ORDER BY CAST(er.votes_received AS REAL) DESC`,
  )
    .bind(num)
    .all();

  return Response.json({ ...epoch, results: epochResults });
};
