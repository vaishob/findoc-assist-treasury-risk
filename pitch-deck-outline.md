# FinDoc Assist: pitch deck outline

**Format:** Five slides following the requested judging flow. The supplied AI Builder Cup template has additional prompts for features, process flow, wireframes, architecture, technologies, prototype performance, future development, and submission links. This outline groups those prompts within the five slides below. Fill in the team details and final public links before exporting the PDF.

## Slide 1 | Title and elevator pitch

**Headline:** FinDoc Assist  
**Subhead:** Source-grounded risk triage for treasury payment and margin exceptions.

**On-slide content**

- Google Cloud AI Builder Cup, BFSI category
- Team name: `[Team name]`
- Team leader: `[Name]`
- Elevator pitch: “FinDoc Assist turns unstructured treasury email chains into structured settlement-risk signals, with Gemini extraction and DeepEval source checks for faster analyst review.”
- Product state: working prototype

**Visual**

Use one clean dashboard screenshot with the input and result panel visible. Keep team details and the elevator pitch readable at presentation size.

## Slide 2 | Problem alignment: treasury settlement risk

**Judging alignment:** Problem Alignment, **25%**

**Headline:** A missed payment can leave a high-value trade exposed while teams reconstruct the story by hand.

**On-slide content**

- Treasury officers receive fragmented updates from payment operations, banks, counterparties, and credit teams.
- Failed SWIFT instructions, changing beneficiary details, disputed margin, and cut-off times make the current exposure difficult to assess quickly.
- Manual review slows prioritization and increases the chance that a critical exception is missed or acted on without enough context.
- Example from `SWF-2026-1048`: an EUR 18.45 million MT103 to Northstar Components was rejected with code AC04; funds remained in suspense while an account amendment and 19 October delivery deadline were being coordinated.

**Visual**

Show a short email timeline with the rejection, account mismatch, callback verification, and pending intermediary confirmation. Label the thread as simulated.

**Evidence to say aloud**

“The operational problem is not simply extracting a number. The officer must reconcile who is involved, how much remains exposed, when settlement is due, and what evidence supports escalation.”

## Slide 3 | Solution and UX

**Judging alignment:** UX, **10%**; Innovation, **25%**

**Headline:** One email thread becomes a reviewable risk exception.

**On-slide content**

- Paste a treasury email chain and run risk analysis from a single dashboard.
- Return counterparty, exposure amount, currency, settlement date, and risk level as structured data.
- Show an analyst summary and source evidence beside the extracted fields.
- Surface a DeepEval grounding result so the officer can inspect evidence before escalating.
- Keep the human in control. The prototype supports triage and does not authorize payment, collateral, or settlement actions.

**Why the approach is distinct**

The prototype connects financial entity extraction with a source-grounding check inside the same review flow. It uses a constrained response schema and evidence excerpts, rather than leaving the user with an unstructured model answer.

**Visual**

Use a labeled screenshot or wireframe: source email on the left, risk signals and evidence on the right. Include the grounding status and confidence card.

## Slide 4 | Technical merit and GenAI implementation

**Judging alignment:** Technical Merit, **40%**

**Headline:** Gemini extracts the risk record; DeepEval checks it against the source thread.

**Architecture flow**

1. **Next.js + TypeScript + Material UI:** dashboard accepts the email thread and renders the response.
2. **FastAPI `/api/analyze`:** validates the input and coordinates analysis.
3. **Google GenAI SDK with Gemini:** reasons across the thread and returns structured fields against a Pydantic schema.
4. **DeepEval HallucinationMetric:** compares the returned JSON with the supplied email context. The configured pass threshold defaults to `0.80`.
5. **Structured API response:** returns extracted fields, evidence, metric score, and pass status to the dashboard.

**Implementation and proof points**

- Cloud Run serves the containerized application; Cloud Build builds from source during deployment.
- The Gemini key is supplied through Secret Manager, not committed to the repository.
- The deterministic fallback keeps the interface usable without credentials, but returns no grounding score and does not claim a DeepEval pass.
- Demo evidence: show the live `/api/analyze` JSON and the matching result panel. Insert the actual deployed score and pass status; do not invent benchmark values.

**Visual**

Use a left-to-right architecture diagram with the original thread as DeepEval context. Beside it, show a cropped live JSON response with the score and grounding status.

## Slide 5 | Impact, scalability, and next steps

**Headline:** Faster triage is the first step toward better control of payment exceptions.

**Potential operational impact**

- Reduce the time an officer spends locating key facts across a long email chain.
- Make high-value payment failures and margin disputes easier to prioritize.
- Keep source evidence visible so a reviewer can verify extracted details before acting.

**How to measure a pilot**

- Compare median triage time with the current manual process.
- Review field accuracy, DeepEval pass rate, and analyst correction rate on a labeled set of simulated or approved historical cases.
- Track whether high-risk exceptions reach the right reviewer before the relevant settlement cut-off.

**Next steps**

- Evaluate against a broader, labeled set of SWIFT and margin-dispute threads.
- Add case history, analyst feedback, and audit controls before production use.
- Explore integrations with payment-status and treasury case-management systems.

**Submission links**

- Public GitHub repository: `[URL]`
- Three-minute demo video: `[URL]`
- Cloud Run product link: `[URL]`

**Visual**

Close with a simple pilot measurement plan and the three submission links. If including implementation cost from the template, label it as an estimate and state the assumptions.
