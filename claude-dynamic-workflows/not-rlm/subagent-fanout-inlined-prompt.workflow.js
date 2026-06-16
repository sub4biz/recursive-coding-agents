export const meta = {
  name: 'negative-subagent-fanout-inlined-prompt',
  description: 'Negative control: several subagents receive the same already-inlined prompt. This can be useful multi-agent review, but it is not RLM-complete because there is no external prompt handle, no symbolic decomposition, and no recursive handle state.',
}

const prompt = args && args.prompt
const question = args && args.question

if (!prompt || !question) {
  return { classification: 'not_rlm', reason: 'requires an inlined prompt and question' }
}

phase('Fanout')
const reviewers = await parallel(['a', 'b', 'c'].map(label => () =>
  agent(
    [
      'Answer the question from the full prompt below.',
      '',
      'QUESTION:',
      question,
      '',
      'FULL PROMPT:',
      prompt,
    ].join('\n'),
    { label: `review:${label}`, phase: 'Fanout' },
  )
))

phase('Merge')
const merged = await agent(
  'Merge these reviewer answers. Do not create or inspect child handles.',
  { label: 'merge', phase: 'Merge' },
)

return {
  answer: merged,
  reviewer_count: reviewers.length,
  rlm_gate_failures: [
    'G2_prompt_externalization',
    'G3_symbolic_handle',
    'G6_model_chosen_decomposition',
    'G7_symbolic_intermediate_state',
  ],
}

