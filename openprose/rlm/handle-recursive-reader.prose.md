---
name: handle-recursive-reader
kind: function
---

# Strict Handle Recursive Reader

### Parameters

- `prompt_handle`: path, repository root, index, database key, or other external context handle.
- `question`: caller question.
- `max_depth`: recursion depth bound.
- `max_fanout`: maximum child handles per decomposition step.

### Returns

- `answer`: final answer produced from leaf or child outputs.
- `trace`: recursive manifest chain, child call receipts, validator result, and aggregation receipt.

### Tools

- `cli:rg`: symbolic search over nonterminal handles.
- `cli:jq`: structured manifest and output validation.
- `cli:awk`: deterministic slicing when line-oriented handles are appropriate.
- `spawn_session`: host primitive for isolated recursive model subcalls.

### Runtime

- `persist`: project
- `state`: filesystem
- `workspace`: required
- `bindings`: required
- `receipts`: required

### Shape

- `self`: inspect a prompt handle, decide whether it is terminal, emit child handles when nonterminal, recursively call this same contract over child handles, aggregate child outputs, and validate the trace.
- `delegates`: analyze exactly one assigned handle or recursively decompose that handle through this contract.
- `prohibited`: answer by reading the whole original prompt handle in root context; pass the whole prompt handle to every worker; skip recursion bounds; skip validator.

### Invariants

- Every worker receives exactly one assigned handle.
- Every child handle records `id`, `path`, `parent`, `kind`, `remaining_depth`, and `stop_condition`.
- Recursion stops when a handle is terminal or `max_depth` reaches zero.
- `max_depth` and `max_fanout` are never exceeded.
- The final answer cites only recursive child outputs or validator-approved bindings.

### Execution

```prose
let manifest = session "You are the recursive decomposer. Inspect prompt_handle symbolically. If terminal or max_depth is zero, return terminal=true. Otherwise create workspace/manifest.json with child handles and remaining_depth for each child. Do not answer the question."
  context: { prompt_handle, question, max_depth, max_fanout }

if manifest.terminal:
  let leaf = session "Answer from only this assigned handle and write a leaf receipt."
    context: { handle: prompt_handle, question }
  let leaf_trace = session "validator: verify the leaf answer used only the assigned handle."
    context: { handle: prompt_handle, answer: leaf }
  return { answer: leaf, trace: leaf_trace }

let child_results = parallel for child in manifest.children:
  let child_result = call handle-recursive-reader
    prompt_handle: child.path
    question: question
    max_depth: child.remaining_depth
    max_fanout: max_fanout
  return child_result

let answer = session "Aggregate only recursive child_results. Write the aggregation receipt."
  context: { child_results, question }

let trace = session "validator: verify recursive coverage, worker isolation, depth/fanout bounds, output schema, and aggregation."
  context: { manifest, child_results, answer }

return { answer, trace }
```

