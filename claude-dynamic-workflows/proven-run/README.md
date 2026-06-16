# Proven run — an RLM we actually executed

This is the one run we executed end-to-end and verified as a full RLM:
**`wf_41a3e8cd-ab2`** (7 agents + a validator token).

| file | what it is |
|---|---|
| `full-rlm-probe-workflow.js` | the workflow script that ran |
| `full-rlm-probe-run.json` | the run record — agents, validator token, trace |
| `corpus.md` | the input corpus (held behind a handle, never inlined) |
| `prompt.txt` | the task prompt |
| `split_corpus.py` | helper used to prepare the corpus |
| `generated-slices/slice-A…E.md`, `validator.md` | the slices the model constructed during the run |
| `claude-code-full-rlm-workflow-probe.md` / `.json` | the assessment write-up and its structured verdict |

The script here is the example counterpart in
[`../rlm/`](../rlm/) made concrete: a real run, with the evidence that it passes
G1–G7.

**Raw originals** (full session journal + per-agent transcripts) live in Claude's
local store, if you need deeper evidence:

```
~/.claude/projects/-home-raw-github-rawwerks-aiewf-2026-rlm-recursive-coding-agent-talk/
  aa3faa40-7444-4688-8359-273045ccd758/
    workflows/scripts/full-rlm-probe-wf_41a3e8cd-ab2.js
    workflows/wf_41a3e8cd-ab2.json
    subagents/workflows/wf_41a3e8cd-ab2/   (journal.jsonl + 7 agent transcripts)
```
