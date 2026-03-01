# Tools and command policy

## Rules

- MUST prefer repository-local evidence over external assumptions.
- MUST NOT run destructive commands without explicit user approval (delete, reset, force, migrations on production, etc.).
- MUST keep command execution minimal and non-interactive by default.
- MUST describe why a command is needed before running it.
- MUST NOT introduce new dependencies, services, or build steps unless explicitly requested.

## How to verify

- Every command has a clear purpose tied to a task.
- No new dependencies appear without an explicit requirement.

## Exceptions

- None unless explicitly requested by the user.


