# Purpose and precedence

## Rules

- MUST treat `spec/constitution/*` as the highest-priority constraints for agent behavior and project workflow.
- MUST NOT override a constitution rule by “common sense” or best practices unless the constitution explicitly allows it.
- MUST keep rules **specific and testable** (avoid vague statements like “write clean code”).
- SHOULD record constitution changes as small diffs and mention the reason.

## How to verify

- Check that any instruction set or template used for work includes “Read and follow `spec/constitution/*` first”.
- If a conflict is detected, confirm the chosen action matches the precedence described in `spec/constitution/README.md`.

## Exceptions

- If the user explicitly requests to violate a constitution rule, MUST pause and ask for confirmation acknowledging the deviation.


