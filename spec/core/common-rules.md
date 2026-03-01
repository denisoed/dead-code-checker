<!-- spec-feature: shared rules for all core templates -->

# Common Rules

This file contains shared rules referenced by all `spec/core/` templates. Each template adds its own specific rules on top of these.

## Constitution compliance

- Before doing anything, read and follow `spec/constitution/*`.

## Clarifications handling

- If information is missing:
  - add a clarifying question to `spec/features/{FEATURE}/clarifications.md` (use `spec/core/clarifications.md` as a template),
  - if missing data blocks correct artifact generation, stop after updating `clarifications.md`; do not create/update the target artifact until answers are provided,
  - if missing data does not block generation, continue and write `No data — needs clarification (see clarifications.md: #<n>)` in affected sections,
  - do not guess.

## Working directory and file scope

- Work only with specification files within `/spec` directory: automatically create necessary directories and files.
- Do not generate application code, configuration snippets, scripts, or patches while preparing spec artifacts.

## Parameter format

Parameters are passed in one line in the format `#<feature># <context>` without XML-like tags.

- **FEATURE** — name of the folder for the feature. Taken from the value between the first two `#` symbols (e.g., `#payments#` → `payments`). Feature names MUST NOT contain `#` characters.
- **CONTEXT** — everything after the second `#` in the parameter line; context can span multiple lines and include additional clarifications.
- Some templates accept extended parameters (e.g., `#<feature>/<iteration>#` in spec-review). See template-specific notes for details.

## Placeholder substitution

- Substitute specific values instead of placeholders (`{FEATURE}`, `{CONTEXT}`, etc.). The final document should not contain hints, examples, or `...` markers.
- If a section is not applicable, explicitly write `Not required — reason: <explanation>` instead of leaving it empty.

## Backward iteration

- If during the current stage you discover gaps or inconsistencies in upstream documents (e.g., `spec.md` while writing `plan.md`), update the upstream artifact and note the change in its affected section.
- This "backward iteration" ensures earlier artifacts stay accurate as understanding deepens through later stages.

## Versioning

- Spec artifacts are versioned through git history. No file-level version numbers are required.
- SHOULD commit spec artifacts before major changes (hotfix application, re-review iteration) so that previous state is recoverable via `git log` / `git diff`.

## Output quality

- Ensure all sections are complete and properly formatted in valid Markdown.
- Form meaningful paragraphs or lists: do not leave empty headers, hint comments, or `...` markers.
