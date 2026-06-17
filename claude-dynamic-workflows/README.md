# Claude Code dynamic workflows: RLM vs not-RLM

Claude Code *dynamic workflows* are JavaScript scripts (`*.workflow.js`) that orchestrate subagents with `agent()`, `parallel()`, `pipeline()`, `phase()`. This folder classifies them against [`../rlm-rubric/`](../rlm-rubric/). **The folder a file lives in is the intended verdict for that workflow shape**.

## `rlm/` — workflow shapes classified as full RLM

| file | handle shape | what it shows |
|---|---|---|
| `file-handle-clean.workflow.js` | one file | handle-based map-reduce: a decomposer turns a file handle into slice handles, one subagent reads each slice, then validate + aggregate |
| `repo-handle-clean.workflow.js` | repo / directory | decompose a repo handle into per-file handles, read in parallel, validate, aggregate |
| `tree-recursive.workflow.js` | recursive tree | the cleanest recursive fixture: each handle is inspected by its own subagent (branch -> child handles, leaf -> record); the recursion is discovered from the data rather than fixed as a flat fanout |

In all three, task context is passed through handles instead of copied wholesale into every prompt, subagent calls run over constructed slice/file handles, and intermediate state stays in workflow/filesystem state. These are conformance fixtures, so prompts may include task-shape or file-format hints; the RLM claim is about the observed run shape, not about the prompt being maximally underspecified.

## `not-rlm/` — nearby shapes that FAIL a gate (calibration)

Read these as a **ladder**: each one fixes the previous failure and trips the next. Grade them generously. A coding-agent workflow with subagents, loops, code, handles, or symbolic files should get credit for those gates when they are really present. The point is narrower: those mechanisms are not enough unless the run also has model-chosen decomposition and programmatic model/subagent calls over constructed slices or subproblems.

| file | first gate it FAILS | lesson |
|---|---|---|
| `subagent-fanout-inlined-prompt.workflow.js` | **G2** prompt externalization | it has real subagent fanout, but the prompt is pasted inline into N subagents; there is no context handle to operate on |
| `single-agent-handle-reader.workflow.js` | **G5** programmatic subcalls | it externalizes a handle and uses tools, but a single agent answers — no recursive sub-LM/subagent calls over constructed slices |
| `hardcoded-map-reduce.workflow.js` | **G6** model-chosen decomposition | real slices + sub-LM calls + symbolic state (passes G1–G5, G7) — but the split, fan-out, reducer, and stop are developer-authored, not model-chosen |

`hardcoded-map-reduce.workflow.js` is the subtle one: under a generous reading it passes six of seven gates. Diff it against `rlm/file-handle-clean.workflow.js`: same rough map-reduce family, but the negative control fixes window size, window count, reducer, and stop condition in developer code. The positive fixture delegates handle construction to a decomposer step inside the workflow. (Rubric: "Hardcoded map-reduce pipeline -> Fails G6.")

## `proven-run/`

A redacted executed run classified as full RLM: the workflow script, the public run summary (7 agents + a synthetic validator fixture), the corpus, generated slices, and the assessment. See [`proven-run/README.md`](proven-run/README.md).
