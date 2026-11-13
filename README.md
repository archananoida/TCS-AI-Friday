# PipelineIQ — Phase 1 MVP

A generic, synthetic data pipeline monitoring and troubleshooting demonstration.

## Features
- Responsive dashboard with five fictional pipelines and health metrics
- Dependency listings and searchable execution logs
- Evidence-linked, deterministic troubleshooting recommendations
- No automatic fixes, real credentials, enterprise data or AI model calls

## Run locally
Python 3.10+; no third-party packages required.

```bash
python -m backend.app
```

Open http://127.0.0.1:8000.

## Tests
```bash
python -m compileall -q backend tests
python -m unittest discover -s tests -v
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
