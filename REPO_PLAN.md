# Repo Plan

Date: 2026-05-21

## Intended Repo

- Proposed repo name: `mezo-governance-allocator`
- Visibility: public
- Owner: BLOCKED - primary submitter not assigned

## Creation Method

Use `agent-browser` with the assigned submitter's Chrome profile when the repo must belong to a specific persona. The browser runbook requires the Chrome directory from the registry, not a guessed visible name.

Do not use `gh repo create` unless the authenticated CLI owner is proven to match the assigned submitter.

## Current Status

Blocked before persona-owned repo creation. No public repo was created in this pass because `TEAM.md` records unresolved team ambiguity.

## Push/Deploy Steps After Owner Assignment

1. Verify assigned GitHub account with `agent-browser` on `github.com/settings/profile`.
2. Create public repo `mezo-governance-allocator`.
3. Add remote.
4. Push local `main`.
5. Deploy static app to Vercel or the assigned profile's preferred static host.
6. Record repo URL, public URL, and proof in this file and `EXECUTION_PACKET.md`.
