import type { SegmentType } from '../types';

// ─── Prompt Engineering Guide Patterns ───────────────────────────────────────
// Synthesized from: Anthropic Claude Guide, OpenAI Prompt Engineering Guide,
// DAIR.AI PromptingGuide.ai, Google Gemini Prompting Guide

export interface GuidePattern {
  id: string;
  name: string;
  source: string;
  description: string;
  segments: SegmentType[];
  tip: string;
}

export const GUIDE_PATTERNS: GuidePattern[] = [
  {
    id: 'zero-shot',
    name: 'Zero-Shot',
    source: 'OpenAI / DAIR.AI',
    description: 'Direct instruction, no examples. Best for clear, well-defined tasks.',
    segments: ['role', 'task', 'constraints', 'format'],
    tip: 'Be very explicit in the task — the model has no examples to calibrate tone or style.',
  },
  {
    id: 'few-shot',
    name: 'Few-Shot',
    source: 'DAIR.AI / Anthropic',
    description: 'Include 2–3 demonstrations before the task. Dramatically improves consistency.',
    segments: ['role', 'task', 'examples', 'format'],
    tip: 'Examples should show edge cases, not just the happy path. Vary the inputs.',
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    source: 'Wei et al. 2022 / Anthropic',
    description: 'Instruct step-by-step reasoning before producing the final answer.',
    segments: ['role', 'task', 'context', 'chain_of_thought', 'format'],
    tip: 'For Claude: add "think step by step" or use a scratchpad section. Improves math, logic, multi-step reasoning.',
  },
  {
    id: 'role-prompting',
    name: 'Role Prompting',
    source: 'Anthropic Claude Guide',
    description: 'A strong, specific role primes domain knowledge, vocabulary, and judgment.',
    segments: ['role', 'tone', 'task', 'format'],
    tip: 'Add years of experience, specialization area, and a defining trait — not just "expert".',
  },
  {
    id: 'structured-output',
    name: 'Structured Output',
    source: 'OpenAI / Google Gemini Guide',
    description: 'Precise format specification ensures consistent, parseable responses.',
    segments: ['task', 'context', 'constraints', 'format'],
    tip: 'Show a JSON schema, numbered template, or XML skeleton in your format segment.',
  },
  {
    id: 'research-query',
    name: 'Research / Search',
    source: 'PromptingGuide.ai',
    description: 'Multi-faceted query construction for deep research tasks.',
    segments: ['role', 'task', 'context', 'refinement', 'constraints', 'format'],
    tip: 'The refinement segment is where search quality lives — scope, recency, source type, exclusions.',
  },
  {
    id: 'task-decompose',
    name: 'Task Decomposition',
    source: 'OpenAI Guide',
    description: 'Break complex goals into explicit sub-steps for higher reliability.',
    segments: ['role', 'task', 'chain_of_thought', 'constraints', 'format'],
    tip: 'Number the steps and include success criteria per step. Reduces hallucination on multi-part tasks.',
  },
  {
    id: 'iterative-refine',
    name: 'Iterative Refinement',
    source: 'Anthropic / OpenAI',
    description: 'Ask the model to draft, then self-critique and revise in one pass.',
    segments: ['role', 'task', 'context', 'chain_of_thought', 'format'],
    tip: 'Add "After drafting, review your response against [criteria] and revise where needed."',
  },
  {
    id: 'persona-tone',
    name: 'Persona + Tone',
    source: 'Google Gemini Guide',
    description: 'Define both the speaker persona and the exact voice/register for writing tasks.',
    segments: ['role', 'tone', 'task', 'constraints', 'format'],
    tip: 'Gemini guide recommends naming the audience explicitly and specifying what emotions to evoke.',
  },
  {
    id: 'input-output',
    name: 'Input → Output',
    source: 'OpenAI / Anthropic',
    description: 'Clearly describe what the user provides and what the model should return.',
    segments: ['task', 'input', 'constraints', 'format'],
    tip: 'The clearer you define the input format, the less error-correction is needed at inference time.',
  },
];

// ─── Transition / Linking Phrases ─────────────────────────────────────────────

type SegmentPair =
  | 'role_task' | 'role_context' | 'role_refinement'
  | 'task_context' | 'task_input' | 'task_chain_of_thought' | 'task_examples'
  | 'context_constraints' | 'context_input' | 'context_format'
  | 'constraints_format' | 'constraints_examples'
  | 'format_examples' | 'input_constraints' | 'input_format'
  | 'chain_of_thought_format'
  | '_default';

