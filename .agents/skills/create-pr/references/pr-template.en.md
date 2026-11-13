# PR Body Template

A sub-agent writes the title and body. Use only this template for English PRs under the language rules in `SKILL.md`. English is the default for projects other than `ZOOSIXPARK/react-component-generator`, unless the user explicitly specifies a language for this PR.

## Writing guidance

- Lead with the problem and resulting behavior, grounded in the actual diff and commits. Avoid merely listing files or recounting the work.
- Report commands actually run and their results. State skipped checks and why; do not present local results as CI results.
- Include risks, rollout notes, and related issues only when relevant. Do not invent issue numbers, validation results, or risks.
- Small PRs may use only summary and validation. Preserve required repository PR fields and adapt this content to their format.
- Replace or remove all brace placeholders and instructional text before submission.

## Body template

```markdown
### Summary

{Explain the problem or requirement and how this change affects user or system behavior}

### Key changes

- {Change the reviewer needs to understand and its rationale}

### Validation

- `{command executed}` — {actual result}
- Not run: {check and reason; remove if none}

### Risks and rollout

{Confirmed compatibility, migration, or rollout considerations; remove this section if inapplicable}

### Related issues

{Verified related issue links; remove this section if none}
```
