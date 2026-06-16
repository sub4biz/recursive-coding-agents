---
name: ralph-loop-not-rlm
kind: function
---

# Ralph Loop Is Not An RLM

### Parameters

- `prompt_handle`: external handle.
- `question`: caller question.

### Returns

- `answer`: final answer from repeated self-revision.

### Tools

- `spawn_session`: host primitive for model calls.

### Runtime

- `persist`: project

### Shape

- `self`: repeatedly ask the same model to improve the same answer.
- `delegates`: none.
- `prohibited`: decomposition into child handles.

### Invariants

- This is intentionally not RLM-complete: it loops over the same context, but it does not externalize intermediate state as handles, does not recursively call over sub-handles, and does not aggregate independent child results.

### Execution

```prose
let draft = session "Answer question from prompt_handle."
  context: { prompt_handle, question }

repeat 3 as attempt:
  draft = session "Improve the prior draft, but do not decompose the handle or spawn child workers."
    context: { prompt_handle, question, draft, attempt }

return { answer: draft }
```
