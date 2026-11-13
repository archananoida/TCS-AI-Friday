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
