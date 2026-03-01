<!-- spec-feature: feature hotfix -->

Template automates feature maintenance after release: records hotfixes and synchronously updates **spec-feature** artifacts (spec, plan, and tasks).

**Parameters**

See `spec/core/common-rules.md` for the general parameter format (`#<feature># <context>`).

**General rules**

See full shared rules in `spec/core/common-rules.md`. Additionally:

- Work only in the `spec/features/{FEATURE}/` directory: allowed to edit `spec.md`, `plan.md`, and `tasks.md`; `clarifications.md` may be edited only if it already exists.
- Do not create new files in the feature folder (including `hotfix.md`). Exception: `verify-report.md` is created by `spec/core/verify.md` when triggered after task completion.
- Preserve the structure of existing documents: do not delete sections, do not leave empty headers and hints from templates.
- All changes should consider requirements from specification and plan, maintaining consistency of terms and references.
- Actual task state must be reflected in `tasks.md`: do not allow desynchronization between checkboxes and actual state.

**Automatic update logic**

- `spec.md` — update sections affected by the hotfix: clarify user scenarios, rules, or non-functional requirements, add new Assumptions when open questions arise.
- `plan.md` — adjust technical solutions: data sources, contracts, architectural constraints, and risks, so the plan reflects the current feature structure.
- `clarifications.md` — if `spec/features/{FEATURE}/clarifications.md` already exists and the hotfix introduces new open questions, append them there (do not overwrite user answers). If it does not exist, record open questions as assumptions in `spec.md` (this template forbids creating new files).
- `tasks.md` —
  - Add new checkboxes for work required by the hotfix, group them in appropriate sections. Names should start with prefix `hotfix_<date>` in `YYYY-MM-DD` format.
  - Update statuses of existing tasks (`[ ]`/`[x]`), considering actual execution and hotfix results.
  - For each task, specify necessary checks: tests, manual scenarios, documentation updates.

**Post-hotfix review**

- After hotfix updates are applied, SHOULD run `spec/core/spec-review.md` on the next available iteration to validate consistency of the updated artifacts.
- This is recommended (not mandatory) to keep the hotfix flow fast while still catching inconsistencies early.

**Steps**

1. SHOULD commit current spec artifacts before applying hotfix changes (see versioning guidance in `spec/core/common-rules.md`).
2. Read `spec.md`, `plan.md`, and `tasks.md` to understand the current feature state.
3. Form a list of changes that the hotfix should introduce and reflect them in corresponding documents. Maintain unified terms and component references.
4. Update `tasks.md`: add or adjust tasks, set checkboxes based on actual execution, supplement with verification requirements.
5. Ensure all modified documents are complete and ready for implementation.
6. SHOULD trigger `spec/core/spec-review.md` on the next available iteration to review updated artifacts.

Write strictly in Markdown. Goal — automatically bring all feature artifacts up to date under the hotfix and synchronize checklists with actual state.
