export const meta = {
  name: 'negative-single-agent-handle-reader',
  description: 'Negative control: one subagent may use bash/search over a handle, but there is no recursive model subcall tree, no manifest of child handles, and no symbolic aggregation from intermediate state.',
}

const handle = args && args.handle
const question = args && args.question

if (!handle || !question) {
  return { classification: 'not_rlm', reason: 'requires a handle and question' }
}

phase('Read')
const answer = await agent(
  [
    'Use tools however you need to answer the question from this handle.',
    `HANDLE: ${handle}`,
    `QUESTION: ${question}`,
    '',
    'Do not spawn subagents. Do not create a child-handle manifest.',
  ].join('\n'),
  { label: 'single-reader', phase: 'Read' },
)

return {
  answer,
  rlm_gate_failures: [
    'G5_programmatic_subcalls',
    'G6_model_chosen_decomposition',
    'G7_symbolic_intermediate_state',
  ],
}

