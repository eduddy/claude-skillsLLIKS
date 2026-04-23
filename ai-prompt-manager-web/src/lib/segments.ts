import type { PromptSegment, SegmentType } from '@/types';
import { generateId } from './utils';

// ─── Segment metadata ─────────────────────────────────────────────────────────

export interface SegmentMeta {
  label: string;
  hint: string;
  /** Tailwind classes for the colored badge */
  badgeClass: string;
  /** Tailwind classes for the card left-border accent */
  accentClass: string;
}

export const SEGMENT_META: Record<SegmentType, SegmentMeta> = {
  role: {
    label: 'Role',
    hint: 'The persona or expertise the AI should embody',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    accentClass: 'border-l-indigo-400',
  },
  task: {
    label: 'Task',
    hint: 'The primary objective or action to perform',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    accentClass: 'border-l-blue-400',
  },
  context: {
    label: 'Context',
    hint: 'Background information, scope, or constraints on the subject',
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    accentClass: 'border-l-slate-400',
  },
  input: {
    label: 'Input',
    hint: 'Description of what the user will supply',
    badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    accentClass: 'border-l-gray-400',
  },
  constraints: {
    label: 'Constraints',
    hint: 'Rules, limits, or things the AI should avoid',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    accentClass: 'border-l-orange-400',
  },
  format: {
    label: 'Format',
    hint: 'Output structure, length, headings, or media type',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    accentClass: 'border-l-green-400',
  },
  tone: {
    label: 'Tone',
    hint: 'Voice, register, style, or emotional quality',
    badgeClass: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    accentClass: 'border-l-pink-400',
  },
  examples: {
    label: 'Examples',
    hint: 'Few-shot demonstrations of desired input→output pairs',
    badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    accentClass: 'border-l-yellow-400',
  },
  chain_of_thought: {
    label: 'Reasoning',
    hint: 'Chain-of-thought or step-by-step thinking instructions',
    badgeClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    accentClass: 'border-l-teal-400',
  },
  refinement: {
    label: 'Refinement',
    hint: 'Query sharpening — specificity, filters, or search-quality modifiers',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    accentClass: 'border-l-purple-400',
  },
};

// ─── Topic category detection ─────────────────────────────────────────────────

type TopicCategory =
  | 'coding'
  | 'writing'
  | 'search'
  | 'analysis'
  | 'creative'
  | 'explanation'
  | 'business'
  | 'general';

const CATEGORY_KEYWORDS: Record<TopicCategory, string[]> = {
  coding: [
    'code', 'function', 'bug', 'debug', 'refactor', 'test', 'unit test', 'api',
    'class', 'component', 'script', 'algorithm', 'typescript', 'javascript',
    'python', 'rust', 'golang', 'java', 'sql', 'regex', 'review', 'optimize',
    'performance', 'async', 'hook', 'deploy', 'ci', 'dockerfile', 'git',
  ],
  writing: [
    'write', 'blog', 'post', 'article', 'email', 'draft', 'essay', 'report',
    'summary', 'newsletter', 'cover letter', 'copywriting', 'content',
    'paragraph', 'headline', 'intro', 'conclusion', 'edit', 'proofread',
    'paraphrase', 'rewrite', 'tone', 'voice',
  ],
  search: [
    'search', 'find', 'research', 'query', 'look up', 'information about',
    'latest', 'best', 'top', 'papers', 'resources', 'sources', 'links',
    'articles', 'results', 'web', 'internet', 'online', 'database', 'news',
    'compare', 'vs', 'versus', 'options', 'recommendations', 'list of',
  ],
  analysis: [
    'analyze', 'analysis', 'evaluate', 'assess', 'compare', 'review',
    'pros cons', 'swot', 'data', 'metrics', 'insights', 'trends',
    'breakdown', 'identify', 'patterns', 'statistics', 'report on',
    'audit', 'interpret', 'synthesize',
  ],
  creative: [
    'story', 'fiction', 'poem', 'creative', 'brainstorm', 'ideas',
    'character', 'plot', 'world', 'narrative', 'imagine', 'invent',
    'design', 'concept', 'generate ideas', 'fantasy', 'sci-fi', 'dialogue',
  ],
  explanation: [
    'explain', 'what is', 'how does', 'teach', 'tutorial', 'guide',
    'understand', 'learn', 'eli5', 'simple', 'beginner', 'overview',
    'introduction', 'definition', 'concept', 'theory', 'principle',
  ],
  business: [
    'business', 'proposal', 'plan', 'strategy', 'pitch', 'deck',
    'presentation', 'market', 'customer', 'product', 'roadmap',
    'okr', 'kpi', 'pricing', 'competitive', 'growth', 'revenue',
    'stakeholder', 'executive', 'memo', 'decision', 'risk',
  ],
  general: [],
};

