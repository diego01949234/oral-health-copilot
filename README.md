# Oral Health Copilot

A one-page preventive oral health screening tool. Patients complete a 13-question questionnaire; the tool computes a deterministic risk score and returns a two-layer output: plain-language guidance for the patient and a structured clinical summary for the dentist.

**Live demo:** https://oral-health-copilot.vercel.app

---

## What it does

1. **Screen** — 13 questions across five domains: red flags, caries risk, periodontal risk, access/behavior, and patient context (~3 minutes)
2. **Score** — deterministic rule-based scoring, never LLM for risk classification
3. **Output** — two layers in one result card:
   - Patient-facing: calm, plain language, 2–4 curated recommendations
   - Clinician-readable: risk level, domain scores, red flags, context flags, suggested follow-up interval; one-click copy to clipboard

Risk levels: **low** (0–7) · **moderate** (8–17) · **high** (18+) · **escalate** (any red flag, regardless of score)

No login. No database. No diagnosis.

---

## Architecture

```
oral-health-copilot/
├── app/
│   └── page.tsx           ← all state, renders phase (intro / questions / results)
├── components/
│   ├── Questionnaire.tsx  ← step flow, progress bar, back/next
│   ├── Question.tsx       ← single-select and multi-select with 'none' exclusivity
│   └── ResultCard.tsx     ← two-layer result, collapsible clinician section, copy
├── lib/
│   ├── questions.ts       ← 13 questions, options, score weights
│   ├── scoring.ts         ← pure function: answers → ScreeningResult
│   └── scoring.test.ts    ← 8 Vitest unit tests
└── types/
    └── index.ts           ← shared types (Domain, RiskLevel, ScreeningResult)
```

**LLM seam:** `ResultCard` receives `patientSummary` and `dentistSummary` as plain strings. Today they come from `scoring.ts`. A future `lib/ai.ts` can rewrite these strings in a friendlier tone without touching UI or scoring logic — the risk level, red flags, and recommendations never come from an LLM.

---

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React
- Vitest for unit tests
- Deployed on Vercel

---

## Run locally

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # 8 unit tests
npm run build     # production build
```

---

## Non-goals (MVP)

- No login or session persistence
- No database
- No LLM API call (architecture supports it; not wired)
- No analytics
- Not a clinical diagnosis

---

*Built as a YC application demo — concept to deployed MVP in one session.*
