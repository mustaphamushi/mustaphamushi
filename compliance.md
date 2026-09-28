# Publishing Compliance & Conversion Rules

Standing rules for ANY public-facing output: pages, ads, emails, schema, social, proposals.
For AI agents (Claude Code, Ship Studio, etc.): treat every rule as a hard constraint. If output
would violate a rule, stop and flag instead of shipping. These rules override style preferences
and speed. Scope: Ansot and every future project unless a project file explicitly overrides.

Master test: **every public claim must be true, provable, and filed.** No evidence = no claim.

## 1. Pre-publish checklist (every page, ad, email)

- Every factual claim is true and evidence exists (screenshot, export, contract, written permission)
- No invented numbers, statistics, results, quotes, logos, or brand assets. Missing proof = omit, never approximate
- Client brand names/logos only with a direct client relationship or written permission on file
- Prices render from the single pricing source of truth (CMS price fields). Never hardcode a price twice
- Guarantees state their conditions adjacent to the claim, not in a footer
- One primary CTA per page; the page delivers exactly what the ad/meta/email promised
- Articles show a real author, publish date, and cited sources

## 2. Search engines (Google spam policies)

Never:
- Paid links without rel="sponsored", PBNs, link exchanges, expired-domain redirects
- Mass-produced pages without unique value (AI drafts fine; undifferentiated volume is not)
- City/doorway pages ("X agency in [city]" x N)
- Schema that doesn't match visible content; third-party review scores in aggregateRating
- Hidden text, cloaking, misleading redirects

Always: real authors, dates, sources; each page answers a real search question; links are earned
(data studies, expert quotes, qualified directories, disclosed listicle placements).
Ref: https://developers.google.com/search/docs/essentials/spam-policies

## 3. Paid ads (Google Ads policies)

- Ad claim = landing page claim; a price, discount, or guarantee in an ad must be visible on the destination
- No unrealistic-results claims ("#1 rankings guaranteed"); guarantees in ads require conditions on the landing page
- No competitor trademarks in ad copy without authorization (bidding on their keywords is fine)
- Destination requirements: page loads, no content-blocking popups, working contact info, linked privacy policy
- Cookie consent + Google consent mode fire before ad/analytics cookies for EU/UK visitors
Ref: https://support.google.com/adspolicy/answer/6008942

## 4. Testimonials, reviews, endorsements (FTC 2024 rule)

- Verbatim quotes only, from real people, about this business, with written permission for name/title/photo. Keep the permission
- Never reword, ghost-write, or meaning-trim a quote. Anonymizing a fake quote does not fix it
- Anything given in exchange is disclosed where the endorsement appears ("Founding client - reduced rate")
- Reviews: ask every client, not just happy ones; no incentives for positive reviews; no employee/family reviews; never suppress negatives
- Any "best of" list you publish and appear on carries visible authorship + methodology disclosure at the top
Ref: https://www.ftc.gov/legal-library/browse/rules/rulemaking-use-consumer-reviews-testimonials

## 5. Outreach & email

- CAN-SPAM: honest subject, physical postal address, working unsubscribe honored within 10 days
- EU recipients need a GDPR lawful basis before cold email; when in doubt, LinkedIn or referral
- Community posts (Reddit, forums, Slack): disclose the affiliation every time; link only when genuinely useful

## 6. Conversion practices (all legal, all evergreen)

1. Message match: the headline continues the exact promise of whatever was clicked
2. One job per page, one primary CTA
3. Proof beside claims: a number, named client, or artifact next to every promise
4. Risk reversal with visible conditions (guarantees, keep-the-plan proposals, credits)
5. Published pricing
6. Two-step forms: low-friction fields first, qualification second; track completion per step
7. Speed: LCP under 2.5s on real phones
8. Specificity over adjectives: numbers, dates, scopes
9. FAQs answer real objections, including "when not to buy this"
10. No dark patterns: no fake timers or invented scarcity, no confirmshaming, no pre-checked
    boxes; cancellation as easy as signup (ROSCA)
11. Accessibility basics: contrast, alt text, keyboard nav

## 7. Evidence file

One folder per project. Every public claim has its source filed (GA4 export, PageSpeed run,
signed permission, contract clause). Quarterly: re-grep for banned patterns, re-verify claims
and links, refresh dates. A claim whose evidence expired comes down the same week.

## 8. Resource efficiency (CI, automation, AI)

Every automation must earn its cost. Private-repo CI jobs bill per job, rounded up to a
whole minute; standard runners on public repos are free.

- Triggers: CI runs on pushes to the default branch and on pull requests, not on every branch
  push. Schedules use the lowest frequency that does the job: daily only when freshness
  matters, weekly for safety-net audits
- Concurrency: every workflow sets `concurrency` with `cancel-in-progress: true`, so rapid
  pushes collapse into one run
- Limits: every job sets `timeout-minutes`, so a hung job can't drain the quota
- Scope: path filters skip jobs a change can't affect; shallow clones (`fetch-depth: 1`)
  unless history is required; API diffs before full clones
- Cheap first: free checks (hash, grep, lint, API compare) run before anything that calls a
  paid API or an AI model. AI runs only when a cheap check found work, with bounded turns and
  the smallest model that does the job
- Caching: cache dependencies between runs
- Runners: standard Linux runners only; larger or premium runners need a written reason in
  the workflow file
- Idempotent: jobs write or commit only when content changed; state-only commits use `[skip ci]`
- Budget: account spending limits stay at $0 unless deliberately raised. Any workflow
  projected above 20% of its account's monthly minutes gets optimized or justified in writing

## How to install this file

Synced automatically from ansot-standards to every repo. Don't edit a repo's copy; changes
there are overwritten on the next sync. Propose edits in ansot-standards instead.

- Claude Code: reference from repo-root CLAUDE.md ("Read and enforce compliance.md before
  producing any public-facing content"), or ~/.claude/CLAUDE.md to cover every repo
- Ship Studio: keep in the project's spec/context folder; every prompt's Context line references it
- claude.ai: paste into Project instructions or add to Project knowledge
