import type { D1Database } from "@cloudflare/workers-types";
import { verifyMessage } from "viem";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM gauges WHERE status = 'approved' ORDER BY created_at DESC",
  ).all();
  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = await request.json<{
    submitterWallet: string;
    signature: string;
    message: string;
    name: string;
    description: string;
    onChainGaugeId: number;
    recipientWallet: string;
    pitch: string;
    requestedAmountMusd: string;
  }>();

  const valid = await verifyMessage({
    address: body.submitterWallet as `0x${string}`,
    message: body.message,
    signature: body.signature as `0x${string}`,
  });
  if (!valid) return new Response("invalid signature", { status: 401 });

  const gaugeId = crypto.randomUUID();
  const appId = crypto.randomUUID();

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO gauges (id, on_chain_gauge_id, recipient_wallet, name, description) VALUES (?, ?, ?, ?, ?)",
    ).bind(
      gaugeId,
      body.onChainGaugeId,
      body.recipientWallet,
      body.name,
      body.description,
    ),
    env.DB.prepare(
      "INSERT INTO gauge_applications (id, gauge_id, submitter_wallet, pitch, requested_amount_musd) VALUES (?, ?, ?, ?, ?)",
    ).bind(
      appId,
      gaugeId,
      body.submitterWallet,
      body.pitch,
      body.requestedAmountMusd,
    ),
  ]);

  return Response.json({ gaugeId, applicationId: appId });
};
