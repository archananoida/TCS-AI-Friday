# PipelineIQ — Phase 1

This independent demonstration uses fictional data only.

## Scope
- Five synthetic pipeline records with health statuses and dependencies.
- Searchable execution logs via GET /api/logs?q=timeout.
- Rule-based evidence-linked diagnoses via GET /api/diagnose/{pipeline_id}.
- Browser dashboard with metrics, dependencies, logs and diagnosis.
- No real integrations, no AI model, no persistence, no automated repairs.

## Run
Python 3.10+:
```bash
python -m backend.app
```
Open http://127.0.0.1:8000

## Test
```bash
python -m compileall -q backend tests
python -m unittest discover -s tests -v
```

## Security
Development server binds to localhost by default. Never supply secrets or real enterprise data. This proof of concept has no authentication and must not be deployed publicly without hardening. Recommendations are not verified root causes and require engineer review.

## Demo
Open dashboard; select Customer Transform to see null constraint evidence; select Billing Export for timeout; search logs for 'timeout'; select Inventory Sync to see insufficient evidence; inspect upstream dependencies.

## Next
Approved monitoring integrations, authentication, audit logs, feedback, and evidence-grounded AI explanations.
