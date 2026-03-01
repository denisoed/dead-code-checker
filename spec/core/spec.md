<!-- spec-feature: specification -->

Template helps describe a feature before implementation in the **spec-feature** process.

**Parameters**

See `spec/core/common-rules.md` for the general parameter format (`#<feature># <context>`).

**General rules**

See full shared rules in `spec/core/common-rules.md`. Additionally:

- The specification header should contain a clear feature name (adapt the **FEATURE** value if necessary).
- The structure from the template below needs to be filled with content: theses, lists, and tables are allowed, empty sections are not.
- If there's insufficient data for a section, explicitly write `No data — needs clarification (see clarifications.md: #<n>)` instead of an empty header.

**What needs to be revealed in the specification**

- `## User Stories` — minimum three completed stories. For each, fix the role, action, and result/value.
- `## Main scenarios and rules` — key usage scenarios, constraints, error variants.
- `## Non-functional requirements` — SLA, performance, security, localization, accessibility, and other non-functional criteria.
- `## Assumptions` — explicit assumptions and open dependencies. Do not embed clarifying questions here; link to `clarifications.md` if any.

**Steps**

1. Create the directory structure `spec/features/{FEATURE}/` if it doesn't exist.
2. If any clarifying questions are needed, create/update `spec/features/{FEATURE}/clarifications.md` using `spec/core/clarifications.md`. If unanswered questions block correct specification, stop here; otherwise continue and mark affected sections with `No data — needs clarification (see clarifications.md: #<n>)`.
3. Form the specification according to the sections above, based on **CONTEXT** and available additional context (including clarified answers, if present).
4. Create/update the file `spec/features/{FEATURE}/spec.md` with the complete specification content.
5. Check that the document is formatted in Markdown and contains no unfilled placeholders.
6. Ensure the document is complete and ready for implementation.

**Result template**

```md
# {FEATURE}

**Specification:** {CONTEXT}

## User Stories

## Main scenarios and rules

## Non-functional requirements

## Assumptions

```

Write strictly in Markdown and automatically create/update the specification file. **Goal** — create/update file `/spec/features/{FEATURE}/spec.md` describing WHAT we do and WHY, based on **CONTEXT**.
