# Quality gates and Definition of Done

## Rules

- MUST define “done” as meeting the criteria in `tasks.md` Definition of Done.
- MUST NOT mark tasks as complete without running the required checks (tests, linters, manual scenarios) stated in the task.
- MUST record verification output under `spec/features/{FEATURE}/verify-report.md` when the workflow requires it.
- SHOULD prefer automated checks and keep manual steps explicit and repeatable.

## How to verify

- Completed checkboxes have corresponding evidence (test output, report, or documented manual steps).
- Verification report exists when required and reflects the real state.

## Exceptions

- If checks cannot run (environment limits), MUST document the reason and the alternative evidence required.


