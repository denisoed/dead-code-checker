<!-- spec-feature: implementation plan -->

Template helps format the feature implementation plan in the **spec-feature** process.

**Parameters**

See `spec/core/common-rules.md` for the general parameter format (`#<feature># <context>`).

**General rules**

See full shared rules in `spec/core/common-rules.md`. Additionally:

- Use `spec/core/spec.md` as the specification source on which the plan is formed.
- Use `spec/features/{FEATURE}/spec.md` and `spec/features/{FEATURE}/clarifications.md` (resolved answers/decisions) as additional context. If files are unavailable, continue working based on **CONTEXT**.
- Follow basic software development principles: KISS, DRY, and YAGNI, so solutions remain simple, without duplication and unnecessary logic.
- If gaps are discovered in `spec.md` during planning, update `spec.md` and note the change in its affected section (see backward iteration in `spec/core/common-rules.md`).

**What needs to be revealed in the plan**

- `## Data sources / schemas` — storage, migrations, indexes, data handling, and external sources.
- `## Contracts and interfaces` — public APIs, events, queues, UI/CLI, error formats, and validation expectations.
- `## Architecture / Components` — services, modules, integrations, constraints, and chosen stack (DB, API, UI, queues, background processes, etc.).
- `## Risks` — potential problems and mitigation methods.
- `## Assumptions` — explicit assumptions and open dependencies. Do not embed clarifying questions here; link to `clarifications.md` if any.

**Steps**

1. Create the directory structure `spec/features/{FEATURE}/` if it doesn't exist.
2. If any clarifying questions are needed, create/update `spec/features/{FEATURE}/clarifications.md` using `spec/core/clarifications.md`. If unanswered questions block correct planning, stop here; otherwise continue and mark affected sections with `No data — needs clarification (see clarifications.md: #<n>)`.
3. Form the plan according to the sections above, based on **CONTEXT** and available additional context. For each section, fix what exactly needs to be done, not just list components.
4. Create/update the file `spec/features/{FEATURE}/plan.md` with the complete plan content.
5. Check that the document contains no unfilled placeholders and that the output is formatted in valid Markdown.
6. Ensure the document is complete and ready for implementation.

**Result template**

```md
# Implementation Plan

**Plan:** {CONTEXT}

## Data sources / schemas

## Contracts and interfaces

## Architecture / Components

## Risks

## Assumptions

```

Write strictly in Markdown and automatically create/update the plan file. **Goal** — create/update file `/spec/features/{FEATURE}/plan.md` describing HOW we implement the feature based on **CONTEXT**.
