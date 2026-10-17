# Treasury Risk Analysis API

FastAPI service for extracting treasury-risk entities from financial email threads. Gemini provides the structured extraction. DeepEval's `HallucinationMetric` checks the extracted JSON against the original email text, using Gemini as its judge so no OpenAI credential is required.

## Run locally

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
export GEMINI_API_KEY="your-key"  # PowerShell: $env:GEMINI_API_KEY="your-key"
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000
```

Set `GEMINI_MODEL` to override the default model (`gemini-3.8-flash`). Set `DEEPEVAL_GROUNDING_THRESHOLD` to adjust the passing score (default `0.8`). The optional `FRONTEND_ORIGIN` variable accepts a comma-separated list of browser origins; it defaults to `http://localhost:3000`.

Without `GEMINI_API_KEY`, the service uses a small deterministic demo parser. Its response explicitly says it is a fallback and returns `confidence_score: null` and `grounding_passed: false`; it does not claim to have run Gemini or DeepEval.

## API

- `GET /health` returns `{"status":"ok"}`.
- `POST /api/analyze` accepts `{"text":"..."}` and returns the extracted counterparty, amount, currency, settlement date, risk level, grounding score, summary, and evidence. Email text is limited to 40,000 characters.

DeepEval's judge calls use the same Gemini API key through its custom model interface. If that evaluation call fails, the extraction is still returned with a null score, a failed grounding flag, and a summary asking the operator to verify the details manually.
