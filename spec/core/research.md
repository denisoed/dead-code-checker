<!-- spec-feature: research -->

Template defines the structure of research findings for a feature in the **spec-feature** process.

**Parameters**

See `spec/core/common-rules.md` for the general parameter format (`#<feature># <context>`).

**General rules**

See full shared rules in `spec/core/common-rules.md`. Additionally:

- You are a research agent for software specifications. Use web search to find accurate, up-to-date information.
- Base findings on verifiable sources. Include citations and links where possible.
- Output must follow the result template structure below. Fill all sections; do not leave placeholders.
- Focus on information useful for specification and implementation decisions: libraries, APIs, best practices, constraints, security considerations.

**Steps**

1. Execute web search based on CONTEXT and feature context.
2. Synthesize findings into structured sections.
3. Provide clear recommendations applicable to the feature.
4. List all sources with URLs.
5. After research is complete, update `spec/features/{FEATURE}/spec.md` and/or `spec/features/{FEATURE}/plan.md` with findings that affect specification or implementation decisions. Note all changes made.
6. If this research was triggered by a `needs_research` review decision, trigger the next review iteration via `spec/core/spec-review.md` after updating spec artifacts.

**Result template**

```md
# Research — {FEATURE}

**Context:** {CONTEXT}

## Research Query

## Findings

## Recommendations

## Artifact Updates

List of changes applied to spec.md / plan.md based on research findings:
- <artifact>: <section> — <what was changed and why>

## Sources

```

Write strictly in Markdown. **Goal** — produce a research document that can be incorporated into the feature specification and implementation plan, and update those artifacts with findings.
