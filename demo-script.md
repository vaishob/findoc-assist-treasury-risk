# FinDoc Assist: 3-minute demo script

**Target length:** 3:00  
**Demo thread:** `SWF-2026-1048` from `mock_emails.json`  
**Core message:** Gemini turns a dense treasury email chain into structured risk data, and DeepEval checks the extraction against its source before an analyst acts.

## Before recording

- Open the deployed dashboard and confirm the Gemini and DeepEval path is available.
- Copy the complete `email_thread` value for `SWF-2026-1048` from `mock_emails.json` to the clipboard. The dashboard's built-in sample is a different thread, so paste the JSON sample manually.
- Have browser DevTools Network ready, filtered to `analyze`, so you can show the actual `/api/analyze` response before returning to the results panel.
- Use the score and pass/fail state from the live response. If the dashboard shows `—` or the summary says grounding review is unavailable, the heuristic fallback ran and DeepEval did not produce a score. Do not present a fallback as a DeepEval result.

## 1. Problem | 0:00–0:30

**On-Screen Action**

Show the dashboard, then briefly show the subject line of the sample thread: `URGENT: MT103 rejected / EUR settlement for Northstar Components`.

**Audio / Speaking Notes**

“Treasury operations often has to piece together a payment failure from a long chain of bank, counterparty, and internal emails. In this example, a high-value EUR payment was rejected, the beneficiary details changed, and the settlement deadline is approaching. An officer needs the exposure and the next risk signal quickly, while avoiding an unsafe resend.”

## 2. Live Input | 0:30–1:05

**On-Screen Action**

In the dashboard's **Source communication** box, select the existing text and paste the `email_thread` from `SWF-2026-1048`. Keep the subject and relevant replies visible, then click **Run Risk Analysis**.

**Audio / Speaking Notes**

“I’m pasting the simulated email chain directly from our test data. It includes the rejected MT103, the account mismatch, the bank's suspense update, a verified callback, and the revised settlement deadline. The details are spread across several replies, just like a real operations handoff.”

## 3. Architecture and GenAI | 1:05–1:40

**On-Screen Action**

Show a simple flow overlay while the request runs: **Next.js + MUI → FastAPI `/api/analyze` → Gemini → DeepEval → structured JSON**. Return to the dashboard before the analysis completes.

**Audio / Speaking Notes**

“The Next.js dashboard sends the thread to FastAPI, which validates the request and calls Gemini through Google's GenAI SDK. Gemini reasons across the replies and returns fields in a validated schema. DeepEval then compares that structured output with the original email context. The API returns the fields, source evidence, grounding score, and pass status together. If credentials are unavailable, the demo fallback is clearly labeled and does not claim a verified score.”

## 4. Result | 1:40–2:20

**On-Screen Action**

Open the live `/api/analyze` response in DevTools and show the JSON fields `counterparty`, `exposure_amount`, `currency`, `settlement_date`, `risk_level`, `confidence_score`, `grounding_passed`, and `evidence`. Then return to the dashboard and show **Extracted risk signals**, the grounding card, and source evidence.

The source-supported values to look for are **Northstar Components GmbH**, **EUR 18,450,000**, a settlement deadline of **19 October 2026**, and a high-risk payment exception. Read the actual response if a field differs or remains unknown. Do not stage a sample score.

**Audio / Speaking Notes**

“Here is the structured response returned by the API. It identifies the counterparty, exposure, settlement date, and risk level, with evidence excerpts tied to the original thread. The dashboard presents the same result in an operations-friendly view, so an officer can scan the exception and inspect the supporting text without reading the entire chain again.”

## 5. Impact and Proof | 2:20–3:00

**On-Screen Action**

Zoom in on **Grounding confidence**, the pass/review label, and **Source evidence**. Keep the score visible while closing on the reminder that human review is required before settlement or collateral action.

**Audio / Speaking Notes**

“DeepEval's HallucinationMetric checks how consistently the extracted response aligns with the supplied email context. Our configured threshold is 0.80, and the dashboard shows the live metric score as a percentage with its pass or review status. This is a source-alignment signal, not a probability that a payment will succeed. The evidence lets an analyst verify the claims before acting. FinDoc Assist helps Treasury Operations triage complex exceptions sooner and focus attention on high-value items before a cutoff.”

## Accuracy cue for the presenter

DeepEval documents the HallucinationMetric as a 0–1 alignment score where higher means greater consistency with the supplied context, and a score at or above the configured threshold passes. This app uses a default threshold of `0.80`. The fallback returns `confidence_score: null` and `grounding_passed: false`, so the presenter must not describe fallback output as a successful DeepEval check. See [DeepEval HallucinationMetric](https://deepeval.com/docs/metrics-hallucination).
