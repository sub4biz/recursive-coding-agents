# Claude Code Full-RLM Workflow Probe

Date: 2026-06-15  
Claude Code version: 2.1.177  
Driven through: interactive `claudey` in tmux, with `/workflows` opened first  
Workflow run: `wf_41a3e8cd-ab2`  
Task id: `w92vm52fu`

## Verdict

Yes: there is a specific Claude Code dynamic workflow shape that satisfies the local full-RLM rubric.

The observed run used a corpus file path as symbolic prompt/context state, generated per-slice files, called one workflow subagent per constructed slice handle, called a separate validator subagent, and aggregated the structured results in workflow JavaScript state.

This supports a narrow claim:

> Claude Code dynamic workflows can instantiate a full RLM for specific prompt shapes and workflow scripts.

It does not support the broader claim that every Claude Code workflow, or Claude Code as a product in every mode, is automatically a full RLM.

## Probe Artifacts

Repo-local artifacts:

- Corpus: `experiments/claude-workflows-full-rlm/corpus.md`
- Prompt: `experiments/claude-workflows-full-rlm/prompt.txt`
- Generated slices: `experiments/claude-workflows-full-rlm/generated-slices/`
- Slicer helper created by workflow subagent: `experiments/claude-workflows-full-rlm/split_corpus.py`
- Copied workflow script: `experiments/claude-workflows-full-rlm/full-rlm-probe-workflow.js`
- Copied workflow run record: `experiments/claude-workflows-full-rlm/full-rlm-probe-run.json`

Original Claude artifacts:

- Script: `/home/raw/.claude/projects/-home-raw-github-rawwerks-aiewf-2026-rlm-recursive-coding-agent-talk/aa3faa40-7444-4688-8359-273045ccd758/workflows/scripts/full-rlm-probe-wf_41a3e8cd-ab2.js`
- Run record: `/home/raw/.claude/projects/-home-raw-github-rawwerks-aiewf-2026-rlm-recursive-coding-agent-talk/aa3faa40-7444-4688-8359-273045ccd758/workflows/wf_41a3e8cd-ab2.json`
- Subagent transcripts: `/home/raw/.claude/projects/-home-raw-github-rawwerks-aiewf-2026-rlm-recursive-coding-agent-talk/aa3faa40-7444-4688-8359-273045ccd758/subagents/workflows/wf_41a3e8cd-ab2/`

## Observed Result

Final workflow result:

```text
phrase=handle-slice-subcall-aggregate
weight_sum=114
validator=RLM-FULL-WORKFLOW-9c8a71
```

The inactive decoy record `C` had `weight: 999` and was correctly excluded.

## Evidence Summary

The workflow script:

- set `const CORPUS = args`
- used a decomposer subagent to read only the corpus handle and create slice files
- received structured slice handles from that decomposer
- used `parallel(index.slices.map(... agent(...)))` to call one subagent per constructed slice handle
- called a separate validator subagent over `validator.md`
- aggregated in JS with `filter`, `sort`, `map`, `join`, and `reduce`
- returned phrase, sum, validator, and trace

The run record reported:

- `agentCount`: 7
- five slice subagents: `slice:A`, `slice:B`, `slice:C`, `slice:D`, `slice:E`
- one validator subagent: `validator`
- one decomposer subagent: `decompose:slicer`
- `totalTokens`: 198809
- `totalToolCalls`: 18

Programmatic transcript extraction showed:

- slice A subagent read only `generated-slices/slice-A.md`
- slice B subagent read only `generated-slices/slice-B.md`
- slice C subagent read only `generated-slices/slice-C.md`
- slice D subagent read only `generated-slices/slice-D.md`
- slice E subagent read only `generated-slices/slice-E.md`
- validator subagent read only `generated-slices/validator.md`
- decomposer read the original corpus and created the constructed slice handles

The workflow script did not contain the final phrase, validator token, or record field values. Those appeared only in generated slice files and final run outputs.

## Rubric Gates

| Gate | Result | Evidence |
|---|---|---|
| G1 Model-call outer shape | Pass | User task in, final workflow answer out. |
| G2 Prompt externalization | Pass | Corpus was passed as `args` file path and handled as `CORPUS`, not embedded into the workflow script. |
| G3 Symbolic handle | Pass | The script and subagents operated on file paths: corpus handle, generated slice handles, validator handle. |
| G4 Persistent executable environment | Pass | Workflow JS state, generated files, run record, and subagent transcripts persisted. |
| G5 Programmatic subcalls | Pass | Workflow code called `agent(...)` for the decomposer, validator, and each constructed slice. |
| G6 Model-chosen decomposition | Pass for this run | Claude generated the workflow program and chose the decomposition/aggregation structure under the conformance prompt. |
| G7 Symbolic intermediate state | Pass | Slice files, structured subagent results, and aggregation state stayed in workflow/filesystem state. |

## Interpretation

This run is stronger evidence than docs or naming. It demonstrates functional full-RLM behavior on Claude Code dynamic workflows:

- prompt/context as a symbolic file handle
- executable workflow environment
- model-written decomposition
- constructed context slices
- sub-LM/subagent calls over those constructed slices
- symbolic aggregation outside the root conversation

The remaining caveat is product-level scope. This proves a specific workflow shape can be full RLM. It does not prove that a plain prompt workflow without external handles is full RLM.
