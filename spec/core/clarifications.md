<!-- spec-feature: clarifications -->

Template collects all clarifying questions for a feature in the **spec-feature** process.

**Parameters**

See `spec/core/common-rules.md` for the general parameter format (`#<feature># <context>`).

**General rules**

See full shared rules in `spec/core/common-rules.md`. Additionally:

- All clarifying questions MUST be written to `spec/features/{FEATURE}/clarifications.md` (this file) and MUST NOT be embedded in `spec.md`, `plan.md`, `tests.md`, `tasks.md`, or chat messages.
- Prefer 1–2 high-impact questions over a long questionnaire; provide options/defaults when possible.
- If the missing information blocks correct planning/specification, create/update this file and stop. Do not proceed to generate/update `spec.md`, `plan.md`, `tests.md`, or `tasks.md` until answers are provided.

**Steps**

1. Create the directory structure `spec/features/{FEATURE}/` if it doesn't exist.
2. Create/update the file `spec/features/{FEATURE}/clarifications.md` using the template below:
   - Add new questions at the end.
   - Keep previously answered questions and do not overwrite user answers.
3. Ensure the document is valid Markdown and contains no placeholders.

**Result template**

```md
# Clarifications — {FEATURE}

**Context:** {CONTEXT}

## Open questions

### 1. <question>
- **Options / suggested default:** <options or default>
- **User answer:** <fill in>

## Resolved decisions

### 1. <decision>
- **Rationale:** <why>
- **Source question:** #1
```

Write strictly in Markdown and automatically create/update the clarifications file. **Goal** — create/update file `/spec/features/{FEATURE}/clarifications.md` to capture all clarifying questions and user answers for this feature.
