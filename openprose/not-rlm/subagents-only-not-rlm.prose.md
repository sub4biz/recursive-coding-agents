---
name: subagents-only-not-rlm
kind: function
---

# Subagents Only Is Not An RLM

### Parameters

- `prompt`: full prompt text already in the root context.
- `question`: caller question.

### Returns

- `answer`: majority answer from reviewers.

### Tools

- `spawn_session`: host primitive for isolated subagents.

### Runtime

- `persist`: project

### Shape

- `self`: ask several reviewers the same already-inlined prompt.
- `delegates`: review the same root prompt.
- `prohibited`: none.

### Invariants

- This is intentionally not RLM-complete: it has no external `prompt_handle`, no symbolic decomposition manifest, and no persistent intermediate handle state.

### Execution

```prose
let reviews = parallel for reviewer in ["a", "b", "c"]:
  let result = session "Answer the question from this full prompt."
    context: { prompt, question, reviewer }
  return result

let answer = session "Merge the reviewer answers."
  context: { reviews, question }

return { answer }
```