export interface TransitionOption {
  label: string; // short display name
  text: string;  // the actual connector text (prepended to next segment in assembly)
}

export const TRANSITION_PHRASES: Record<SegmentPair, TransitionOption[]> = {
  role_task: [
    { label: 'Drawing on…', text: 'Drawing on this expertise, ' },
    { label: 'In this role…', text: 'In this role, ' },
    { label: 'With this background…', text: 'With this background, ' },
    { label: 'None', text: '' },
  ],
  role_context: [
    { label: 'For context…', text: 'For context relevant to your role: ' },
    { label: 'Background…', text: 'Background: ' },
    { label: 'None', text: '' },
  ],
  role_refinement: [
    { label: 'Focus on…', text: 'Your search should focus on: ' },
    { label: 'Specifically…', text: 'Specifically, ' },
    { label: 'None', text: '' },
  ],
  task_context: [
    { label: 'For context…', text: '\n\nFor context: ' },
    { label: 'Background…', text: '\n\nBackground: ' },
    { label: 'To frame this…', text: '\n\nTo frame this properly: ' },
    { label: 'None', text: '' },
  ],
  task_input: [
    { label: 'I will provide…', text: '\n\nRegarding the input: ' },
    { label: 'What you will receive…', text: '\n\nYou will receive: ' },
    { label: 'None', text: '' },
  ],
  task_chain_of_thought: [
    { label: 'Approach…', text: '\n\nApproach this task as follows: ' },
    { label: 'Think through…', text: '\n\nBefore responding, think through this carefully: ' },
    { label: 'Reason by…', text: '\n\nReason through this step by step: ' },
    { label: 'None', text: '' },
  ],
  task_examples: [
    { label: 'For reference…', text: '\n\nFor reference, here are examples of the expected output: ' },
    { label: 'To illustrate…', text: '\n\nTo illustrate: ' },
    { label: 'None', text: '' },
  ],
  context_constraints: [
    { label: 'Within these params…', text: '\n\nWithin this context, observe these constraints: ' },
    { label: 'Important…', text: '\n\nImportant constraints: ' },
    { label: 'Keep in mind…', text: '\n\nKeep in mind: ' },
    { label: 'None', text: '' },
  ],
  context_input: [
    { label: 'Given this context…', text: '\n\nGiven this context, here is what I will provide: ' },
    { label: 'None', text: '' },
  ],
  context_format: [
    { label: 'Present as…', text: '\n\nPresent your response as follows: ' },
    { label: 'None', text: '' },
  ],
  constraints_format: [
    { label: 'Structure as…', text: '\n\nStructure your response as follows: ' },
    { label: 'Format…', text: '\n\nFormat: ' },
    { label: 'None', text: '' },
  ],
  constraints_examples: [
    { label: 'For example…', text: '\n\nFor example: ' },
    { label: 'None', text: '' },
  ],
  format_examples: [
    { label: 'Demonstrated by…', text: '\n\nTo demonstrate the expected format: ' },
    { label: 'None', text: '' },
  ],
  input_constraints: [
    { label: 'When processing…', text: '\n\nWhen processing this input, apply these constraints: ' },
    { label: 'None', text: '' },
  ],
  input_format: [
    { label: 'Return…', text: '\n\nReturn your output in this format: ' },
    { label: 'None', text: '' },
  ],
  chain_of_thought_format: [
    { label: 'Then output…', text: '\n\nAfter reasoning, format your final answer as follows: ' },
    { label: 'None', text: '' },
  ],
  _default: [
    { label: 'Additionally…', text: '\n\nAdditionally, ' },
    { label: 'Furthermore…', text: '\n\nFurthermore, ' },
    { label: 'Note…', text: '\n\nNote: ' },
    { label: 'None', text: '' },
  ],
};

export function getTransitions(fromType: SegmentType, toType: SegmentType): TransitionOption[] {
  const key = `${fromType}_${toType}` as SegmentPair;
  return TRANSITION_PHRASES[key] ?? TRANSITION_PHRASES['_default'];
}

// ─── Power Words ──────────────────────────────────────────────────────────────

export interface PowerWordGroup {
  weak: string[];   // patterns to detect
  strong: string[]; // replacements to offer
  hint: string;
}

