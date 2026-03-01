<!-- spec-feature: test scenarios -->

Template helps define test scenarios for a feature in the **spec-feature** process.

**Parameters**

See `spec/core/common-rules.md` for the general parameter format (`#<feature># <context>`).

**General rules**

See full shared rules in `spec/core/common-rules.md`. Additionally:

- Use `spec/core/spec.md` and `spec/core/plan.md` as base sources.
- Use `spec/features/{FEATURE}/spec.md`, `spec/features/{FEATURE}/plan.md`, and `spec/features/{FEATURE}/clarifications.md` (resolved answers/decisions) as additional context. If any file is missing, continue working based on available materials and **CONTEXT**.
- Each test case must include a clear expected result and a verification method (manual/automated).
- If a test direction is not required, explicitly indicate under the corresponding subheading `Not required — reason: <explanation>`.
- If gaps are discovered in `spec.md` or `plan.md` during test design, update the upstream artifact and note the change in its affected section (see backward iteration in `spec/core/common-rules.md`).

**What needs to be revealed in tests**

- `## Functional tests` — user stories, main scenarios, error handling.
- `## Non-functional tests` — performance, resilience, security, accessibility, localization.
- `## Data and caching tests` — cache TTL, storage behavior, invalidation rules.
- `## Integration and fallback tests` — external APIs, retries, failover logic.

**Steps**

1. Create the directory structure `spec/features/{FEATURE}/` if it doesn't exist.
2. If any clarifying questions are needed, create/update `spec/features/{FEATURE}/clarifications.md` using `spec/core/clarifications.md`. If unanswered questions block correct test definition, stop here; otherwise continue and mark affected sections with `No data — needs clarification (see clarifications.md: #<n>)`.
3. Form the tests according to the sections above, based on **CONTEXT** and available additional context.
4. Create/update the file `spec/features/{FEATURE}/tests.md` with complete test scenarios.
5. Ensure the document is formatted in valid Markdown and contains no unfilled placeholders.

**Result template**

```md
# Tests

**Context:** {CONTEXT}

## Functional tests

## Non-functional tests

## Data and caching tests

## Integration and fallback tests

```

Write strictly in Markdown and automatically create/update the tests file. **Goal** — create/update file `/spec/features/{FEATURE}/tests.md` describing HOW we verify the feature behavior based on **CONTEXT** and prepared materials.
