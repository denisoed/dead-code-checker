# Security, secrets, and privacy

## Rules

- MUST NOT expose secrets (tokens, keys, passwords) in code, logs, specs, or examples.
- MUST treat user data and sensitive data as confidential by default.
- MUST avoid copying sensitive production data into tickets/specs.
- SHOULD prefer secure-by-default settings and least-privilege access.

## How to verify

- No secrets appear in diffs, specs, or logs.
- Any introduced config or documentation does not include real credentials.

## Exceptions

- None. Use placeholders for secrets.


