# UI Template Plan

Date: 2026-05-21

## Selected Production Template

Primary catalog influence: `devops-platform` / Vercel-style platform surface from `/Users/gabrielantonyxaviour/Documents/templates/INDEX.md`.

Reason: this product is not a generic CRUD dashboard. Judges need to see a serious control plane for protocol allocation, receipts, and deployment state. The devops/platform catalog lane fits a live infrastructure workbench better than an editorial or agency layout.

## Selected MotionSites Prompts And Local Patterns

- `portal-hero` from `/Users/gabrielantonyxaviour/Documents/templates/.motionsites-prompts/portal.md`
  - Reuse: black full-screen cinematic hero, liquid-glass buttons/cards, staggered blur-fade-up animation, bottom-aligned hero control language.
- `convix-software-hero` via local `template-saas-software/PROMPT.md`
  - Reuse: gauge card grammar, compact control surface, numerical target/actual cards, rounded clipped hero frame.
- `codenest-coding-platform` local sections
  - Reuse: high-contrast grid, small uppercase meta labels, engineering/control-room density.

## Visual System

- Brand name: `Mezo Allocator`
- Background: black with non-purple, non-blue dominant palette.
- Accent colors: BTC amber `#f7931a`, MUSD mint `#68e6b1`, warm ivory `#f8f3e7`, dark graphite `#080907`.
- Typography: Inter for UI, Instrument Serif italic sparingly for one word in the hero.
- UI feel: protocol command center, not consumer DeFi toy.
- Cards: liquid-glass with thin borders; no nested cards.
- Icons: lucide-react for wallet, vote, receipt, gauge, explorer, lock, activity.

## First-Screen Judge Moment

The first viewport must show:

- Headline: "MEZO becomes the dial that steers Bitcoin-backed capital."
- One allocation workbench visible immediately, with fixture/testnet proof labeling kept explicit.
- A vote allocation control with weights, boost, and before/after gauge allocation.
- A receipt panel with `AllocationUpdated` and mode label (`Fixture`, `Local`, or `Mezo Testnet`).

## Motion Language

- Staggered blur-fade-up for hero copy and panels.
- Hover lift only on interactive controls.
- Animated gauges and allocation bars, but no decorative orbs/blobs.
- Respect `prefers-reduced-motion`.

## Code/Design To Copy Or Adapt

- `.liquid-glass` CSS from Portal prompt.
- Gauge card layout from Convix SaaS prompt, adapted to MEZO allocation instead of marketing metrics.
- Section reveal and dense grid rhythm from CodeNest sections.
- Avoid template video backgrounds because this product needs visible protocol UI, not atmospheric stock media.

## Visual QA Acceptance

- Routes tested at 375px, 768px, and 1440px.
- No text overlap in hero/control panels.
- Receipt mode labels must be visible and unambiguous.
- The first viewport must show product, not a marketing-only hero.
- Color palette must not collapse into one hue family.