export const POWER_WORDS: PowerWordGroup[] = [
  {
    weak: ['good', 'nice', 'great', 'excellent'],
    strong: ['precise', 'thorough', 'rigorous', 'authoritative', 'definitive'],
    hint: 'Specific quality adjectives carry more weight than generic praise.',
  },
  {
    weak: ['make', 'do', 'create', 'produce'],
    strong: ['generate', 'construct', 'synthesize', 'formulate', 'compose'],
    hint: 'Action verbs that name the cognitive process are more directive.',
  },
  {
    weak: ['analyze', 'look at'],
    strong: ['evaluate', 'assess', 'scrutinize', 'dissect', 'audit', 'benchmark'],
    hint: 'More specific analysis verbs clarify depth expected.',
  },
  {
    weak: ['write', 'write a'],
    strong: ['draft', 'compose', 'craft', 'articulate', 'formulate'],
    hint: 'Writing-specific verbs help calibrate tone and format.',
  },
  {
    weak: ['find', 'search', 'look for'],
    strong: ['identify', 'locate', 'surface', 'retrieve', 'curate', 'enumerate'],
    hint: 'Precise search verbs help focus the model on what counts as success.',
  },
  {
    weak: ['explain', 'tell me'],
    strong: ['describe', 'clarify', 'elaborate on', 'break down', 'unpack', 'demystify'],
    hint: 'Explanation verbs signal the expected audience sophistication.',
  },
  {
    weak: ['think about', 'consider'],
    strong: ['reason through', 'evaluate systematically', 'weigh the trade-offs of', 'critically assess'],
    hint: 'Explicit reasoning instructions improve chain-of-thought quality.',
  },
  {
    weak: ['a lot', 'many', 'some', 'very'],
    strong: ['at least three', 'five or more', 'a minimum of two', 'precisely', 'specifically'],
    hint: 'Quantified expectations reduce ambiguity and improve output control.',
  },
  {
    weak: ['be concise', 'brief'],
    strong: ['respond in under 200 words', 'limit to 3 bullet points', 'one paragraph maximum'],
    hint: 'Exact length constraints outperform vague brevity instructions.',
  },
  {
    weak: ['format it', 'present it', 'show it'],
    strong: ['use markdown headers', 'structure as a numbered list', 'respond in JSON', 'use a table'],
    hint: 'Named format types give the model less to interpret.',
  },
];

// ─── Segment Alternatives by Category ─────────────────────────────────────────
// Multiple variant templates for each (category × segment-type) pair.
// {topic} and {TOPIC} are substitution placeholders.

type TopicCategory =
  | 'coding' | 'writing' | 'search' | 'analysis'
  | 'creative' | 'explanation' | 'business' | 'general';

type AltMap = Partial<Record<SegmentType, string[]>>;

