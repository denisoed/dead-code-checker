# Project Constitution (spec-feature)

This folder contains **project-wide rules** that constrain AI agents and human contributors.
The goal is to prevent hallucinations, scope creep, and unreviewed changes by enforcing a strict, verifiable workflow.

## How to use

- Read and follow **all** files in `spec/constitution/` before making any changes.
- If there is a conflict between documents:
  - Constitution rules override feature specs and plans.
  - Feature specs override implementation plans.
  - Plans override task list details only where explicitly stated.
- Update the constitution when a feature introduces a new invariant, workflow constraint, or quality gate.

## File index

- `00-purpose-and-precedence.md`
- `01-scope-and-non-goals.md`
- `02-evidence-and-no-hallucinations.md`
- `03-questions-and-unknowns.md`
- `04-change-discipline-minimal-diff.md`
- `05-tools-and-command-policy.md`
- `06-spec-feature-workflow-guardrails.md`
- `07-quality-gates-definition-of-done.md`
- `08-security-secrets-and-privacy.md`
- `09-communication-contract.md`
- `10-git-and-release-policy.md`
- `99-glossary.md`


