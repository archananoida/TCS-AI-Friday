# TCS AI Friday

Starter repository to verify that GitHub commits, Python compilation, unit tests, and GitHub Actions CI work before adding the actual use case.

## Run locally

Requires Python 3.10+; no third-party dependencies.

```bash
python -m compileall -q calculator.py tests
python calculator.py
python -m unittest discover -s tests -v
```

GitHub Actions runs these checks on every push and pull request, and supports manual execution.
