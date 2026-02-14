import { subsidiaries, type SloganData } from './content'

// ── Seeded RNG (LCG) ────────────────────────────────────────────────
// Large prime offset ensures early seeds don't cluster on the same array indices
const SEED_OFFSET = 48271

function seededRandom(seed: number): () => number {
  let s = seed + SEED_OFFSET
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

/** Check if the same word root appears more than once in the text */
function hasRepeatedRoot(text: string): boolean {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
  const roots = words.map((w) =>
    w.replace(/(izing|ising|ating|ting|ing|ized|ised|ated|ify|ize|ise|ed|ly|ment|tion)$/, ''),
  )
  const seen = new Set<string>()
  for (const root of roots) {
    if (root.length < 4) continue
    if (seen.has(root)) return true
    seen.add(root)
  }
  return false
}

// ── Word Banks ───────────────────────────────────────────────────────
// Arrays are shuffled so no single term dominates early seeds

const VERBS_GERUND = [
  'Leveraging', 'Orchestrating', 'Disrupting', 'Accelerating', 'Scaling',
  'Transforming', 'Deploying', 'Optimizing', 'Empowering', 'Monetizing',
  'Pivoting', 'Architecting', 'Streamlining', 'Democratizing', 'Innovating',
  'Vertically Integrating', 'Blockchaining', 'Onboarding', 'Decentralizing',
  'Platformizing', 'Containerizing', 'Evangelizing', 'Gamifying',
  'Tokenizing', 'Upskilling', 'Rightsizing', 'Cloudifying', 'Fine-Tuning',
  'Prompt-Engineering', 'Embedding', 'Inferencing', 'Distilling',
  'Vectorizing', 'Hyper-Scaling', 'Cross-Pollinating', 'Future-Proofing',
  'Sunsetting', 'Ideating', 'Workshopping', 'Whiteboarding', 'Blue-Skying',
  'Incubating', 'Co-Creating', 'Operationalizing', 'Productizing',
  'Aligning', 'Benchmarking', 'Cascading', 'Socializing', 'Envisioning',
  'Re-Imagining', 'Unlocking', 'Amplifying', 'Catalyzing', 'Consolidating',
  'Activating', 'Calibrating', 'Provisioning', 'Normalizing', 'Synergizing',
  'De-Risking', 'Facilitating', 'Prioritizing', 'Onshoring',
  'Right-Channeling', 'Retaining', 'Engaging', 'Matricizing',
] as const

const VERBS_IMPERATIVE = [
  'Leverage', 'Orchestrate', 'Disrupt', 'Accelerate', 'Scale',
  'Transform', 'Deploy', 'Optimize', 'Empower', 'Monetize',
  'Pivot', 'Architect', 'Streamline', 'Democratize', 'Innovate',
  'Decentralize', 'Evangelize', 'Gamify', 'Tokenize', 'Upskill',
  'Rightsize', 'Cloudify', 'Containerize', 'Sunset', 'Ideate',
  'Workshop', 'Whiteboard', 'Blue-Sky', 'Incubate', 'Co-Create',
  'Operationalize', 'Productize', 'Align', 'Benchmark', 'Cascade',
  'Socialize', 'Envision', 'Re-Imagine', 'Unlock', 'Amplify',
  'Catalyze', 'Consolidate', 'Activate', 'Calibrate', 'Provision',
  'Normalize', 'Unpack', 'Circle Back', 'Deep Dive', 'Double-Click',
  'Move The Needle', 'Synergize', 'De-Risk', 'Facilitate', 'Prioritize',
  'Engage', 'Retain', 'Onshore',
] as const

const VERBS_PAST = [
  'Leveraged', 'Orchestrated', 'Disrupted', 'Accelerated', 'Scaled',
  'Transformed', 'Deployed', 'Optimized', 'Empowered', 'Monetized',
  'Pivoted', 'Architected', 'Streamlined', 'Democratized', 'Innovated',
  'Decentralized', 'Evangelized', 'Gamified', 'Tokenized', 'Upskilled',
  'Rightsized', 'Cloudified', 'Containerized', 'Embedded', 'Vectorized',
  'Distilled', 'Fine-Tuned', 'Incubated', 'Co-Created', 'Operationalized',
  'Productized', 'Benchmarked', 'Cascaded', 'Socialized', 'Envisioned',
  'Re-Imagined', 'Unlocked', 'Amplified', 'Consolidated', 'Activated',
  'Calibrated', 'Provisioned', 'Normalized', 'Synergized', 'De-Risked',
  'Facilitated', 'Prioritized', 'Engaged', 'Retained',
] as const

const NOUNS = [
  'Paradigm', 'Ecosystem', 'Pipeline', 'Bandwidth', 'North Star',
  'KPIs', 'OKRs', 'Value Proposition', 'Core Competencies',
  'Thought Leadership', 'Market Share', 'Supply Chain', 'Revenue Streams',
  'EBITDA', 'Free Cash Flow', 'Blockchain', 'Digital Twin',
  'Neural Network', 'Large Language Model', 'RAG Pipeline',
  'Agentic Workflows', 'Transformer Architecture', 'Attention Mechanism',
  'Embeddings', 'Inference Engine', 'AI Governance', 'Prompt Templates',
  'Action Items', 'Deliverables', 'Alignment', 'Best Practices',
  'Deep Dive', 'Low-Hanging Fruit', 'Runway', 'Burn Rate',
  'Growth Hacking', 'Disruption Index', 'Innovation Funnel', 'Tech Stack',
  'Data Lake', 'Cloud Strategy', 'Flywheel', 'Moat', 'Headcount',
  'Mindshare', 'Swimlane', 'Tiger Team', 'Greenfield', 'Brownfield',
  'Guardrails', 'Sandbox', 'Vertical', 'Horizontal', 'Customer Journey',
  'Touchpoint', 'Pain Point', 'White Space', 'Blue Ocean',
  'Token Budget', 'Context Window', 'Vector Database', 'Prompt Chain',
  'Latent Space', 'Due Diligence', 'Fiscal Responsibility',
  'Capital Allocation', 'Operating Leverage', 'Unit Economics',
  'Total Addressable Market', 'Go-To-Market', 'Product-Market Fit',
  'Net Promoter Score', 'Synergy',
  // Stakeholder management
  'Stakeholders', 'Stakeholder Engagement', 'Stakeholder Matrix',
  'Stakeholder Buy-In', 'Change Management', 'Executive Sponsorship',
  'Governance Framework', 'RACI Matrix', 'Escalation Path',
  'Cross-Functional Alignment', 'Organizational Design',
  'Talent Pipeline', 'Succession Planning', 'Performance Framework',
  'Workforce Optimization', 'Employee Engagement', 'Retention Strategy',
  'Cultural Transformation', 'Leadership Development',
  'Board Oversight', 'Fiduciary Duty', 'Accountability Framework',
  'Risk Appetite', 'Compliance Posture', 'Audit Trail',
  'Materiality Assessment', 'ESG Commitments',
] as const

const ADJECTIVES = [
  'Enterprise-Grade', 'Cloud-Native', 'AI-Powered', 'Blockchain-Enabled',
  'Data-Driven', 'Mission-Critical', 'Next-Gen', 'Holistic',
  'Scalable', 'Bleeding-Edge', 'Full-Stack', 'Zero-Trust',
  'Responsible', 'Agentic', 'Generative', 'Predictive',
  'Prescriptive', 'Multi-Modal', 'Cross-Functional', 'Omnichannel',
  'Hyper-Converged', 'Quantum-Ready', 'Web3-Adjacent', 'Carbon-Neutral',
  'Purpose-Driven', 'Stakeholder-Aligned', 'Paradigm-Shifting',
  'ROI-Positive', 'Human-Centered', 'Outcome-Oriented', 'Impact-First',
  'Value-Added', 'Best-In-Class', 'World-Class', 'Battle-Tested',
  'Production-Ready', 'Compliance-Forward', 'Revenue-Aligned',
  'Zero-Downtime', 'Kubernetes-Native', 'GPU-Accelerated',
  'Inference-Optimized', 'Context-Rich', 'Token-Efficient',
  'Client-Facing', 'Results-Oriented', 'Future-Ready',
  // Stakeholder / governance
  'Board-Approved', 'Governance-First', 'Risk-Adjusted',
  'Audit-Ready', 'Fiduciary-Grade', 'ESG-Compliant',
  'Stakeholder-Centric', 'Change-Ready', 'Culture-Driven',
] as const

const SIMPLE_ADJECTIVES = [
  'Powerful', 'Bold', 'Agile', 'Robust', 'Lean', 'Smart',
  'Fast', 'Seamless', 'Elegant', 'Dynamic', 'Innovative',
  'Visionary', 'Relentless', 'Disruptive', 'Transformative',
  'Unstoppable', 'Pivotal', 'Strategic', 'Resilient', 'Precise',
] as const

const SIMPLE_VERBS = [
  'Disrupts', 'Scales', 'Pivots', 'Ships', 'Deploys',
  'Transforms', 'Innovates', 'Monetizes', 'Delivers',
  'Compounds', 'Transcends', 'Converts', 'Elevates', 'Resonates',
] as const

const ADVERB_PHRASES = [
  'At Scale', 'Going Forward', 'In The Cloud', 'From Day One',
  'By Design', 'Through Innovation', 'Across Paradigms',
  'In Real-Time', 'Per Our Last Meeting', 'On The Blockchain',
  'Via Neural Networks', 'Using AI', 'For Stakeholders',
  'Before Q4', 'After The Pivot', 'Beyond The Paradigm',
  'Into The Metaverse', 'Around The Clock', 'Despite Headwinds',
  'Toward Profitability', 'With Zero Latency', 'Since The Merger',
  'Until Further Notice', 'Above Market Rate', 'Below Budget',
  'Ahead Of Schedule', 'With Full Alignment', 'On A Go-Forward Basis',
  'Per The Roadmap', 'Outside The Box', 'Against All Benchmarks',
  'Through The Funnel', 'Across All Verticals', 'End-To-End',
  'With Conviction', 'Quarter Over Quarter', 'With Synergy',
  'Per The Governance Framework', 'With Board Approval',
  'Across All Stakeholder Groups', 'With Full Transparency',
] as const

const NUMBERS = [
  '147', '300', '420', '500', '800', '1,200', '2,500',
  '4,000', '9,001', '10,000', '42', '99.9', '1,000,000',
] as const

// ── Subsidiary helpers ───────────────────────────────────────────────
const subNames = subsidiaries
  .filter((s) => s.id !== 'brightpath')
  .map((s) => s.name)

// ── Subtitle Templates ──────────────────────────────────────────────
type SubtitleFn = (rng: () => number) => string

const SUBTITLE_TEMPLATES: SubtitleFn[] = [
  (rng) => `A ${pick(subNames, rng)} Initiative`,
  (rng) => `Powered by ${pick(subNames, rng)}`,
  (rng) => `${pick(ADJECTIVES, rng)} ${pick(NOUNS, rng)}`,
  (rng) => `${pick(ADJECTIVES, rng)} Solutions ${pick(ADVERB_PHRASES, rng)}`,
  () => 'A BrightPath Global Solutions Group Company',
  () => 'ISO 9001 Certified Excellence',
  () => 'Trusted by Fortune 500 Brands',
  (rng) => `${pick(VERBS_GERUND, rng)} Since 2019`,
  (rng) => `From ${pick(NOUNS, rng)} To ${pick(NOUNS, rng)}`,
  (rng) => `${pick(NOUNS, rng)} Meets ${pick(NOUNS, rng)}`,
  () => 'Per Our Last Alignment Session',
  () => 'The BrightPath Way\u2122',
  (rng) => `Brought To You By ${pick(subNames, rng)}`,
  (rng) => `Q${Math.floor(rng() * 4) + 1} ${new Date().getFullYear()} Results`,
  () => 'Blockchain-Enabled Enterprise Solutions',
  (rng) => `${pick(ADJECTIVES, rng)} By Design`,
  (rng) => `${pick(VERBS_GERUND, rng)} The Future`,
  () => 'Taking This Offline Since 2019',
  () => 'Proactive Stakeholder Optimization',
  (rng) => `A ${pick(ADJECTIVES, rng)} ${pick(subNames, rng)} Product`,
  () => 'Please Hold For Alignment',
  (rng) => `${pick(NOUNS, rng)}-First. Always.`,
  () => 'As Seen At Davos',
  (rng) => `${pick(VERBS_PAST, rng)} And ${pick(VERBS_PAST, rng)}`,
  () => 'Pending Board Approval',
  (rng) => `${pick(NUMBERS, rng)}x ${pick(NOUNS, rng)} Growth`,
  (rng) => `${pick(subNames, rng)} \u2014 A BrightPath Company`,
  () => 'Now In 150+ Countries',
  (rng) => `${pick(ADJECTIVES, rng)} ${pick(ADJECTIVES, rng)} Solutions`,
  (rng) => `Fiscal Year ${2020 + Math.floor(rng() * 8)} Highlights`,
  () => 'Shareholder Value Realized',
  () => 'Building Tomorrow Today',
  (rng) => `${pick(ADJECTIVES, rng)} Infrastructure At Scale`,
  () => 'Where Strategy Meets Execution',
  () => 'From Insight To Impact',
  () => 'Stakeholder-Approved Since Day One',
  () => 'Governance-First By Design',
  (rng) => `${pick(ADJECTIVES, rng)} Stakeholder Engagement`,
  () => 'Board-Certified Excellence',
  () => 'Maximizing Stakeholder Value',
]

// ── Slogan Templates ────────────────────────────────────────────────
type SloganFn = (rng: () => number) => string

const SLOGAN_TEMPLATES: SloganFn[] = [
  // 1. Three imperatives
  (rng) =>
    `${pick(VERBS_IMPERATIVE, rng)}.\n${pick(VERBS_IMPERATIVE, rng)}.\n${pick(VERBS_IMPERATIVE, rng)}.`,
  // 2. Classic corporate: Gerund + Noun + Adverb
  (rng) =>
    `${pick(VERBS_GERUND, rng)}\n${pick(NOUNS, rng)}\n${pick(ADVERB_PHRASES, rng)}`,
  // 3. Triple meeting
  (rng) =>
    `Where ${pick(NOUNS, rng)}\nMeets ${pick(NOUNS, rng)}\nMeets ${pick(NOUNS, rng)}`,
  // 4. Adjective stack
  (rng) =>
    `${pick(ADJECTIVES, rng)}\n${pick(ADJECTIVES, rng)}\n${pick(NOUNS, rng)}`,
  // 5. The-noun pattern
  (rng) =>
    `${pick(VERBS_GERUND, rng)}\nThe ${pick(NOUNS, rng)}\n${pick(ADVERB_PHRASES, rng)}`,
  // 6. Journey pattern
  (rng) =>
    `From ${pick(NOUNS, rng)}\nTo ${pick(NOUNS, rng)}\nTo ${pick(NOUNS, rng)}`,
  // 7. Recursive corporate
  (rng) =>
    `Our ${pick(NOUNS, rng)}\nHas A\n${pick(NOUNS, rng)}`,
  // 8. Superlative flex
  (rng) =>
    `${pick(NOUNS, rng)}\nSo ${pick(SIMPLE_ADJECTIVES, rng)}\nIt ${pick(SIMPLE_VERBS, rng)}`,
  // 9. Past-tense achievement
  (rng) =>
    `${pick(ADJECTIVES, rng)}\n${pick(NOUNS, rng)}\n${pick(VERBS_PAST, rng)}`,
  // 10. Triple gerund
  (rng) =>
    `${pick(VERBS_GERUND, rng)}\n${pick(VERBS_GERUND, rng)}\n${pick(VERBS_GERUND, rng)}`,
  // 11. Recursive growth
  (rng) =>
    `${pick(NOUNS, rng)} Over ${pick(NOUNS, rng)}\nOver ${pick(NOUNS, rng)}\nOver ${pick(NOUNS, rng)}`,
  // 12. Double down
  (rng) => {
    const v = pick(VERBS_IMPERATIVE, rng)
    return `${v} The\n${pick(NOUNS, rng)}.\nThen ${v} It Again.`
  },
  // 13. Stat-style
  (rng) =>
    `${pick(NUMBERS, rng)}%\n${pick(NOUNS, rng)}\nIncrease`,
  // 14. Service promise
  (rng) =>
    `We ${pick(VERBS_PAST, rng)}\nThe ${pick(NOUNS, rng)}\nSo You Don't Have To`,
  // 15. Product pitch
  (rng) =>
    `${pick(ADJECTIVES, rng)}\n${pick(NOUNS, rng)} For\n${pick(ADJECTIVES, rng)} ${pick(NOUNS, rng)}`,
  // 16. Brand push
  (rng) =>
    `Think ${pick(NOUNS, rng)}.\nThink ${pick(NOUNS, rng)}.\nThink ${pick(subNames, rng)}.`,
  // 17. Subsidiary branded
  (rng) =>
    `${pick(subNames, rng)}\nPresents:\n${pick(ADJECTIVES, rng)} ${pick(NOUNS, rng)}`,
  // 18. Earnings style
  (rng) =>
    `Q${Math.floor(rng() * 4) + 1} Results:\n${pick(ADJECTIVES, rng)}\n${pick(NOUNS, rng)}`,
  // 19. Priority list
  (rng) =>
    `${pick(NOUNS, rng)}-First,\n${pick(NOUNS, rng)}-Always,\n${pick(NOUNS, rng)}-Eventually`,
  // 20. Contrast triad
  (rng) =>
    `Zero ${pick(NOUNS, rng)}\nInfinite ${pick(NOUNS, rng)}\nPure ${pick(NOUNS, rng)}`,
  // 21. The question
  (rng) =>
    `What If\n${pick(NOUNS, rng)}\nWas ${pick(ADJECTIVES, rng)}?`,
  // 22. Drama dots
  (rng) =>
    `${pick(VERBS_IMPERATIVE, rng)}.\n${pick(NOUNS, rng)}.\n${pick(ADVERB_PHRASES, rng)}.`,
  // 23. Confession
  (rng) =>
    `We Don't Just\n${pick(VERBS_IMPERATIVE, rng)}.\nWe ${pick(VERBS_IMPERATIVE, rng)}.`,
  // 24. Year-in-review
  (rng) =>
    `${2020 + Math.floor(rng() * 8)}:\nThe Year We\n${pick(VERBS_PAST, rng)}`,
  // 25. Promise
  (rng) =>
    `${pick(ADJECTIVES, rng)}\n${pick(NOUNS, rng)}\nGuaranteed`,
  // 26. Comparison
  (rng) =>
    `Like ${pick(NOUNS, rng)}\nBut More\n${pick(ADJECTIVES, rng)}`,
  // 27. Definition style
  (rng) =>
    `${pick(NOUNS, rng)}:\n${pick(ADJECTIVES, rng)}\n${pick(NOUNS, rng)}`,
  // 28. Two-liner power
  (rng) =>
    `${pick(ADJECTIVES, rng)}\n${pick(NOUNS, rng)}`,
  // 29. Redefined
  (rng) =>
    `${pick(NOUNS, rng)},\nRedefined\n${pick(ADVERB_PHRASES, rng)}`,
  // 30. Adj meets Adj
  (rng) =>
    `${pick(ADJECTIVES, rng)}\nMeets\n${pick(ADJECTIVES, rng)}`,
  // 31. Not just X
  (rng) =>
    `Not Just\n${pick(NOUNS, rng)}.\n${pick(ADJECTIVES, rng)} ${pick(NOUNS, rng)}.`,
  // 32. The future is
  (rng) =>
    `The Future\nIs ${pick(ADJECTIVES, rng)}\nAnd It's Here`,
  // 33. Command + noun + adverb
  (rng) =>
    `${pick(VERBS_IMPERATIVE, rng)}\nYour ${pick(NOUNS, rng)}\n${pick(ADVERB_PHRASES, rng)}`,
  // 34. One more thing
  (rng) =>
    `One. More.\n${pick(NOUNS, rng)}.`,
  // 35. We are
  (rng) =>
    `We Are\n${pick(ADJECTIVES, rng)}\n${pick(NOUNS, rng)}`,
  // 36. Beyond X
  (rng) =>
    `Beyond\n${pick(NOUNS, rng)}\nLies ${pick(NOUNS, rng)}`,
  // 37. Because
  (rng) =>
    `Because\n${pick(NOUNS, rng)}\nMatters`,
  // 38. Percent claim
  (rng) =>
    `${pick(NUMBERS, rng)}%\nMore ${pick(ADJECTIVES, rng)}\nThan The Competition`,
  // 39. Delivering X through Y
  (rng) =>
    `Delivering ${pick(NOUNS, rng)}\nThrough\n${pick(ADJECTIVES, rng)} ${pick(NOUNS, rng)}`,
  // 40. Your X, Our Y
  (rng) =>
    `Your ${pick(NOUNS, rng)},\nOur ${pick(NOUNS, rng)},\nOne ${pick(NOUNS, rng)}`,
]

// ── Generator ───────────────────────────────────────────────────────

export function generateProceduralSlogan(seed: number): SloganData {
  // Try a few seeds to avoid same-root repetition (e.g. "Synergy Synergizing")
  for (let attempt = 0; attempt < 5; attempt++) {
    const rng = seededRandom(seed + attempt * 997)
    const slogan = pick(SLOGAN_TEMPLATES, rng)(rng)
    const subtitle = pick(SUBTITLE_TEMPLATES, rng)(rng)
    if (!hasRepeatedRoot(slogan)) {
      return { slogan, subtitle }
    }
  }
  // Fallback — use offset seed
  const rng = seededRandom(seed + 4999)
  const slogan = pick(SLOGAN_TEMPLATES, rng)(rng)
  const subtitle = pick(SUBTITLE_TEMPLATES, rng)(rng)
  return { slogan, subtitle }
}
