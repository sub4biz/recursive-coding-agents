# OpenProse programs: RLM vs not-RLM

OpenProse programs are Markdown contracts (`*.prose.md`) executed by the OpenProse
VM. This folder classifies them against [`../rlm-rubric/`](../rlm-rubric/). **The
folder a file lives in is its verdict**, and every negative filename also ends in
`-not-rlm`.

## `rlm/` — these ARE RLMs (pass all of G1–G7)

- `handle-recursive-reader.prose.md` — strict recursive reader over an opaque handle.
- `directory-handle-slicer.prose.md` — slices a directory handle into sub-handles and recurses.
- `opaque-handle-map-reduce.prose.md` — model-driven map-reduce over an opaque handle.

## `not-rlm/` — nearby shapes that FAIL a gate (calibration)

- `subagents-only-not-rlm.prose.md` — delegates the same root prompt to reviewers;
  no code-constructed slices, so it **fails G5** (programmatic subcalls).
- `bash-only-symbolic-reader-not-rlm.prose.md` — reads context symbolically with
  bash but never makes programmatic sub-LM calls, so it **fails G5**.
- `ralph-loop-not-rlm.prose.md` — an outer loop re-runs over the same context; it
  doesn't externalize intermediate state as handles or recurse over sub-handles, so
  it **fails G6** (and G2/G3/G5). The outer `while` owns control, not the model.
