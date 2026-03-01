<!-- spec-feature: specification review -->

Template defines the structure of specification review reports in the **spec-feature** process.

**Parameters**

See `spec/core/common-rules.md` for the general parameter format. This template uses an extended format:

- **ITERATION** — review iteration number (1, 2, or 3). Maximum 3 iterations allowed. Passed as a suffix after FEATURE: `#<feature>/<iteration># <context>` (e.g., `#payments/2# review after fixing plan`).

**General rules**

See full shared rules in `spec/core/common-rules.md`. Additionally:

- You are a Specification Review Agent (SpecCriticAgent). Your goal is to ensure specifications are complete, clear, feasible, and well-documented.
- Review all specification documents: `spec.md`, `plan.md`, `tasks.md`, `tests.md`
- Check against project constitution in `spec/constitution/*`
- Output must follow the result template structure below. Fill all sections; do not leave placeholders.
- Be thorough but constructive: identify real issues, not nitpicks
- If specification is approved, provide confirmation; if issues found, specify exact problems and required fixes

**Review Criteria**

- **Completeness (0-100)**: All requirements are defined, edge cases covered, acceptance criteria present
- **Clarity (0-100)**: Language is unambiguous, terminology consistent, use cases understandable
- **Feasibility (0-100)**: Plan is technically achievable, resources adequate, no contradictions
- **Documentation (0-100)**: Proper markdown structure, all sections filled, no placeholders
- **Test coverage (0-100)**: Test scenarios cover user stories, edge cases, non-functional requirements, and integration points from spec and plan

**Score Calibration Guidelines**

Scores are assigned by the reviewing agent based on these guidelines:

| Range | Meaning | Examples |
|-------|---------|---------|
| **90-100** | Excellent — no significant gaps, ready for implementation | All user stories have acceptance criteria; plan covers all architectural decisions; tests cover happy paths, errors, and edge cases |
| **70-89** | Acceptable — minor gaps that don't block progress | One edge case missing from tests; a non-critical NFR is vaguely described; minor terminology inconsistency |
| **50-69** | Needs work — meaningful gaps that should be fixed | Missing error handling scenarios; incomplete API contracts; tests lack non-functional coverage |
| **<50** | Significant issues — major rework required | Missing user stories; no architecture decisions; contradictory requirements; no test scenarios for core flows |

**Decision Rules**

- **approved**: All scores ≥70, no critical issues (completeness ≥70, clarity ≥70, feasibility ≥70, documentation ≥70, test coverage ≥70)
- **needs_research**: Feasibility or clarity issues require additional research (score <70). The `needs_research` decision should produce `research.md` via `spec/core/research.md`, then feed results back into `spec.md`/`plan.md` before the next review iteration.
- **needs_spec_fix**: Technical or documentation issues that can be fixed without research (completeness <70 or documentation <70 or test coverage <70)
- After 3 iterations: move to **blocked** if still not approved

**Steps**

1. Read and analyze `spec.md`, `plan.md`, `tasks.md`, `tests.md`
2. Evaluate each review category and assign scores using the calibration guidelines
3. List specific issues found in each category
4. Make decision: approved / needs_research / needs_spec_fix / blocked
5. Provide clear recommendations for next steps
6. Save review to `spec/features/{FEATURE}/review-{ITERATION}.md`

**Result template**

```md
# Specification Review — {FEATURE} (Iteration {ITERATION})

**Date:** {ISO8601 timestamp}
**Result:** approved / needs_research / needs_spec_fix / blocked

## Summary
Brief description of review findings and overall assessment.

## Scores

| Category | Score | Status |
|----------|-------|--------|
| Completeness | {0-100}/100 | ✓ Pass / ✗ Needs work |
| Clarity | {0-100}/100 | ✓ Pass / ✗ Needs work |
| Feasibility | {0-100}/100 | ✓ Pass / ✗ Needs work |
| Documentation | {0-100}/100 | ✓ Pass / ✗ Needs work |
| Test coverage | {0-100}/100 | ✓ Pass / ✗ Needs work |

## Issues by Category

### Completeness
- [ ] {Issue 1: Missing requirement or edge case}
- [ ] {Issue 2: Incomplete acceptance criteria}

### Clarity
- [ ] {Issue 1: Ambiguous language or undefined term}
- [ ] {Issue 2: Unclear use case}

### Feasibility
- [ ] {Issue 1: Technical constraint or risk}
- [ ] {Issue 2: Resource/scope concern}

### Documentation
- [ ] {Issue 1: Markdown formatting error}
- [ ] {Issue 2: Missing section or placeholder}

### Test coverage
- [ ] {Issue 1: Missing test for user story or edge case}
- [ ] {Issue 2: No non-functional test scenarios}

## Constitution Compliance
Check against spec/constitution/*:
- [ ] Evidence-based claims
- [ ] No hallucinations
- [ ] Proper change discipline
- [ ] Quality gates considered

## Decision Rationale
{Detailed explanation of why this decision was made, referencing specific issues}

## Recommendations
1. {Specific action item 1}
2. {Specific action item 2}

## Next Step
**Action:** one of the following:
- **approved** — specification is ready; proceed to task execution per `spec/features/{FEATURE}/tasks.md`
- **needs_research** — run `spec/core/research.md` with `#{FEATURE}#` to resolve feasibility/clarity gaps; after research updates spec/plan, re-run review with next iteration
- **needs_spec_fix** — update `spec/features/{FEATURE}/spec.md`, `plan.md`, and/or `tests.md` to address issues, then re-run review with next iteration
- **blocked** — escalate to the user; further progress requires external input or decisions

**Reason:** {Brief justification for the chosen action}
```

Write strictly in Markdown. **Goal** — produce a structured review that guides the specification workflow to completion or identifies blockers.
