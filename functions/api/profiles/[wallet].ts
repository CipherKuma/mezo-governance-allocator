import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const wallet = (params.wallet as string).toLowerCase();
  const row = await env.DB.prepare(
    "SELECT * FROM profiles WHERE wallet_address = ?",
  )
    .bind(wallet)
    .first();
  if (!row) return new Response("not found", { status: 404 });
  return Response.json(row);
};

export const onRequestPut: PagesFunction<Env> = async ({
  env,
  params,
  request,
}) => {
  const wallet = (params.wallet as string).toLowerCase();
  const body = await request.json<{
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  }>();

  await env.DB.prepare(
    `INSERT INTO profiles (wallet_address, display_name, avatar_url, bio)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(wallet_address) DO UPDATE SET
       display_name = COALESCE(excluded.display_name, profiles.display_name),
       avatar_url = COALESCE(excluded.avatar_url, profiles.avatar_url),
       bio = COALESCE(excluded.bio, profiles.bio)`,
  )
    .bind(
      wallet,
      body.display_name ?? null,
      body.avatar_url ?? null,
      body.bio ?? null,
    )
    .run();

  return Response.json({ ok: true });
};
