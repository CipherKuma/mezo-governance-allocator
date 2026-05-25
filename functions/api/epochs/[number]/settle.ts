import type { D1Database } from "@cloudflare/workers-types";
import { verifyMessage } from "viem";

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async ({
  env,
  params,
  request,
}) => {
  const num = parseInt(params.number as string, 10);
  if (isNaN(num)) return new Response("invalid epoch number", { status: 400 });

  const body = await request.json<{
    settlerWallet: string;
    signature: string;
    message: string;
    txHash: string;
    results: Array<{
      gaugeId: string;
      votesReceived: string;
      musdDistributed: string;
    }>;
  }>();

  const valid = await verifyMessage({
    address: body.settlerWallet as `0x${string}`,
    message: body.message,
    signature: body.signature as `0x${string}`,
  });
  if (!valid) return new Response("invalid signature", { status: 401 });

  const stmts = [
    env.DB.prepare(
      "UPDATE epochs SET settled_at = unixepoch(), settle_tx_hash = ? WHERE epoch_number = ?",
    ).bind(body.txHash, num),
    ...body.results.map((r) =>
      env.DB.prepare(
        `INSERT INTO epoch_results (id, epoch_number, gauge_id, votes_received, musd_distributed)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(epoch_number, gauge_id) DO UPDATE SET
           votes_received = excluded.votes_received,
           musd_distributed = excluded.musd_distributed`,
      ).bind(
        crypto.randomUUID(),
        num,
        r.gaugeId,
        r.votesReceived,
        r.musdDistributed,
      ),
    ),
  ];

  await env.DB.batch(stmts);
  return Response.json({ ok: true, epoch: num });
};
