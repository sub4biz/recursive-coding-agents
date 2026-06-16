---
name: opaque-handle-map-reduce
kind: function
---

# Opaque Handle Map-Reduce

### Parameters

- `prompt_handle`: opaque path, repository root, index, database key, or other external context handle.
- `question`: caller question to answer from the external handle.
- `max_depth`: recursion depth bound; use `1` for this one-level map-reduce contract.
- `max_fanout`: maximum child handles the decomposer may emit.

### Returns

- `answer`: final answer synthesized only from worker outputs.
- `trace`: manifest path, child handles, worker receipts, validator result, and aggregation receipt.

### Tools

- `cli:rg`: symbolic search over the external handle.
- `cli:jq`: structured JSON validation and aggregation checks.
- `cli:awk`: deterministic slicing when line-oriented handles are appropriate.
- `spawn_session`: host primitive for isolated recursive model subcalls.

### Runtime

- `persist`: project
- `state`: filesystem
- `workspace`: required
- `bindings`: required
- `receipts`: required

### Shape

- `self`: orchestrate the run, inspect only enough of `prompt_handle` to create a child manifest, launch workers, aggregate structured outputs, and validate the trace.
- `delegates`: analyze exactly one assigned handle or child slice, write structured output to bindings, and avoid unrelated files.
- `prohibited`: answer by reading the whole prompt handle in root context; pass the whole prompt handle to every worker; publish undeclared scratch files; skip validator.

### Invariants

- Every worker receives exactly one assigned handle or child manifest entry.
- Every child handle records `id`, `path`, `parent`, `kind`, and `stop_condition`.
- `max_depth` and `max_fanout` are respected.
- The final answer cites only worker outputs or validator-approved bindings.
- Root aggregation reads from bindings or structured worker outputs, not root memory.

### Execution

```prose
let manifest = session "You are the decomposer. Inspect prompt_handle symbolically with filesystem tools. Create workspace/manifest.json containing child handles for question. Do not answer the question."
  context: { prompt_handle, question, max_depth, max_fanout }

let worker_results = parallel for child in manifest.children:
  let worker = session "Analyze only this assigned handle. Return structured JSON with id, active, rank, term, weight, citations, and notes. Do not read sibling handles."
    context: { handle: child.path, child_id: child.id, question }
  return worker

let answer = session "Aggregate only worker_results into the final answer. Ignore inactive records. Write the aggregation receipt."
  context: { worker_results, question }

let trace = session "validator: verify manifest coverage, worker isolation, output schema, aggregation math, and that final answer was derived from bindings or structured worker results."
  context: { manifest, worker_results, answer }

return { answer, trace }
```

