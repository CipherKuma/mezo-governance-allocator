import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    `SELECT g.id, g.name, g.on_chain_gauge_id,
            SUM(CAST(er.musd_distributed AS REAL)) as total_musd
     FROM gauges g
     JOIN epoch_results er ON g.id = er.gauge_id
     WHERE g.status = 'approved'
     GROUP BY g.id
     ORDER BY total_musd DESC`,
  ).all();
  return Response.json(results);
};
