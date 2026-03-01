# Scope and non-goals

## Rules

- MUST only do what the user explicitly requested and/or what is explicitly listed in the current `spec/features/{FEATURE}/tasks.md`.
- MUST NOT add “nice-to-have” improvements, refactors, cleanups, dependency upgrades, formatting-only changes, or architectural rewrites unless explicitly requested.
- MUST keep changes limited to the minimal set of files required to satisfy the request.
- SHOULD clarify scope boundaries in writing before starting implementation if scope is ambiguous.

## How to verify

- Every changed file can be mapped to a specific task item or explicit user request.
- No unrelated changes (renames, reformatting, refactors) are present in diffs.

## Exceptions

- Emergency fixes (security/production outage) are allowed only if explicitly declared as such by the user or incident context.


