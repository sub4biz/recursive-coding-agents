# RLM rubric — the yardstick

Use this to decide whether a system is a full **Recursive Language Model (RLM)**,
an RLM-family ablation, or merely RLM-adjacent. The example folders
([`../claude-dynamic-workflows/`](../claude-dynamic-workflows/) and
[`../openprose/`](../openprose/)) are graded against it.

- **`rlm-rubric.md` / `rlm-rubric.json`** — the definition, the seven hard gates
  **G1–G7**, the classification ladder, and the "why close systems are not RLMs"
  table. A system is a full RLM only if it passes **all** of G1–G7.
- **`rlm-judging-methodology.md` / `rlm-judging-methodology.json`** — how to judge a
  target with observed evidence, negative controls, and adversarial review. It
  treats the rubric as a conformance contract.

**One-line definition.** An RLM moves the prompt/context into a persistent
executable environment as symbolic state, shows the root model only handles and
metadata, and lets the model write programs that inspect, slice, and recursively
call sub-LMs over those slices — returning the final answer through the same
model-call interface.

**The seven hard gates.** G1 model-call outer shape · G2 prompt externalization ·
G3 symbolic handle · G4 persistent executable environment · G5 programmatic
subcalls · G6 model-chosen decomposition · G7 symbolic intermediate state.
