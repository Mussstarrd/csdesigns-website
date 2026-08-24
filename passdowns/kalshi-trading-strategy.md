# Pass-down: Kalshi Trading Strategy Session

**Session:** Claude Code remote session on branch `claude/kalshi-trading-strategy-74kevv` (repo: `mussstarrd/csdesigns-website`)
**Date:** 2026-08-24
**Author:** Claude (Claude Code), at Jeffery's request

---

## 1. What this agent was built to do

Honest framing first: **this is not a standing trading agent.** It is a single interactive Claude Code session that was opened in the `csdesigns-website` repository (a portfolio/design site — nothing here is trading infrastructure). Jeffery started the session by saying he had installed the Kalshi app on his phone, deposited $25, and wanted to discuss the highest-probability way to "flip it."

So its actual purpose, as exercised: **conversational strategy advisor** for a small-bankroll Kalshi experiment. It has no mandate, code, or authority to place trades, and no persistent process that runs between messages.

## 2. What it has built / done so far

- **One strategy discussion** (2026-08-24). Substance of the advice given:
  - Applied the Dubins–Savage "bold play" result: with a roughly-fair market and a target (e.g., double $25 → $50), the fewest-bets path maximizes the probability of hitting the target. One ~50¢ position with the full stake ≈ 50% pre-fee chance of doubling; a "grind" of ~14 consecutive 95¢ winners has essentially the same pre-fee probability (~0.95¹⁴ ≈ 49%) but pays Kalshi's per-trade fee 14 times.
  - Fee model cited: ~`0.07 × price × (1 − price)` per contract, peaking around 2¢ at 50¢; researched via web sources (PredScope, OddsShopper, TheLines), **not** verified against Kalshi's own docs — see §6.
  - Recommended: define the target first; take 1–2 convicted positions in the 40–60¢ range; only bet where Jeffery has genuine niche knowledge; use resting limit orders to avoid spread/taker costs; avoid longshot 5¢ contracts (longshot bias) and 98¢ "sure thing" ladders (fee rounding eats the tiny wins); avoid crypto hourlies and sharp sports mainlines.
  - Explicitly advised that *not* betting is the highest-probability play if no price looks wrong.
- **This pass-down document.**
- **Nothing else.** No code, no bots, no backtests, no alerts, no trades, no orders. The website commits visible in this repo's history predate and are unrelated to this session's Kalshi topic.

## 3. What signals or sources it watches

- **Nothing, continuously.** There is no monitoring loop, scheduled job, or subscription.
- Attempted during the session: Kalshi's public REST API (`api.elections.kalshi.com/trade-api/v2`) via both curl and WebFetch — **both blocked (HTTP 403)** by this environment's network proxy. So it has never seen a live Kalshi price.
- Actually used: one web search on Kalshi's fee structure (third-party explainer sites).

## 4. What it has gotten right and wrong

Concrete, with the caveat that one advisory conversation gives a thin track record:

**Right / defensible:**
- The core math (equal pre-fee doubling probability across strategies in an efficient market; fee drag making fewer trades strictly better) is standard and correct.
- Correctly recognized it could not get live market data and said so, instead of inventing prices or "today's best plays."

**Wrong / shaky:**
- **Fee precision:** stated the per-contract fee formula and rounding behavior from third-party 2026 articles. Whether Kalshi rounds up (ceiling) or to nearest cent materially changes the economics of high-price grinding (a 1¢ fee on a 5¢ profit is a 20% rake), and this was flagged internally but not pinned down. Unverified.
- **Round-number probabilities:** figures like "~48–49% chance of doubling after fees" were back-of-envelope, not computed against actual spreads and fill probabilities.
- **No outcome data:** whether Jeffery placed any trade, and how it went, is unknown to this session. Nothing here should be read as a validated edge.

## 5. Credentials / connections held (names only)

- **GitHub MCP server** — scoped to the single repository `mussstarrd/csdesigns-website`.
- **Claude Code Remote MCP server** — session/environment management (sessions, triggers, repos) for this Claude Code account.
- **Outbound HTTPS via a managed agent proxy** — general web search/fetch; Kalshi API is blocked by its policy.
- **Git push credentials** for the designated branch of this repository.
- **Holds NO:** Kalshi credentials or API keys, Robinhood credentials, brokerage or banking access, payment methods, or any trading-execution capability. The "$25 deposit" lives in Jeffery's Kalshi app; this agent has never touched it.

## 6. Open questions

1. **What does "flip it" mean numerically?** Double to $50, or run toward $250+? The optimal play differs sharply; never answered.
2. **What does Jeffery actually know deeply?** The whole edge thesis rests on niche knowledge (weather, music charts, a sport he follows closely). Unanswered — was the closing question of the strategy discussion.
3. **Exact current Kalshi fee schedule** — rounding rule, maker-fee status, and the higher multiplier categories (e.g., crypto). Should be verified against kalshi.com's official fee schedule before relying on any grind-vs-bold arithmetic.
4. **Did any trade happen, and what was the result?** Needed before any follow-up advice.
5. **Is a real workflow wanted?** If Jeffery wants ongoing help (price checks, position tracking), this repo/session is the wrong vehicle — it would need an environment whose network policy allows Kalshi's API, and an explicit decision about whether the agent should ever hold read-only API access. Nothing beyond conversation has been authorized.

---

*Written to be honest about scope: one good conversation, zero infrastructure, zero trades.*
