// Mock data for the VYRAL Control Tower application

export type AgentState = 'Idle' | 'Researching' | 'Writing' | 'Rendering' | 'QA' | 'Blocked' | 'Debating';

export interface Agent {
  id: string;
  name: string;
  role: string;
  state: AgentState;
  trustScore: number;
  currentThought: string;
  soulSummary: string;
  goalsSummary: string;
  kpis: {
    selectionRate: number;
    upliftContribution: number;
    failureRate: number;
    avgLatency: number;
  };
}

export interface RunRecord {
  id: string;
  createdAt: string;
  template: string;
  niche: string;
  topic: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'blocked';
  retentionScore: number;
  viralityScore: number;
  duration: number;
  costEstimate: number;
  mode: 'preview' | 'final';
}

export interface AgentMessage {
  id: string;
  runId: string;
  ts: string;
  fromAgent: string;
  toAgent: string;
  type: 'info' | 'decision' | 'warning' | 'artifact' | 'debate';
  content: string;
}

export interface QueueStatus {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export const mockAgents: Agent[] = [
  { id: '1', name: 'TrendScout', role: 'Trend Research', state: 'Researching', trustScore: 0.87, currentThought: 'Analyzing rising search trends for "ancient civilizations" — Google Trends spike +340% last 7d', soulSummary: 'Curious, data-driven, thrives on novelty', goalsSummary: 'Find viral-worthy topics with 48h momentum', kpis: { selectionRate: 0.72, upliftContribution: 0.15, failureRate: 0.03, avgLatency: 4.2 } },
  { id: '2', name: 'NicheCurator', role: 'Niche Filtering', state: 'Idle', trustScore: 0.91, currentThought: 'Waiting for TrendScout candidates to filter against niche glossary', soulSummary: 'Precise, conservative, brand-safe guardian', goalsSummary: 'Ensure topic fits niche and passes safety checks', kpis: { selectionRate: 0.89, upliftContribution: 0.08, failureRate: 0.01, avgLatency: 1.8 } },
  { id: '3', name: 'HookLab', role: 'Hook Generation', state: 'Idle', trustScore: 0.84, currentThought: 'Ready to generate 3 hook variants once topic is confirmed', soulSummary: 'Creative, provocative, attention-obsessed', goalsSummary: 'Generate hooks that stop the scroll in 0.5s', kpis: { selectionRate: 0.65, upliftContribution: 0.22, failureRate: 0.05, avgLatency: 3.1 } },
  { id: '4', name: 'Scriptwriter', role: 'Script Writing', state: 'Idle', trustScore: 0.88, currentThought: 'Awaiting hook selection to begin full script composition', soulSummary: 'Rhythmic, concise, punchline-driven storyteller', goalsSummary: 'Write scripts that maintain 90%+ retention', kpis: { selectionRate: 0.78, upliftContribution: 0.18, failureRate: 0.04, avgLatency: 6.5 } },
  { id: '5', name: 'FactChecker', role: 'Fact Verification', state: 'Idle', trustScore: 0.95, currentThought: 'No script to verify yet', soulSummary: 'Skeptical, thorough, zero-tolerance for misinformation', goalsSummary: 'Ensure all claims are verifiable and conservatively phrased', kpis: { selectionRate: 0.95, upliftContribution: 0.05, failureRate: 0.0, avgLatency: 2.4 } },
  { id: '6', name: 'VisualDirector', role: 'Visual Design', state: 'Idle', trustScore: 0.82, currentThought: 'Preparing kinetic typography presets for Dark Neon theme', soulSummary: 'Aesthetic-obsessed, motion-first visual thinker', goalsSummary: 'Create visually stunning scenes that enhance retention', kpis: { selectionRate: 0.70, upliftContribution: 0.20, failureRate: 0.06, avgLatency: 8.3 } },
  { id: '7', name: 'AudioEngineer', role: 'Audio Production', state: 'Idle', trustScore: 0.90, currentThought: 'TTS engine ready, loudnorm filters configured', soulSummary: 'Detail-oriented, clarity-focused audio perfectionist', goalsSummary: 'Produce crystal-clear narration with consistent loudness', kpis: { selectionRate: 0.88, upliftContribution: 0.10, failureRate: 0.02, avgLatency: 5.1 } },
  { id: '8', name: 'SubtitleSmith', role: 'Subtitle Generation', state: 'Idle', trustScore: 0.93, currentThought: 'Safe margin templates loaded for TikTok UI avoidance', soulSummary: 'Typography nerd, readability champion', goalsSummary: 'Generate perfectly timed, readable burned-in subtitles', kpis: { selectionRate: 0.92, upliftContribution: 0.07, failureRate: 0.01, avgLatency: 3.0 } },
  { id: '9', name: 'RenderBot', role: 'Video Rendering', state: 'Idle', trustScore: 0.86, currentThought: 'FFmpeg pipeline ready, CRF 24 for preview mode', soulSummary: 'Mechanical, reliable, quality-obsessed encoder', goalsSummary: 'Produce flawless MP4 output matching all specs', kpis: { selectionRate: 0.85, upliftContribution: 0.12, failureRate: 0.08, avgLatency: 45.2 } },
  { id: '10', name: 'QAProducer', role: 'Quality Assurance', state: 'Idle', trustScore: 0.94, currentThought: 'Quality gates configured: hook timing, word count, duration match', soulSummary: 'Perfectionist gatekeeper, ships nothing broken', goalsSummary: 'Ensure every output passes all quality gates before delivery', kpis: { selectionRate: 0.94, upliftContribution: 0.09, failureRate: 0.01, avgLatency: 2.0 } },
];

export const mockMessages: AgentMessage[] = [
  { id: '1', runId: 'run-001', ts: '14:32:01', fromAgent: 'TrendScout', toAgent: 'NicheCurator', type: 'info', content: 'Found 5 trending candidates in "History/Facts" niche. Top: "Lost City of Z" (+340% Google Trends)' },
  { id: '2', runId: 'run-001', ts: '14:32:04', fromAgent: 'NicheCurator', toAgent: 'HookLab', type: 'decision', content: 'Approved "Lost City of Z" — passes glossary, no banned terms, high novelty score' },
  { id: '3', runId: 'run-001', ts: '14:32:08', fromAgent: 'HookLab', toAgent: 'Scriptwriter', type: 'artifact', content: 'Generated 3 hooks: A) "This city shouldn\'t exist" (score: 87) B) "Scientists can\'t explain this" (score: 82) C) "They found something impossible" (score: 79)' },
  { id: '4', runId: 'run-001', ts: '14:32:12', fromAgent: 'Scriptwriter', toAgent: 'FactChecker', type: 'artifact', content: 'Script draft complete: 28s, 112 words, 6 beats. Using Hook A. Sending for fact check...' },
  { id: '5', runId: 'run-001', ts: '14:32:15', fromAgent: 'FactChecker', toAgent: 'Scriptwriter', type: 'warning', content: 'Beat 3 claim "never found by modern science" is misleading — rephrasing to "remained hidden for centuries"' },
  { id: '6', runId: 'run-001', ts: '14:32:18', fromAgent: 'VisualDirector', toAgent: 'RenderBot', type: 'info', content: 'Scene layout ready: 6 beats, Dark Neon preset, kinetic pop-in transitions, keyword emphasis on "impossible"' },
  { id: '7', runId: 'run-001', ts: '14:32:22', fromAgent: 'AudioEngineer', toAgent: 'SubtitleSmith', type: 'artifact', content: 'TTS generated: 27.4s duration, loudnorm applied, peak -14 LUFS' },
  { id: '8', runId: 'run-001', ts: '14:32:25', fromAgent: 'SubtitleSmith', toAgent: 'RenderBot', type: 'artifact', content: 'SRT ready: 42 subtitle entries, max 2 lines, safe margin verified' },
];

export const mockRuns: RunRecord[] = [
  { id: 'run-001', createdAt: '2026-02-14 14:30', template: 'History/Facts Daily', niche: 'History', topic: 'Lost City of Z', status: 'running', retentionScore: 0, viralityScore: 0, duration: 0, costEstimate: 0.12, mode: 'preview' },
  { id: 'run-002', createdAt: '2026-02-13 09:00', template: 'History/Facts Daily', niche: 'History', topic: 'Voynich Manuscript', status: 'completed', retentionScore: 84, viralityScore: 78, duration: 30, costEstimate: 0.18, mode: 'final' },
  { id: 'run-003', createdAt: '2026-02-12 09:00', template: 'History/Facts Daily', niche: 'Science', topic: 'Dark Matter Discovery', status: 'completed', retentionScore: 91, viralityScore: 85, duration: 28, costEstimate: 0.15, mode: 'final' },
  { id: 'run-004', createdAt: '2026-02-11 09:00', template: 'History/Facts Daily', niche: 'History', topic: 'Antikythera Mechanism', status: 'completed', retentionScore: 76, viralityScore: 72, duration: 32, costEstimate: 0.20, mode: 'final' },
  { id: 'run-005', createdAt: '2026-02-10 09:00', template: 'History/Facts Daily', niche: 'History', topic: 'Library of Alexandria', status: 'failed', retentionScore: 0, viralityScore: 0, duration: 0, costEstimate: 0.08, mode: 'preview' },
];

export const mockQueues: QueueStatus[] = [
  { name: 'research', waiting: 0, active: 1, completed: 47, failed: 2 },
  { name: 'writing', waiting: 1, active: 0, completed: 45, failed: 1 },
  { name: 'audio', waiting: 0, active: 0, completed: 44, failed: 0 },
  { name: 'subtitles', waiting: 0, active: 0, completed: 44, failed: 0 },
  { name: 'render', waiting: 0, active: 0, completed: 42, failed: 3 },
  { name: 'qa', waiting: 0, active: 0, completed: 42, failed: 0 },
];
