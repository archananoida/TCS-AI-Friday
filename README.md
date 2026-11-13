# PipelineIQ — Synthetic Incident Troubleshooting Demo

A generic, synthetic data pipeline monitoring and troubleshooting demonstration.

## Features
- Responsive dashboard with five fictional pipelines and health metrics
- Dependency listings and searchable execution logs
- Evidence-linked, deterministic troubleshooting recommendations
- Read-only incident investigation, dependency tracing and historical synthetic incidents
- Downloadable JSON incident report with evidence, Phase 3 triage, severity, priority, timeline and optional AI explanation
- Optional OpenAI Responses API analysis; no automatic repairs or real enterprise data

## Run locally
The local Python backend provides Phase 1 endpoints. Phase 2 API endpoints and OpenAI integration run in the Node.js Vercel function (`api/index.js`). Python 3.10+; no third-party packages required for Phase 1.

```bash
python -m backend.app
```

Open http://127.0.0.1:8000.

## Tests
```bash
python -m compileall -q backend tests
python -m unittest discover -s tests -v
node --check api/index.js
node --test tests/phase2.test.js
```

GitHub Actions workflow: `.github/workflows/pipelineiq-ci.yml`.

## API
- `GET /api/health`
- `GET /api/pipelines`
- `GET /api/logs?q=timeout`
- `GET /api/logs?pipeline_id=billing_export`
- `GET /api/diagnose/customers_transform`

See [Phase 1 documentation](docs/PHASE1.md).

## Security
Fictional data only. Local development server is not production-hardened and has no authentication. Do not expose it to the internet or ingest private logs. Recommendations require engineer verification and approval.


## Optional OpenAI-powered incident explanations

PipelineIQ uses synthetic evidence and rule-based diagnosis by default. To activate the **Explain with AI** button, set `OPENAI_API_KEY` as a sensitive server-side environment variable on the standalone PipelineIQ Vercel project, then redeploy. Optionally set `OPENAI_MODEL` to an approved model available to your organization (default `gpt-4.1-mini`). Never commit keys, place them in frontend JavaScript, or paste them in chat. The API uses the OpenAI Responses endpoint with `store:false`, does not run repairs, and falls back to rule-based analysis when unconfigured or unavailable. Only use company-issued keys in environments explicitly authorized by your organization. Because the current demo has no user authentication, restrict access before activating a billable API key.

## Demo walkthrough (laptop)

1. Open the deployed dashboard and confirm five synthetic pipelines and health counts.
2. Select Customer Transform to view null-constraint evidence (log #1) and dependency impact.
3. Select Warehouse Load to see the failed upstream dependency.
4. Select Billing Export to see the timeout, historical case INC-102, and its upstream chain.
5. Search for `timeout` in logs and inspect evidence #3.
6. Click **Download incident report** to save a JSON evidence package locally.
7. **Explain with AI** is optional and must be tested separately with an approved company API key; a fallback does not count as an AI PASS.

All confidence scores are heuristics, not calibrated probabilities. All recommendations remain unverified and require human approval. This demo does not authenticate users, store audit records, or connect to production monitoring systems.

## Phase 3 — incident operations (synthetic)

The `GET /api/triage/:pipeline_id` endpoint returns deterministic severity/priority, transitive downstream impact, and a synthetic incident timeline. The incident report export includes the triage result. P1/P2 classifications are demonstration heuristics, not production service-level policy. There are no write operations, automated remediations, notifications or real incident state transitions.

## Acceptance status

GitHub CI runs Node 22 and Python 3.12 tests. Production deployment readiness alone is not evidence of test success. The live OpenAI key is intentionally excluded from automated tests; mocked AI responses test safe success and failure handling. A browser download of the JSON incident report and the live OpenAI authentication check are separate manual acceptance items.
