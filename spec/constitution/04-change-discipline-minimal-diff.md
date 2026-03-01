# Change discipline and minimal diff

## Rules

- MUST make the smallest possible change set that satisfies acceptance criteria.
- MUST NOT reformat or reorder unrelated code.
- MUST NOT change public contracts (APIs, CLI, schemas) without explicit requirement and explicit migration notes.
- MUST keep edits localized; avoid wide refactors unless explicitly requested.
- SHOULD document any non-obvious change rationale in a short note (spec/plan/tasks or PR description).

## How to verify

- Diff contains only relevant files/lines.
- No purely stylistic changes outside the requested scope.
- Contract changes include explicit notes and verification steps.

## Exceptions

- Mechanical renames or formatting changes are allowed only if explicitly requested by the user.


