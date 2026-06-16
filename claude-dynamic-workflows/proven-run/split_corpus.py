#!/usr/bin/env python3
"""Deterministic structural split of the RLM corpus into per-slice files.

Does NOT parse or report any field values. Pure block extraction.
"""
from pathlib import Path

CORPUS = Path("/home/raw/github-rawwerks/aiewf-2026-rlm-recursive-coding-agent-talk/experiments/claude-workflows-full-rlm/corpus.md")
OUTDIR = Path("/home/raw/github-rawwerks/aiewf-2026-rlm-recursive-coding-agent-talk/experiments/claude-workflows-full-rlm/generated-slices")

OUTDIR.mkdir(parents=True, exist_ok=True)

lines = CORPUS.read_text(encoding="utf-8").splitlines(keepends=True)

slices = []          # list of (id, [block_lines])
validator_block = None

i = 0
n = len(lines)
while i < n:
    stripped = lines[i].rstrip("\n")
    if stripped.startswith("@@SLICE id="):
        block = [lines[i]]
        slice_id = stripped[len("@@SLICE id="):].strip()
        i += 1
        while i < n and lines[i].rstrip("\n") != "@@END":
            block.append(lines[i])
            i += 1
        if i < n:  # the @@END line
            block.append(lines[i])
            i += 1
        slices.append((slice_id, block))
    elif stripped.startswith("@@VALIDATOR"):
        block = [lines[i]]
        i += 1
        while i < n and lines[i].rstrip("\n") != "@@END":
            block.append(lines[i])
            i += 1
        if i < n:
            block.append(lines[i])
            i += 1
        validator_block = block
    else:
        i += 1

for slice_id, block in slices:
    path = OUTDIR / f"slice-{slice_id}.md"
    path.write_text("".join(block), encoding="utf-8")

if validator_block is not None:
    (OUTDIR / "validator.md").write_text("".join(validator_block), encoding="utf-8")

# Report structure only (ids and paths), no field values.
print("SLICE_IDS=" + ",".join(sid for sid, _ in slices))
print("VALIDATOR=" + ("yes" if validator_block is not None else "no"))
