import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string;
  const gauge = await env.DB.prepare("SELECT * FROM gauges WHERE id = ?")
    .bind(id)
    .first();
  if (!gauge) return new Response("not found", { status: 404 });
  return Response.json(gauge);
};