export const SEGMENT_ALTERNATIVES: Partial<Record<TopicCategory, AltMap>> = {

  coding: {
    role: [
      'You are a senior software engineer with 10+ years building production {topic} systems. You balance pragmatism with correctness and write code others can maintain.',
      'You are a code reviewer specializing in {topic}, known for precise, actionable feedback that catches subtle bugs without nitpicking style.',
      'You are a performance-focused engineer with deep expertise optimizing {topic} for scale, low latency, and minimal resource use.',
      'You are a security engineer who examines {topic} for vulnerabilities, OWASP compliance, and defensive patterns.',
    ],
    task: [
      'Implement a clean, well-tested solution for {topic}. Explain your design decisions and any trade-offs.',
      'Review the provided {topic} code for correctness, security, and maintainability. Return specific, prioritized improvements.',
      'Debug the {topic} issue by identifying the root cause, explaining why it occurs, and providing a verified fix.',
      'Refactor the {topic} code to improve readability and performance without changing external behavior.',
    ],
    constraints: [
      'Do not introduce breaking changes. Prefer standard library over third-party dependencies. No global mutable state.',
      'Keep solutions idiomatic to the language. Avoid premature optimization. Every function must have a single responsibility.',
      'Prioritize readability over cleverness. Name variables for intent. Avoid magic numbers. Add comments only where "why" is non-obvious.',
      'Maintain backward compatibility. Flag any security implications. Ensure edge cases are handled with tests, not just assertions.',
    ],
    format: [
      '1. **Summary** — what changed and why (2 sentences)\n2. **Code** — complete runnable snippet with inline comments\n3. **Trade-offs** — what was sacrificed for simplicity or speed',
      '**Root Cause**: [1 sentence]\n**Fix**: [code block]\n**Prevention**: [how to avoid recurrence]\n**Tests to add**: [list]',
      'Present as a diff-style explanation: what the old approach does, why it fails, and what the new approach does instead.',
    ],
  },

  writing: {
    role: [
      'You are a professional writer and editor specializing in {topic}. You write with precision, rhythm, and the reader firmly in mind.',
      'You are a content strategist who crafts {topic} content that drives engagement. You think in hooks, value propositions, and calls to action.',
      'You are a copywriter with a track record in {topic}, known for concise prose that converts. You avoid filler and every sentence earns its place.',
      'You are an editorial director who has refined hundreds of {topic} pieces. You can spot weak openings, buried leads, and passive voice instantly.',
    ],
    task: [
      'Write a compelling {topic} piece that hooks the reader in the first sentence and delivers clear value throughout.',
      'Draft a {topic} for [publication/platform] that matches its editorial voice while making a strong original point.',
      'Edit and rewrite the provided {topic} draft to sharpen the argument, improve flow, and strengthen the opening and closing.',
      'Create a {topic} structure (outline + key points per section) ready to expand into a full piece.',
    ],
    tone: [
      'Write with confidence and clarity. Use active voice, short paragraphs, and plain language. Avoid hedging and filler phrases.',
      'Match a conversational but authoritative tone — the voice of a knowledgeable friend, not a textbook.',
      'Use a direct, journalist-style voice: show with specifics, not adjectives. Lead with the most important fact.',
      'Adopt a warm, instructive tone appropriate for a how-to guide. Speak directly to the reader as "you".',
    ],
    refinement: [
      'After drafting, check: (1) Does the opening sentence earn attention? (2) Is every paragraph load-bearing? (3) Does the closing create forward momentum?',
      'Review for: buried lede, passive constructions, vague qualifiers ("very", "quite", "a lot"), and over-long sentences (>30 words).',
      'Ensure the piece has one clear argument or takeaway. Remove anything that doesn\'t advance it.',
    ],
  },

  search: {
    role: [
      'You are a meticulous research analyst skilled at surfacing accurate, relevant information about {topic} from diverse sources.',
      'You are a fact-checker and research librarian specializing in {topic}. You distinguish primary from secondary sources and flag uncertainty.',
      'You are an intelligence analyst trained to synthesize {topic} information from multiple angles into clear, actionable briefs.',
      'You are a competitive intelligence researcher who can find, verify, and contextualize {topic} information quickly and rigorously.',
    ],
    task: [
      'Research {topic} and surface the most accurate, current, and relevant information available.',
      'Find and compare the top options for {topic}, evaluating each against [criteria]. Provide a ranked recommendation.',
      'Compile a comprehensive briefing on {topic} suitable for [decision / presentation / deep understanding].',
      'Investigate {topic} and identify key facts, open questions, and areas of disagreement among experts.',
    ],
    refinement: [
      'Focus on: [specific aspects]. Exclude: [out-of-scope areas]. Time range: [last 12 months / 2022–present / all-time]. Region: [if applicable].',
      'Prioritize peer-reviewed or primary sources. Deprioritize: opinion pieces, press releases, undated content.',
      'Surface specifically: quantitative data, case studies, and named examples. Avoid generic summaries.',
      'Filter to: [industry / geography / use case]. Minimum credibility bar: [named authors / verified organizations / cited data].',
    ],
    format: [
      '**Key Findings** (5 bullets, most important first)\n**Evidence** (1 paragraph per finding with source context)\n**Gaps** (what remains unknown)\n**Next Steps** (what to investigate further)',
      'Present as a structured comparison table if evaluating options, followed by a 2–3 sentence recommendation.',
      '**TL;DR** (2 sentences)\n**Details** (organized by sub-topic)\n**Confidence Level** (high / medium / low per finding with rationale)',
    ],
  },

  analysis: {
    role: [
      'You are a rigorous data analyst with expertise in {topic}. You identify patterns others miss and form evidence-based conclusions without over-extrapolating.',
      'You are a business intelligence analyst specializing in {topic}, skilled at turning raw data into executive-ready insights.',
      'You are a critical thinker and analyst who approaches {topic} from first principles, always distinguishing correlation from causation.',
      'You are a quantitative researcher with deep experience analyzing {topic}, fluent in statistical reasoning and data visualization principles.',
    ],
    chain_of_thought: [
      'Approach this systematically: (1) Summarize what the data shows, (2) Identify what is notable or surprising, (3) Explain underlying causes or patterns, (4) State implications, (5) Recommend actions.',
      'Before concluding, ask: What alternative explanations exist? What would change this interpretation? What is the confidence level?',
      'Reason from the data outward: data → observation → pattern → hypothesis → implication → recommendation.',
    ],
    constraints: [
      'Distinguish correlation from causation. Acknowledge sample size limitations. Do not over-extrapolate. Flag assumptions explicitly.',
      'Cite specific data points to support each claim. Mark speculation separately from observation. Quantify uncertainty where possible.',
      'Avoid confirmation bias: explicitly consider what the data does NOT show, and what alternative explanations fit.',
    ],
  },

  general: {
    role: [
      'You are a knowledgeable, thoughtful assistant applying your best judgment about {topic} based on the most relevant domain knowledge available.',
      'You are a precise, direct assistant. You give complete answers, flag uncertainty, and never fabricate information about {topic}.',
      'You are a helpful expert who can explain {topic} at the appropriate level for the audience without condescension or unnecessary jargon.',
    ],
    constraints: [
      'Be direct. If uncertain, say so explicitly rather than hedging. Do not pad responses with filler or qualifications you don\'t mean.',
      'Prioritize accuracy over completeness. A shorter, correct answer beats a longer, partially wrong one.',
      'Stick to what was asked. Do not add unsolicited advice, warnings, or tangential information unless it directly affects the answer.',
    ],
    refinement: [
      'Focus specifically on [the most important aspect]. Deprioritize [what to skip]. If relevant, include [specific element].',
      'Calibrate to: [beginner / intermediate / expert] level. Assume the reader knows [X] but not [Y].',
      'Scope this to [time period / geography / domain]. Exclude [out-of-scope items]. Prioritize [criteria].',
    ],
  },
};

