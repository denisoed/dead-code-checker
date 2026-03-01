# spec-feature workflow guardrails

## Rules

- MUST keep all spec-feature artifacts under `spec/`.
- MUST follow the sequence:
  - clarifications (`clarifications.md`, if needed) → specification (`spec.md`) → plan (`plan.md`) → tests (`tests.md`) → tasks (`tasks.md`) → execution → verification (`verify-report.md`).
- MUST NOT execute implementation tasks unless the user explicitly requests execution and references `spec/features/{FEATURE}/tasks.md`.
- MUST keep `spec.md`, `plan.md`, `tests.md`, `tasks.md`, and `clarifications.md` consistent (terms, components, constraints, decisions).
- MUST update `tasks.md` checkboxes to reflect actual state during verification.
- SHOULD update the constitution when a feature introduces a new invariant or process rule.

## Backward iteration

- If a later stage (plan, tests, tasks) reveals gaps or inconsistencies in an earlier artifact, the earlier artifact MUST be updated and the change noted in its affected section.
- This is a normal part of the workflow — later stages deepen understanding and may require corrections to earlier documents.

## Research loop

- When `spec-review` produces a `needs_research` decision: run `spec/core/research.md` → update `spec.md` and/or `plan.md` with findings → re-run `spec/core/spec-review.md` with the next iteration number.
- Research is an optional loop that can occur between any review iteration.

## How to verify

- No implementation begins before an explicit request referencing `spec/features/{FEATURE}/tasks.md`.
- Artifacts exist and are consistent (no contradictory terms/constraints).

## Exceptions

- Hotfixes: follow `spec/core/hotfix.md` rules for synchronized updates of `spec.md`, `plan.md`, `tasks.md`.
