<!-- spec-feature: task verification -->

Template helps format the results of automatic task execution verification and make a decision about feature archiving in the **spec-feature** process.

**Parameters**

See `spec/core/common-rules.md` for the general parameter format (`#<feature># <context>`).

**General rules**

See full shared rules in `spec/core/common-rules.md`. Additionally:

- Work only with specification files: do not create code and do not create new feature directories. Verification runs only for an existing `spec/features/{FEATURE}/` directory.
- **REQUIRED:** Always create `spec/features/{FEATURE}/verify-report.md` file as the main output of verification process.
- Use `spec/features/{FEATURE}/spec.md`, `plan.md`, `tasks.md`, and `tests.md` as source data for verification.
- Check tasks sequentially: after successful verification, mark the corresponding checkbox in `spec/features/{FEATURE}/tasks.md` as `[x]`; when discrepancies are found, leave `[ ]` and record details in the report file.
- Save discrepancy logs in `spec/features/{FEATURE}/verify-report.md`, adding new entries with timestamps and brief problem descriptions.
- If there are no discrepancies, explicitly add an entry "No discrepancies detected" in the appropriate section.
- **Checkbox verification alone is insufficient.** Evidence from actual test runs and automated checks is required (see "Automated verification" section below).

**Automated verification**

Verification MUST include running automated checks where applicable:

1. **Project tests**: run the project's test suite (e.g., `npm test`, `pytest`, `go test ./...`) and capture output. If the project has no test runner, note this in the report.
2. **Linter**: run the project's linter (e.g., `eslint`, `flake8`, `golangci-lint`) and capture output. If no linter is configured, note this.
3. **Test file existence**: for each implemented module or component, verify that corresponding test files exist in the project.
4. Include all command outputs in the `## Automated check results` section of the report.

If automated checks cannot be run (e.g., no test runner configured), document the reason and fall back to manual verification with a note in the report.

**What needs to be revealed in the verification document**

- `## Task verification results` — list of verified tasks with final status and links to supporting artifacts/proofs.
- `## Automated check results` — actual output from test suite, linter, and test file existence checks.
- `## Discrepancy log` — brief summary of new entries added to `verify-report.md`, with steps to resolve problems.
- `## Archiving decision` — final status of verify launch: recommend moving feature to `spec/archived/{FEATURE}` or list of actions for re-verification.
  - **Archiving process:** if all tasks passed and there are no discrepancies, recommend that the user moves the feature directory from `spec/features/{FEATURE}/` to `spec/archived/{FEATURE}/`. Archiving is performed only after explicit user confirmation.
- Constitution compliance — verify that `tasks.md` includes the Constitution checkbox, and that its status matches the changes introduced by the feature. If it should be updated but was not, record a discrepancy.

**Steps**

1. **MANDATORY:** Create the verification report file `spec/features/{FEATURE}/verify-report.md` using the template below.
2. Add a comment at the beginning of the result to specify the save path:
   ```md
   <!-- SAVE_AS: spec/features/{FEATURE}/verify-report.md -->
   ```
3. Run automated checks (project tests, linter, test file existence) and capture outputs.
4. Go through tasks in `spec/features/{FEATURE}/tasks.md` in order and update checkboxes according to actual execution status and automated check results.
5. Record results in `spec/features/{FEATURE}/verify-report.md` with logs for all tasks (completed and uncompleted).
6. Check that Markdown is formatted correctly and contains no unfilled placeholders.
7. Ensure the report is complete and ready for archiving decision.

**verify-report.md template**

```md
# Verify Report - {FEATURE}

**Date:** YYYY-MM-DD
**Context:** {CONTEXT}

## Task verification results

- [ ] [Task 1 title from `tasks.md`] — status: done / not done / partial; evidence: <file path, test log, or note>
- [ ] [Task 2 title from `tasks.md`] — status: done / not done / partial; evidence: <file path, test log, or note>

## Automated check results

### Test suite
```
<paste actual test runner output here>
```

### Linter
```
<paste actual linter output here>
```

### Test file existence
- <module/component> → <test file path> — exists / missing

## Discrepancy log

### YYYY-MM-DD - [General status description]

#### 1. [Problem name]

**Problem:** [Problem description]
**Status:** [Criticality: critical/not critical/low priority]
**Action:** [What needs to be done]

#### 2. [Next problem]

...

### YYYY-MM-DD - Positive results

#### Fully implemented components:

- ✅ [Component 1 (file path)]
- ✅ [Component 2 (file path)]
- ❌ [Uncompleted component (reason)]
- ⚠️ [Partially completed component (what remains)]

### YYYY-MM-DD - No discrepancies detected

- No discrepancies detected.

## Archiving decision

- Decision: recommend_archive / reverify_required
- Reason: <why this decision was made>
- Next action: <explicit action list; archiving requires user confirmation>

```

**Log entry structure:**

- **Date and general status** — grouping by verification time
- **Problems** — numbered list with problem indication, criticality status, and required actions
- **Positive results** — list of completed tasks with emoji statuses:
  - ✅ — fully completed
  - ❌ — not completed
  - ⚠️ — partially completed

Write strictly in Markdown and add nothing outside the document. **Goal** — verify all tasks in `spec/features/{FEATURE}/tasks.md`, mark completed ones in the task file, create a detailed report `verify-report.md` with logs of all tasks and their statuses. If all tasks passed, recommend moving the feature directory from `spec/features/{FEATURE}/` to `spec/archived/{FEATURE}/` (requires explicit user confirmation).
