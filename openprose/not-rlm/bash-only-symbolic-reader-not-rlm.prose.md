---
name: bash-only-symbolic-reader-not-rlm
kind: function
---

# Bash-Only Symbolic Reader Is Not An RLM

### Parameters

- `prompt_handle`: path or directory handle.
- `question`: caller question.

### Returns

- `answer`: answer computed by deterministic shell tools only.

### Tools

- `cli:rg`: deterministic search.
- `cli:jq`: deterministic JSON processing.
- `cli:awk`: deterministic text processing.

### Runtime

- `persist`: project
- `workspace`: optional

### Shape

- `self`: use shell commands to scan the handle and compute an answer.
- `delegates`: none.
- `prohibited`: model subcalls and recursive decomposition.

### Invariants

- This is intentionally not RLM-complete: it may symbolically manipulate a prompt handle, but it has no recursive model subcalls, no worker isolation, and no model-chosen decomposition.

### Execution

```prose
let answer = session "Use only deterministic shell commands over prompt_handle. Do not spawn subagents; do not construct a recursive manifest."
  context: { prompt_handle, question }

return { answer }
```