export function getAlternatives(
  type: SegmentType,
  category: TopicCategory,
  topic: string,
): string[] {
  const catAlts = SEGMENT_ALTERNATIVES[category];
  const typeAlts = catAlts?.[type] ?? SEGMENT_ALTERNATIVES.general?.[type] ?? [];
  if (!typeAlts.length) return [];

  const t = topic.trim() || 'the requested task';
  const tc = t.replace(/\b\w/g, (c) => c.toUpperCase());
  return typeAlts.map((s) =>
    s.replace(/\{TOPIC\}/g, tc).replace(/\{topic\}/g, t),
  );
}

// ─── Completeness Assessment ───────────────────────────────────────────────────

interface CompletenessResult {
  score: number; // 0–100
  missing: SegmentType[];
  tips: string[];
}

const CORE_TYPES: SegmentType[] = ['role', 'task', 'format'];
const RECOMMENDED_TYPES: SegmentType[] = ['context', 'constraints'];

export function scoreCompleteness(
  enabledTypes: Set<SegmentType>,
): CompletenessResult {
  const missing: SegmentType[] = [];
  const tips: string[] = [];
  let score = 0;

  for (const t of CORE_TYPES) {
    if (enabledTypes.has(t)) score += 25;
    else {
      missing.push(t);
      tips.push(`Add a "${t}" segment — it's essential for reliable output.`);
    }
  }

  for (const t of RECOMMENDED_TYPES) {
    if (enabledTypes.has(t)) score += 8;
    else missing.push(t);
  }

  if (enabledTypes.has('examples')) score += 6;
  if (enabledTypes.has('chain_of_thought')) score += 4;
  if (enabledTypes.has('refinement')) score += 4;
  if (enabledTypes.has('tone')) score += 3;

  if (!enabledTypes.has('examples') && enabledTypes.size >= 3) {
    tips.push('Adding an "examples" segment typically improves output consistency by 30–50%.');
  }
  if (!enabledTypes.has('chain_of_thought') && enabledTypes.has('task')) {
    tips.push('"Reasoning" (chain-of-thought) reduces errors on complex or multi-step tasks.');
  }

  return { score: Math.min(score, 100), missing, tips };
}

// ─── Next segment suggestion ───────────────────────────────────────────────────

const NATURAL_NEXT: Partial<Record<SegmentType, SegmentType>> = {
  role: 'task',
  task: 'context',
  context: 'constraints',
  constraints: 'format',
  format: 'examples',
  input: 'constraints',
  examples: 'chain_of_thought',
};

export function suggestNextType(existingTypes: Set<SegmentType>): SegmentType | null {
  // Walk the natural chain; return first type not yet present
  for (const [from, to] of Object.entries(NATURAL_NEXT) as [SegmentType, SegmentType][]) {
    if (existingTypes.has(from) && !existingTypes.has(to)) return to;
  }
  // Fall back to core types
  for (const t of CORE_TYPES) {
    if (!existingTypes.has(t)) return t;
  }
  return null;
}
