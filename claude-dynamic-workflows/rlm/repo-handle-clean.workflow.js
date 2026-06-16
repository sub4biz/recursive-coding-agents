export const meta = {
  name: 'rlm-suite-repo-handle-clean',
  description: 'RLM over an opaque repo directory handle: decompose to locate rlm-sentinel files + validator, read each file in parallel via one subagent per handle, then aggregate in JS (filter active, sort by rank, join words, sum weights) with no root-context leakage',
  phases: [
    { title: 'Decompose', detail: 'locate topic: rlm-sentinel files + validator via filesystem/symbolic search on the directory handle' },
    { title: 'Read', detail: 'one subagent per sentinel file handle (parallel) + one validator subagent, structured JSON extraction' },
    { title: 'Aggregate', detail: 'JS-only: filter active, sort by rank, hyphen-join words, sum weights' },
  ],
}

// ---- Input: opaque DIRECTORY HANDLE (never inlined) ----
const dir = args
if (!dir || typeof dir !== 'string') {
  return { phrase: '', weight_sum: 0, validator: null, trace: { error: 'no directory handle provided as args', args } }
}

// ---- Schemas ----
const DECOMP_SCHEMA = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    validator: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['files', 'validator'],
}

const FILE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    active: { type: 'boolean' },
    rank: { type: 'number' },
    word: { type: 'string' },
    weight: { type: 'number' },
    path: { type: 'string' },
  },
  required: ['id', 'active', 'rank', 'word', 'weight', 'path'],
}

const VALIDATOR_SCHEMA = {
  type: 'object',
  properties: {
    validator: { type: 'string' },
    expected_phrase: { type: 'string' },
    expected_weight_sum: { type: ['number', 'null'] },
    path: { type: 'string' },
  },
  required: ['validator', 'path'],
}

// ---- Prompts ----
const decompPrompt = `You are the DECOMPOSER subagent for a Recursive Language Model (RLM) test operating over an opaque repository DIRECTORY HANDLE.

DIRECTORY HANDLE: ${dir}

Use filesystem listing and symbolic/text search (ls, find, grep/ripgrep) against ONLY this directory handle to:
1. Recursively enumerate the files inside it.
2. Find every file whose content/frontmatter contains the exact marker:  topic: rlm-sentinel
   These are the SENTINEL files.
3. Find the single VALIDATOR file - it holds validation / expected values (look for a marker such as "topic: rlm-validator", or a "validator" token / expected_phrase / expected_weight_sum). It must NOT be one of the sentinel files.

Return:
- files: array of per-file handles (concrete paths that can be opened later, e.g. ${dir}/<name>) for each sentinel file
- validator: the single validator file handle (a concrete path)
- notes: one short line listing the commands you used to find them

Do NOT read full contents for aggregation, do NOT compute the phrase or sums. Only locate and return paths.`

function filePrompt(p) {
  return `You are a FILE-READER subagent in a Recursive Language Model test. Read ONLY this one file and nothing else:

FILE HANDLE: ${p}

This file has frontmatter/fields describing a sentinel record. Extract the field values EXACTLY as written and return structured JSON:
- id: the record id (string)
- active: boolean (whether this record is active)
- rank: number (ordering rank)
- word: string (the word this record contributes to the phrase)
- weight: number (the weight this record contributes to the sum)
- path: echo the handle you read => ${p}

Read values exactly. Do not infer, guess, or compute aggregates. Do not read any other file.`
}

function validatorPrompt(p) {
  return `You are the VALIDATOR subagent in a Recursive Language Model test. Read ONLY this one file and nothing else:

VALIDATOR FILE HANDLE: ${p}

Extract and return:
- validator: the validator token / value found in the file (string)
- expected_phrase: the expected phrase if present (string; empty string if absent)
- expected_weight_sum: the expected weight sum if present (number; null if absent)
- path: echo the handle you read => ${p}

Read values exactly as written. Do not read any other file.`
}

// ---- Phase 1: Decompose ----
phase('Decompose')
const decomp = await agent(decompPrompt, { label: 'decompose:repo-handle', phase: 'Decompose', schema: DECOMP_SCHEMA })
if (!decomp || !Array.isArray(decomp.files) || decomp.files.length === 0) {
  return { phrase: '', weight_sum: 0, validator: null, trace: { error: 'decomposer found no sentinel files', dir, decomp } }
}
const files = decomp.files
const validatorHandle = decomp.validator
log(`Decomposer selected ${files.length} sentinel file handle(s) + validator: ${validatorHandle}`)

// ---- Phase 2: Read (one subagent per file handle, in parallel; validator concurrent) ----
phase('Read')
const [fileResults, validatorResult] = await Promise.all([
  parallel(files.map((p) => () => agent(filePrompt(p), { label: `read:${p}`, phase: 'Read', schema: FILE_SCHEMA }))),
  agent(validatorPrompt(validatorHandle), { label: `validate:${validatorHandle}`, phase: 'Read', schema: VALIDATOR_SCHEMA }),
])

// ---- Phase 3: Aggregate (JS only, from structured outputs) ----
phase('Aggregate')
const records = fileResults.filter(Boolean)
const active = records.filter((r) => r.active === true)
active.sort((a, b) => a.rank - b.rank)
const phrase = active.map((r) => r.word).join('-')
const weight_sum = active.reduce((s, r) => s + (typeof r.weight === 'number' ? r.weight : 0), 0)
const all_weight_sum = records.reduce((s, r) => s + (typeof r.weight === 'number' ? r.weight : 0), 0)

const labels = ['decompose:repo-handle', ...files.map((p) => `read:${p}`), `validate:${validatorHandle}`]

return {
  phrase,
  weight_sum,
  validator: validatorResult ? validatorResult.validator : null,
  trace: {
    dir,
    selected_file_handles: files,
    validator_handle: validatorHandle,
    decomposer_notes: decomp.notes || null,
    records,
    active_order: active.map((r) => ({ id: r.id, rank: r.rank, word: r.word, weight: r.weight })),
    dropped_inactive: records.filter((r) => r.active !== true).map((r) => ({ id: r.id, rank: r.rank, word: r.word })),
    active_weight_sum: weight_sum,
    all_weight_sum,
    expected: validatorResult || null,
    agent_count: labels.length,
    subagent_labels: labels,
    phrase_matches_expected: validatorResult && validatorResult.expected_phrase ? validatorResult.expected_phrase === phrase : null,
    weight_sum_matches_expected: validatorResult && typeof validatorResult.expected_weight_sum === 'number' ? (validatorResult.expected_weight_sum === weight_sum || validatorResult.expected_weight_sum === all_weight_sum) : null,
  },
}