function detectCategory(topic: string): TopicCategory {
  const lower = topic.toLowerCase();
  const scores: Record<TopicCategory, number> = {
    coding: 0, writing: 0, search: 0, analysis: 0,
    creative: 0, explanation: 0, business: 0, general: 0,
  };

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [TopicCategory, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[cat] += kw.includes(' ') ? 2 : 1;
    }
  }

  const best = (Object.entries(scores) as [TopicCategory, number][])
    .sort((a, b) => b[1] - a[1])[0];

  return best[1] > 0 ? best[0] : 'general';
}

// ─── Template definitions ─────────────────────────────────────────────────────

interface SegmentTemplate {
  type: SegmentType;
  /** {topic} is replaced with the user's input; {TOPIC} is the title-cased version */
  content: string;
  enabled: boolean;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function fill(template: string, topic: string): string {
  return template
    .replace(/\{TOPIC\}/g, titleCase(topic))
    .replace(/\{topic\}/g, topic);
}

const TEMPLATES: Record<TopicCategory, SegmentTemplate[]> = {

  coding: [
    {
      type: 'role',
      content: 'You are a senior software engineer with deep expertise in {topic}, code quality, performance optimization, and software architecture best practices.',
      enabled: true,
    },
    {
      type: 'task',
      content: 'Your task is to assist with {topic}. Provide clear, working code along with concise explanations of your approach and any trade-offs involved.',
      enabled: true,
    },
    {
      type: 'context',
      content: 'The project targets modern environments. Prefer idiomatic patterns and avoid unnecessary dependencies. Flag any security considerations.',
      enabled: true,
    },
    {
      type: 'input',
      content: 'I will provide the relevant code, error messages, or requirements. Ask clarifying questions if context is missing before proceeding.',
      enabled: true,
    },
    {
      type: 'constraints',
      content: 'Do not introduce breaking changes unless explicitly requested. Avoid global state, magic numbers, and deeply nested logic. Prefer composition over inheritance.',
      enabled: false,
    },
    {
      type: 'format',
      content: 'Structure your response as:\n1. **Summary** — what you changed and why (2–3 sentences)\n2. **Code** — complete, runnable snippet with inline comments\n3. **Key Points** — bullet list of decisions, edge cases, or follow-up suggestions',
      enabled: true,
    },
    {
      type: 'chain_of_thought',
      content: 'Before writing code, briefly reason through the approach: identify the core problem, consider alternative solutions, then select and implement the best one.',
      enabled: false,
    },
    {
      type: 'refinement',
      content: 'Prioritize correctness first, then readability, then performance. If multiple solutions exist, briefly compare them before choosing.',
      enabled: false,
    },
  ],

  writing: [
    {
      type: 'role',
      content: 'You are an expert writer and editor specializing in {topic}. Your writing is clear, engaging, and precisely calibrated for the intended audience.',
      enabled: true,
    },
    {
      type: 'task',
      content: 'Write a compelling piece about {topic} that informs, persuades, or entertains the reader and achieves the stated goal.',
      enabled: true,
    },
    {
      type: 'context',
      content: 'The target audience is [describe audience]. The piece will be published on [platform/channel]. The purpose is to [goal: inform / persuade / convert / entertain].',
      enabled: true,
    },
    {
      type: 'tone',
      content: 'Use a confident, conversational tone — authoritative but approachable. Avoid jargon unless writing for a technical audience. Prefer active voice.',
      enabled: true,
    },
    {
      type: 'constraints',
      content: 'Stay focused on {topic}. Do not pad with filler phrases ("In conclusion…", "It is important to note…"). Every sentence should earn its place.',
      enabled: true,
    },
    {
      type: 'format',
      content: 'Structure: attention-grabbing hook → main body with clear subheadings → strong closing call-to-action. Target length: [word count].',
      enabled: true,
    },
    {
      type: 'refinement',
      content: 'After drafting, review for: (1) logical flow, (2) consistent voice, (3) specific details over vague claims, (4) a memorable opening line.',
      enabled: false,
    },
  ],

  search: [
    {
      type: 'role',
      content: 'You are a meticulous research assistant skilled at finding, evaluating, and synthesizing information about {topic}.',
      enabled: true,
    },
    {
      type: 'task',
      content: 'Find the most relevant, accurate, and up-to-date information about {topic}. Prioritize authoritative sources and highlight any conflicting views.',
      enabled: true,
    },
    {
      type: 'context',
      content: 'I need this information for [purpose: research / decision-making / comparison / learning]. Depth required: [surface overview / detailed analysis / exhaustive survey].',
      enabled: true,
    },
    {
      type: 'refinement',
      content: 'Focus specifically on: [key aspects]. Exclude: [out-of-scope areas]. Time range: [e.g., last 12 months / since 2020 / all-time]. Region/language: [if applicable].',
      enabled: true,
    },
    {
      type: 'constraints',
      content: 'Only include information you are confident is accurate. Flag speculation or contested claims. Prefer primary sources over summaries where possible.',
      enabled: true,
    },
    {
      type: 'format',
      content: 'Present findings as:\n- **Key Findings** (3–5 bullet points)\n- **Details** (one paragraph per major point with source context)\n- **Gaps / Uncertainties** (what remains unclear or contested)\n- **Further Reading** (titles or topics to explore next)',
      enabled: true,
    },
    {
      type: 'chain_of_thought',
      content: 'Before answering, reason through: (1) what is being asked, (2) what sources would be most authoritative, (3) how to distinguish reliable from unreliable information.',
      enabled: false,
    },
    {
      type: 'examples',
      content: 'Example of the depth I want:\nQuery: "best vector databases 2024"\nExpected: A comparison of Pinecone, Weaviate, Qdrant, and pgvector covering speed, cost, managed options, and ideal use cases — not just a name list.',
      enabled: false,
    },
  ],

  analysis: [
    {
      type: 'role',
      content: 'You are a rigorous analyst with expertise in {topic}. You excel at identifying patterns, surfacing non-obvious insights, and forming evidence-based conclusions.',
      enabled: true,
    },
    {
      type: 'task',
      content: 'Analyze the provided {topic} material thoroughly. Identify key trends, anomalies, strengths, weaknesses, and actionable insights.',
      enabled: true,
    },
    {
      type: 'input',
      content: 'I will provide [data / text / scenario] for analysis. Review it completely before drawing conclusions.',
      enabled: true,
    },
    {
      type: 'context',
      content: 'The analysis is for [audience: executives / technical team / general readers]. Decision to be made: [what will this analysis inform?]',
      enabled: true,
    },
    {
      type: 'chain_of_thought',
      content: 'Think step by step: (1) summarize what you observe, (2) identify what is noteworthy, (3) explain the underlying causes or patterns, (4) state implications, (5) recommend actions.',
      enabled: true,
    },
    {
      type: 'constraints',
      content: 'Distinguish between correlation and causation. Acknowledge data limitations. Do not over-extrapolate from small samples.',
      enabled: true,
    },
    {
      type: 'format',
      content: 'Structure:\n1. **Executive Summary** (3–5 sentences)\n2. **Key Findings** (bulleted, ranked by importance)\n3. **Supporting Evidence** (data points, quotes, or examples)\n4. **Risks & Limitations**\n5. **Recommended Actions**',
      enabled: true,
    },
  ],

  creative: [
    {
      type: 'role',
      content: 'You are a creative collaborator with a vivid imagination. You specialize in {topic} and bring originality, specificity, and emotional resonance to every idea.',
      enabled: true,
    },
    {
      type: 'task',
      content: 'Generate creative work related to {topic}. Prioritize originality over predictability — avoid clichés and the first idea that comes to mind.',
      enabled: true,
    },
    {
      type: 'context',
      content: 'Genre / style: [describe]. Audience: [who will experience this?]. Mood or themes to explore: [list]. Any elements to include or avoid: [specify].',
      enabled: true,
    },
    {
      type: 'tone',
      content: 'Aim for [tone: dark and atmospheric / whimsical / gritty and realistic / lyrical / satirical]. The emotional note to land on is [feeling].',
      enabled: true,
    },
    {
      type: 'constraints',
      content: 'Avoid: purple prose, deus ex machina, flat characters, and over-explanation. Show, don\'t tell. Trust the reader.',
      enabled: false,
    },
    {
      type: 'format',
      content: 'Deliver: [a short story / 3 concept pitches with one-line descriptions / a poem of 3 stanzas / 5 character sketches]. After, briefly note the creative choices made.',
      enabled: true,
    },
    {
      type: 'refinement',
      content: 'Give me 2–3 distinct variations that take very different creative directions, so I can choose a direction to develop further.',
      enabled: false,
    },
  ],

  explanation: [
    {
      type: 'role',
      content: 'You are a gifted teacher who can explain {topic} with clarity, precision, and appropriate depth for any audience.',
      enabled: true,
    },
    {
      type: 'task',
      content: 'Explain {topic} so the reader fully understands: what it is, how it works, why it matters, and where it fits into the bigger picture.',
      enabled: true,
    },
    {
      type: 'context',
      content: 'The reader\'s background: [beginner with no prior knowledge / intermediate with familiarity in X / expert seeking a concise refresher]. Start from that level.',
      enabled: true,
    },
    {
      type: 'examples',
      content: 'Use at least two concrete, real-world examples or analogies that make the concept tangible. Choose examples from everyday life where possible.',
      enabled: true,
    },
    {
      type: 'chain_of_thought',
      content: 'Build the explanation progressively: start with the core intuition → add necessary mechanics → address common misconceptions → connect to related concepts.',
      enabled: true,
    },
    {
      type: 'format',
      content: 'Structure: one-sentence definition → conceptual explanation (2–3 paragraphs) → worked example → common pitfalls → summary in plain language.',
      enabled: true,
    },
    {
      type: 'constraints',
      content: 'Avoid unexplained jargon. If a technical term is necessary, define it inline. Keep sentences short. Prefer "you" over "one".',
      enabled: false,
    },
  ],

  business: [
    {
      type: 'role',
      content: 'You are a strategic business consultant with expertise in {topic}. You think rigorously about outcomes, trade-offs, and stakeholder perspectives.',
      enabled: true,
    },
    {
      type: 'task',
      content: 'Help develop a clear, compelling, and actionable approach to {topic} that can be communicated to decision-makers.',
      enabled: true,
    },
    {
      type: 'context',
      content: 'Company context: [industry, size, stage]. Audience: [C-suite / board / team leads]. Key constraint: [budget / time / headcount / regulation].',
      enabled: true,
    },
    {
      type: 'constraints',
      content: 'Be direct and opinionated — avoid "it depends" without explaining the specific conditions. Acknowledge risks but don\'t hedge every statement.',
      enabled: true,
    },
    {
      type: 'format',
      content: 'Use a concise executive format:\n- **Situation** (1–2 sentences)\n- **Recommendation** (bold, clear action)\n- **Rationale** (3 key reasons)\n- **Risks** (top 2 with mitigations)\n- **Next Steps** (immediate actions, owners, timeline)',
      enabled: true,
    },
    {
      type: 'chain_of_thought',
      content: 'Before presenting the recommendation, silently work through: goals → constraints → options → criteria → selection → implementation path.',
      enabled: false,
    },
    {
      type: 'refinement',
      content: 'Focus specifically on {topic} in the context of [market segment / product line / time horizon]. Filter out generic advice that applies to every business.',
      enabled: true,
    },
  ],

  general: [
    {
      type: 'role',
      content: 'You are a knowledgeable and thoughtful assistant with broad expertise. Apply your best judgment about {topic} based on the most relevant domain knowledge.',
      enabled: true,
    },
    {
      type: 'task',
      content: 'Help me with {topic}. Provide accurate, complete, and actionable information tailored to my specific situation.',
      enabled: true,
    },
    {
      type: 'context',
      content: 'Additional context: [describe your situation, goal, or any relevant background that helps tailor the response].',
      enabled: true,
    },
    {
      type: 'constraints',
      content: 'Be concise and direct. If you are uncertain about something, say so. Do not fabricate information — flag gaps in your knowledge.',
      enabled: true,
    },
    {
      type: 'format',
      content: 'Format the response for easy scanning: use bullet points or numbered lists for multi-part answers, bold key terms, and keep paragraphs short.',
      enabled: true,
    },
    {
      type: 'refinement',
      content: 'Focus specifically on [the most important aspect]. I am less interested in [what to deprioritize]. If relevant, include [specific element you want].',
      enabled: false,
    },
    {
      type: 'chain_of_thought',
      content: 'Think through this step by step before giving your final answer.',
      enabled: false,
    },
  ],
};

// ─── Quick-start presets ───────────────────────────────────────────────────────

export interface Preset {
  label: string;
  topic: string;
  description: string;
  category: TopicCategory;
}

export const PRESETS: Preset[] = [
  { label: 'Code Review', topic: 'code review for TypeScript', category: 'coding', description: 'Structured review with bug detection and refactoring suggestions' },
  { label: 'Research Query', topic: 'research and find information about a topic', category: 'search', description: 'Multi-faceted query with source quality filters and scoping' },
  { label: 'Blog Post', topic: 'writing a compelling blog post', category: 'writing', description: 'Hook-to-CTA structure with audience and tone guidance' },
  { label: 'Data Analysis', topic: 'data analysis and insights extraction', category: 'analysis', description: 'Evidence-based analysis with executive summary format' },
  { label: 'Explain Concept', topic: 'explaining a technical concept clearly', category: 'explanation', description: 'Progressive explanation with analogies and worked examples' },
  { label: 'Business Pitch', topic: 'a business proposal or pitch', category: 'business', description: 'Executive-ready format with recommendation and risk framing' },
  { label: 'Creative Story', topic: 'writing an original short story', category: 'creative', description: 'Genre-flexible with tone, constraints, and originality focus' },
  { label: 'Debug Error', topic: 'debugging an error or unexpected behavior', category: 'coding', description: 'Root-cause analysis with fix and prevention strategy' },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/** Generate a set of typed, editable prompt segments for a given topic. */
export function generateSegments(topic: string): PromptSegment[] {
  const trimmed = topic.trim() || 'the requested task';
  const category = detectCategory(trimmed);
  const templates = TEMPLATES[category];

  return templates.map((t): PromptSegment => ({
    id: generateId(),
    type: t.type,
    content: fill(t.content, trimmed),
    enabled: t.enabled,
  }));
}

/** Generate a single blank segment of the given type. */
export function blankSegment(type: SegmentType, topic: string): PromptSegment {
  const templates = Object.values(TEMPLATES).flat();
  const match = templates.find((t) => t.type === type);
  const content = match ? fill(match.content, topic || 'the task') : '';
  return { id: generateId(), type, content, enabled: true };
}

/** Assemble enabled segments into a single prompt string. */
export function assemblePrompt(segments: PromptSegment[]): string {
  return segments
    .filter((s) => s.enabled)
    .map((s) => {
      const meta = SEGMENT_META[s.type];
      return `## ${meta.label}\n${s.content}`;
    })
    .join('\n\n');
}

/** Assemble without headers — clean prompt text ready to paste. */
export function assembleClean(segments: PromptSegment[]): string {
  return segments
    .filter((s) => s.enabled)
    .map((s) => s.content.trim())
    .join('\n\n');
}

export const ALL_SEGMENT_TYPES: SegmentType[] = [
  'role', 'task', 'context', 'input', 'constraints',
  'format', 'tone', 'examples', 'chain_of_thought', 'refinement',
];
