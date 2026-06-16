export const meta = {
  name: 'negative-hardcoded-map-reduce',
  description:
    'Negative control (the subtle one). A fixed-window map-reduce over an externalized file handle. ' +
    'It externalizes context (G2/G3), runs in a persistent environment (G4), makes real programmatic ' +
    'sub-LM calls over constructed slices (G5), and keeps intermediate summaries as symbolic state (G7) — ' +
    'so it passes six of seven gates. It is still NOT an RLM because the decomposition is developer-authored, ' +
    'not model-chosen: the script fixes the slice boundaries, the fan-out, the reducer, and the stop condition. ' +
    'The model never inspects metadata to decide how to split, delegate, aggregate, or when to stop. ' +
    'Rubric reference: "Hardcoded map-reduce pipeline -> Fails G6."',
  phases: [
    { title: 'Map', detail: 'Summarize each FIXED line-window slice with its own subagent' },
    { title: 'Reduce', detail: 'Merge the window summaries with a FIXED reducer' }
  ]
}

// The corpus arrives as an opaque FILE HANDLE (an absolute path). We never inline
// its contents here — each subagent reads only its own slice. That is genuinely
// RLM-like (G2/G3/G4/G5/G7 all hold).
//
// The disqualifier is G6. An RLM lets the *model* look at metadata and decide the
// decomposition recursively. Here the decomposition is frozen by the developer:
// fixed window size, fixed window count, fixed left-to-right order, fixed reducer,
// fixed stop. Change the file and the split does not adapt. That is a pipeline, not
// a recursive language model.
const FILE = args
if (!FILE || typeof FILE !== 'string') {
  throw new Error('negative-hardcoded-map-reduce requires a file handle (path string) as args')
}

// >>> Developer-authored decomposition — the part a real RLM would hand to the model. <<<
const WINDOW_LINES = 200
const WINDOW_COUNT = 6

const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    window: { type: 'number' },
    summary: { type: 'string' },
    empty: { type: 'boolean' }
  },
  required: ['window', 'summary']
}

function mapPrompt(file, start, end, idx) {
  return [
    'You are a fixed-window summarizer in a developer-authored map-reduce pipeline.',
    'Read ONLY lines ' + start + '-' + end + ' of the file at this absolute path:',
    file,
    '',
    'HARD RULES:',
    '- Read ONLY that line range (e.g. `sed -n "' + start + ',' + end + 'p" <file>`). Do not read the rest.',
    '- Do NOT decide to widen, narrow, skip, or add windows. Your window is fixed by the script.',
    '',
    'Return { window: ' + idx + ', summary: <=3 sentences, empty: true if the range is past end-of-file }.'
  ].join('\n')
}

phase('Map')
// Fixed fan-out over fixed windows: the SCRIPT owns the decomposition, not the model.
const windows = []
for (let i = 0; i < WINDOW_COUNT; i++) {
  windows.push({ idx: i, start: i * WINDOW_LINES + 1, end: (i + 1) * WINDOW_LINES })
}
const summaries = (await parallel(
  windows.map(w => () =>
    agent(mapPrompt(FILE, w.start, w.end, w.idx), { label: 'map:w' + w.idx, phase: 'Map', schema: SUMMARY_SCHEMA })
  )
)).filter(Boolean)

phase('Reduce')
// Fixed reducer: concatenate non-empty summaries in window order. The model does
// not choose how to aggregate or when to stop — there is no recursion, no second pass.
const kept = summaries.filter(s => !s.empty).sort((a, b) => a.window - b.window)
const overview = await agent(
  'Combine these ordered window summaries into one overview. Do not request more windows or change the split:\n\n' +
    kept.map(s => '[window ' + s.window + '] ' + s.summary).join('\n'),
  { label: 'reduce', phase: 'Reduce' }
)

return {
  overview,
  window_count: WINDOW_COUNT,
  windows_summarized: kept.length,
  // Passes: G1 (file in, overview out), G2/G3 (file handle + line-range slices, never inlined),
  // G4 (persistent workflow env), G5 (sub-LM calls over real constructed slices),
  // G7 (summaries held as symbolic state, not re-verbalized into a root prompt).
  rlm_gate_failures: [
    'G6_model_chosen_decomposition' // fixed windows + fixed fan-out + fixed reducer + fixed stop
  ],
  why_not_rlm:
    'Hardcoded map-reduce pipeline: the developer fixed the split, delegation, aggregation, and stop. ' +
    'An RLM lets the model inspect metadata/handles and choose the decomposition recursively. ' +
    'Contrast with ../rlm/file-handle-clean.workflow.js, where the decomposition is model-driven.'
}
