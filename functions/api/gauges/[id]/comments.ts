import type { D1Database } from "@cloudflare/workers-types";
import { verifyMessage } from "viem";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const gaugeId = params.id as string;
  const { results } = await env.DB.prepare(
    `SELECT c.*, p.display_name FROM comments c
     LEFT JOIN profiles p ON c.author_wallet = p.wallet_address
     WHERE c.gauge_id = ? ORDER BY c.created_at DESC`,
  )
    .bind(gaugeId)
    .all();
  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({
  env,
  params,
  request,
}) => {
  const gaugeId = params.id as string;
  const body = await request.json<{
    authorWallet: string;
    signature: string;
    message: string;
    body: string;
  }>();

  const valid = await verifyMessage({
    address: body.authorWallet as `0x${string}`,
    message: body.message,
    signature: body.signature as `0x${string}`,
  });
  if (!valid) return new Response("invalid signature", { status: 401 });

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO comments (id, gauge_id, author_wallet, body) VALUES (?, ?, ?, ?)",
  )
    .bind(id, gaugeId, body.authorWallet, body.body)
    .run();

  return Response.json({ id });
};
