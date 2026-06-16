---
name: directory-handle-slicer
kind: function
---

# Directory Handle Slicer

### Parameters

- `prompt_handle`: repository root, directory, or index path to inspect symbolically.
- `question`: caller question about the directory handle.
- `max_depth`: recursion depth bound; use `1` for this directory-slicer contract.
- `max_fanout`: maximum file handles or file groups to assign to workers.

### Returns

- `answer`: final answer synthesized from file-worker outputs.
- `trace`: search commands, file manifest, worker receipts, validator result, and aggregation receipt.

### Tools

- `cli:rg`: semantic or lexical file discovery.
- `cli:find`: deterministic directory enumeration.
- `cli:jq`: manifest and output validation.
- `spawn_session`: host primitive for isolated recursive model subcalls.

### Runtime

- `persist`: project
- `state`: filesystem
- `workspace`: required
- `bindings`: required
- `receipts`: required

### Shape

- `self`: use symbolic repo/file search to produce a manifest of relevant file handles, spawn workers over those handles, aggregate worker outputs, and validate the trace.
- `delegates`: inspect exactly one assigned handle or bounded file group and return structured evidence.
- `prohibited`: answer from a root-context read of the whole repository; pass the whole repository to every worker; skip manifest writing; skip validator.

### Invariants

- Every worker receives exactly one assigned handle.
- Every child handle records `id`, `path`, `parent`, `kind`, and `stop_condition`.
- `max_depth` and `max_fanout` are respected.
- The final answer cites only worker outputs or validator-approved bindings.
- Root aggregation is symbolic over worker outputs, not a direct repository read.

### Execution

```prose
let manifest = session "You are the directory decomposer. Use rg/find against prompt_handle to find relevant files for question. Write workspace/manifest.json with child file handles. Do not answer the question."
  context: { prompt_handle, question, max_depth, max_fanout }

let file_results = parallel for child in manifest.children:
  let worker = session "Inspect only this assigned handle. Return structured evidence with file path, relevant lines or facts, and confidence."
    context: { handle: child.path, child_id: child.id, question }
  return worker

let answer = session "Aggregate only file_results into a concise answer with cited file handles."
  context: { file_results, question }

let trace = session "validator: verify manifest relevance, worker isolation, output schema, and aggregation provenance."
  context: { manifest, file_results, answer }

return { answer, trace }
```

