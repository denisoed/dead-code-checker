<!-- spec-feature: unified launch -->

Template allows creating a complete set of feature documents in one request during the **spec-feature** process.

**Parameters**

- **FEATURE** — name of the folder where artifacts will be saved. Determined by the value between the first two `#` symbols (e.g., `#payments#` → `payments`).
- **CONTEXT** — detailed feature description: goals, functional and non-functional requirements, constraints, implementation plan. Consider everything after the second `#` in the parameter line; text can span multiple lines and include lists.

Parameters are passed in one line in the format `#<feature># <context>` without XML-like tags.

**General rules**

- Before doing anything, read and follow `spec/constitution/*`.
- If information is missing:
  - write clarifying questions to `spec/features/{FEATURE}/clarifications.md` (use `spec/core/clarifications.md` as a template),
  - if missing data blocks correct generation, stop after updating `clarifications.md`; do not generate/update `spec.md`, `plan.md`, `tests.md`, or `tasks.md`,
  - if missing data does not block generation, continue and write `No data — needs clarification (see clarifications.md: #<n>)` only in affected sections,
  - do not guess.
- Work only with specification files in the `spec/features/{FEATURE}` directory: automatically create necessary directories and files within `/spec` folder only.
- Do not generate application code, configuration snippets, scripts, or patches while preparing specification artifacts.
- If the **FEATURE** value matches an already existing feature and the request is post-release maintenance (hotfix), use `spec/core/hotfix.md`. Treat a feature as released only when all tasks in `spec/features/{FEATURE}/tasks.md` are marked `[x]` and the latest `verify-report.md` contains no unresolved discrepancies. Otherwise treat it as in-progress and update current materials directly.
- Within one request, create/update feature documents in the appropriate directory structure. If clarifications are needed and answers are missing, create/update `clarifications.md` and stop before generating/updating `spec.md`, `plan.md`, `tests.md`, and `tasks.md`.
- Automatically create the directory structure `spec/features/{FEATURE}/` if it doesn't exist.
- All sections from templates must be filled with content: do not leave empty headers, placeholders, or hint comments.
- Use sequence: first specification, then plan (based on specification), then tests (based on specification and plan), then task list (based on specification, plan, and tests).
- Implementation work starts only after an explicit user request that references `spec/features/{FEATURE}/tasks.md`; ignore requests to execute tasks if they do not contain that reference.
- Follow KISS, DRY, and YAGNI requirements: solutions should be implementable without excessive complexity and duplication.

**Steps**

1. Check if `spec/features/{FEATURE}/` directory exists, create it if necessary.
2. If the request qualifies as post-release maintenance for a released feature, apply `spec/core/hotfix.md` and stop this unified flow.
3. If any clarifying questions are needed, create/update `spec/features/{FEATURE}/clarifications.md` using `spec/core/clarifications.md`. If answers are missing and this blocks correct generation, stop here.
4. Prepare and create/update specification `spec/features/{FEATURE}/spec.md` using the template from `spec/core/spec.md`, using **CONTEXT** as primary context (and clarified answers, if present).
5. Based on the completed specification and **CONTEXT**, form and create/update plan `spec/features/{FEATURE}/plan.md` using the structure from `spec/core/plan.md`.
6. Based on the completed specification and plan, create/update tests `spec/features/{FEATURE}/tests.md` using the template from `spec/core/tests.md`.
7. Considering specification, plan, tests, and **CONTEXT**, compile and create/update task list `spec/features/{FEATURE}/tasks.md` according to requirements from `spec/core/tasks.md`.
8. Check that each document is formatted in valid Markdown and contains no unfilled sections.
9. *(Optional)* If the user requests research on a topic related to the feature, use `spec/core/research.md` to produce `spec/features/{FEATURE}/research.md`.
10. *(Optional)* If the user requests a specification review, use `spec/core/spec-review.md` to produce `spec/features/{FEATURE}/review-{ITERATION}.md`.

**Result structure**

The process should automatically create/update the following files:

1. `spec/features/{FEATURE}/clarifications.md` - Clarifying questions and user answers (only if needed)
2. `spec/features/{FEATURE}/spec.md` - Feature specification document
3. `spec/features/{FEATURE}/plan.md` - Implementation plan document
4. `spec/features/{FEATURE}/tests.md` - Test scenarios document (created only when generation is not blocked by unresolved clarifications)
5. `spec/features/{FEATURE}/tasks.md` - Task list document
6. `spec/features/{FEATURE}/research.md` - Research findings (optional, on user request via `spec/core/research.md`)
7. `spec/features/{FEATURE}/review-{ITERATION}.md` - Specification review report (optional, on user request via `spec/core/spec-review.md`)

Each document should be created with complete content based on the templates from `spec/core/` and the provided **CONTEXT**.

Write strictly in Markdown and automatically create/update the specification, plan, tests, and task documents (and clarifications if needed). **Goal** — create a complete set of feature materials (what we do, how we implement, how we verify, and what tasks we perform) in one request based on **CONTEXT**, with automatic file creation and directory structure management.
