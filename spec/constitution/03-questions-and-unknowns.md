# Questions and unknowns

## Rules

- MUST ask clarifying questions when:
  - requirements are ambiguous,
  - success criteria are unclear,
  - there are multiple valid implementations with different tradeoffs,
  - actions would be destructive or expensive.
- MUST write all clarifying questions to `spec/features/{FEATURE}/clarifications.md` (within the feature folder). Do not embed questions in `spec.md`, `plan.md`, `tasks.md`, or chat messages.
- MUST prefer 1–2 high-impact questions over a long questionnaire.
- MUST propose sensible defaults as options (without executing them unless confirmed).
- MUST stop and wait if the missing information blocks a correct implementation. In this case, create/update `spec/features/{FEATURE}/clarifications.md` and do not proceed with generating/updating other artifacts until answers are provided.

## How to verify

- Ambiguous inputs always produce clarifying questions and a short list of options.
- Blocking unknowns are not silently assumed.
- Questions are present in `spec/features/{FEATURE}/clarifications.md` and not duplicated elsewhere.

## Exceptions

- If the user explicitly authorizes choosing defaults, the chosen defaults MUST be recorded in the spec/plan/tasks.


