import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import crypto from "crypto";

dotenv.config();

const PORT = process.env.PORT || 8787;

const app = express();
app.use(cors());
app.use(express.json());

// In-memory placeholders (we'll replace with SQLite next)
let agents = [
  { id: '1', name: "TrendScout", role: "Trend Research", state: "Idle", trustScore: 0.87, currentThought: "Waiting for next run", soulSummary: "Curious, data-driven, thrives on novelty", goalsSummary: "Find viral-worthy topics with 48h momentum", kpis: { selectionRate: 0.72, upliftContribution: 0.15, failureRate: 0.03, avgLatency: 4.2 } },
  { id: '2', name: "NicheCurator", role: "Niche Filtering", state: "Idle", trustScore: 0.91, currentThought: "Waiting for TrendScout candidates", soulSummary: "Precise, conservative, brand-safe guardian", goalsSummary: "Ensure topic fits niche and passes safety checks", kpis: { selectionRate: 0.89, upliftContribution: 0.08, failureRate: 0.01, avgLatency: 1.8 } },
  { id: '3', name: "HookLab", role: "Hook Generation", state: "Idle", trustScore: 0.84, currentThought: "Ready to generate hook variants", soulSummary: "Creative, provocative, attention-obsessed", goalsSummary: "Generate hooks that stop the scroll in 0.5s", kpis: { selectionRate: 0.65, upliftContribution: 0.22, failureRate: 0.05, avgLatency: 3.1 } },
  { id: '4', name: "Scriptwriter", role: "Script Writing", state: "Idle", trustScore: 0.88, currentThought: "Awaiting hook selection", soulSummary: "Rhythmic, concise, punchline-driven storyteller", goalsSummary: "Write scripts that maintain 90%+ retention", kpis: { selectionRate: 0.78, upliftContribution: 0.18, failureRate: 0.04, avgLatency: 6.5 } },
  { id: '5', name: "FactChecker", role: "Fact Verification", state: "Idle", trustScore: 0.95, currentThought: "No script to verify yet", soulSummary: "Skeptical, thorough, zero-tolerance for misinformation", goalsSummary: "Ensure all claims are verifiable and conservatively phrased", kpis: { selectionRate: 0.95, upliftContribution: 0.05, failureRate: 0.0, avgLatency: 2.4 } },
  { id: '6', name: "VisualDirector", role: "Visual Design", state: "Idle", trustScore: 0.82, currentThought: "Preparing kinetic typography presets", soulSummary: "Aesthetic-obsessed, motion-first visual thinker", goalsSummary: "Create visually stunning scenes that enhance retention", kpis: { selectionRate: 0.70, upliftContribution: 0.20, failureRate: 0.06, avgLatency: 8.3 } },
  { id: '7', name: "AudioEngineer", role: "Audio Production", state: "Idle", trustScore: 0.90, currentThought: "TTS engine ready, loudnorm filters configured", soulSummary: "Detail-oriented, clarity-focused audio perfectionist", goalsSummary: "Produce crystal-clear narration with consistent loudness", kpis: { selectionRate: 0.88, upliftContribution: 0.10, failureRate: 0.02, avgLatency: 5.1 } },
  { id: '8', name: "SubtitleSmith", role: "Subtitle Generation", state: "Idle", trustScore: 0.93, currentThought: "Safe margin templates loaded", soulSummary: "Typography nerd, readability champion", goalsSummary: "Generate perfectly timed, readable burned-in subtitles", kpis: { selectionRate: 0.92, upliftContribution: 0.07, failureRate: 0.01, avgLatency: 3.0 } },
  { id: '9', name: "RenderBot", role: "Video Rendering", state: "Idle", trustScore: 0.86, currentThought: "FFmpeg pipeline ready", soulSummary: "Mechanical, reliable, quality-obsessed encoder", goalsSummary: "Produce flawless MP4 output matching all specs", kpis: { selectionRate: 0.85, upliftContribution: 0.12, failureRate: 0.08, avgLatency: 45.2 } },
  { id: '10', name: "QAProducer", role: "Quality Assurance", state: "Idle", trustScore: 0.94, currentThought: "Quality gates configured", soulSummary: "Perfectionist gatekeeper, ships nothing broken", goalsSummary: "Ensure every output passes all quality gates before delivery", kpis: { selectionRate: 0.94, upliftContribution: 0.09, failureRate: 0.01, avgLatency: 2.0 } }
];

let runs = [];
let messages = [];
let analytics = [];

// Health — returns detailed health checks
app.get("/api/ops/health", (req, res) => {
  const checks = [
    { name: "Backend Server", status: "ok", detail: `Running on port ${PORT}` },
    { name: "WebSocket", status: wss && wss.clients ? "ok" : "error", detail: `${wss?.clients?.size ?? 0} client(s) connected` },
    { name: "In-Memory Store", status: "ok", detail: `${agents.length} agents, ${runs.length} runs, ${messages.length} messages` },
    { name: "FFmpeg", status: "warn", detail: "Not yet integrated — using simulation" },
    { name: "OpenAI", status: "warn", detail: "Not yet integrated — using simulation" },
    { name: "Redis/Queue", status: "warn", detail: "No Redis — using in-process queue" },
    { name: "Worker: research", status: "ok", detail: `Agent state: ${agents.find(a => a.name === 'TrendScout')?.state}` },
    { name: "Worker: render", status: "ok", detail: `Agent state: ${agents.find(a => a.name === 'RenderBot')?.state}` },
  ];
  res.json({ ok: true, checks, service: "vyral-backend", port: PORT, time: new Date().toISOString() });
});

// Agents
app.get("/api/agents", (req, res) => res.json(agents));

// Runs
app.get("/api/runs", (req, res) => res.json(runs));
app.get("/api/runs/:runId", (req, res) => {
  const run = runs.find(r => r.id === req.params.runId);
  if (!run) return res.status(404).json({ error: "Run not found" });
  res.json(run);
});

// Messages
app.get("/api/messages", (req, res) => {
  const runId = req.query.runId;
  const out = runId ? messages.filter(m => m.runId === runId) : messages;
  res.json(out);
});

// Queue status
app.get("/api/ops/queue", (req, res) => {
  const queued = runs.filter(r => r.status === "queued").length;
  const running = runs.filter(r => r.status === "running").length;
  const done = runs.filter(r => r.status === "completed").length;
  const failed = runs.filter(r => r.status === "failed").length;

  const queues = [
    { name: 'research', waiting: 0, active: agents.find(a => a.name === 'TrendScout')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'writing', waiting: 0, active: agents.find(a => a.name === 'Scriptwriter')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'audio', waiting: 0, active: agents.find(a => a.name === 'AudioEngineer')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'subtitles', waiting: 0, active: agents.find(a => a.name === 'SubtitleSmith')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'render', waiting: 0, active: agents.find(a => a.name === 'RenderBot')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'qa', waiting: queued, active: running, completed: done, failed }
  ];

  res.json(queues);
});

// Analytics
app.get("/api/analytics", (req, res) => res.json(analytics));

app.post("/api/analytics", (req, res) => {
  const { runId, views, avgWatch, completion, likes, shares, saves } = req.body || {};
  const run = runs.find(r => r.id === runId);
  if (!run) return res.status(404).json({ error: "Run not found" });

  const entry = {
    runId,
    topic: run.topic || "Unknown",
    postedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: Number(views) || 0,
    avgWatch: Number(avgWatch) || 0,
    completion: Number(completion) || 0,
    likes: Number(likes) || 0,
    shares: Number(shares) || 0,
    saves: Number(saves) || 0,
  };
  analytics.unshift(entry);
  res.json(entry);
});

// Learnings (derived from agent KPIs)
app.get("/api/analytics/learnings", (req, res) => {
  const learnings = agents
    .filter(a => a.kpis.selectionRate > 0.5)
    .slice(0, 5)
    .map(a => ({
      agent: a.name,
      insight: `${a.name} has a ${(a.kpis.selectionRate * 100).toFixed(0)}% selection rate with ${(a.kpis.upliftContribution * 100).toFixed(0)}% uplift contribution`,
      confidence: a.trustScore,
    }));
  res.json(learnings);
});

// Create run
app.post("/api/runs", (req, res) => {
  const { niche = "History/Facts", mode = "auto", topic = null, preview = true, template = "History/Facts Daily" } = req.body || {};
  const id = crypto.randomUUID();
  const run = {
    id,
    createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    niche,
    mode: preview ? "preview" : "final",
    topic: topic || null,
    template,
    preview,
    status: "queued",
    retentionScore: 0,
    viralityScore: 0,
    duration: 0,
    costEstimate: +(Math.random() * 0.15 + 0.08).toFixed(2),
  };
  runs.unshift(run);

  pushMessage({ runId: id, from: "SYSTEM", to: "ALL", type: "info", text: `Run queued (${preview ? "preview" : "final"})` });
  broadcast({ kind: "run_update", payload: run });
  simulateRun(id);

  res.json({ runId: id });
});

// Start HTTP + WebSocket
const server = app.listen(PORT, () => console.log(`VYRAL backend running on http://localhost:${PORT}`));
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(event) {
  const data = JSON.stringify(event);
  for (const client of wss.clients) if (client.readyState === 1) client.send(data);
}

function pushMessage({ runId, from, to, type, text }) {
  const ts = new Date().toTimeString().slice(0, 8);
  const msg = {
    id: crypto.randomUUID(),
    runId,
    ts,
    fromAgent: from,
    toAgent: to,
    type,
    content: text
  };
  messages.unshift(msg);
  broadcast({ kind: "message", payload: msg });
}

function setAgentState(name, state, thought) {
  const a = agents.find(x => x.name === name);
  if (!a) return;
  a.state = state;
  if (thought) a.currentThought = thought;
  broadcast({ kind: "agent_state", payload: { name, state, currentThought: thought || a.currentThought } });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const topics = [
  "Lost City of Z", "Antikythera Mechanism", "Voynich Manuscript",
  "Dark Matter Discovery", "Library of Alexandria", "Nazca Lines",
  "Dyatlov Pass Incident", "Fermi Paradox", "Göbekli Tepe",
];

async function simulateRun(runId) {
  const run = runs.find(r => r.id === runId);
  if (!run) return;

  const startTime = Date.now();

  // Pick a topic if none was provided
  if (!run.topic) {
    run.topic = topics[Math.floor(Math.random() * topics.length)];
  }

  run.status = "running";
  broadcast({ kind: "run_update", payload: run });

  setAgentState("TrendScout", "Researching", `Scanning signals for "${run.topic}"...`);
  pushMessage({ runId, from: "TrendScout", to: "NicheCurator", type: "info", text: `Found trending topic: "${run.topic}". Sending for filtering.` });
  await sleep(700);

  setAgentState("NicheCurator", "Working", "Filtering topics...");
  setAgentState("TrendScout", "Idle", "Waiting for next run");
  pushMessage({ runId, from: "NicheCurator", to: "HookLab", type: "decide", text: `Approved topic: ${run.topic} (high novelty).` });
  await sleep(700);

  setAgentState("HookLab", "Working", "Generating hooks...");
  setAgentState("NicheCurator", "Idle", "Waiting for TrendScout candidates");
  pushMessage({ runId, from: "HookLab", to: "Scriptwriter", type: "artifact", text: "3 hooks generated. Recommending Hook A." });
  await sleep(700);

  setAgentState("Scriptwriter", "Writing", "Drafting 30s script...");
  setAgentState("HookLab", "Idle", "Ready to generate hook variants");
  pushMessage({ runId, from: "Scriptwriter", to: "FactChecker", type: "artifact", text: "Draft complete. Please fact-check." });
  await sleep(700);

  setAgentState("FactChecker", "QA", "Conservatizing claims...");
  setAgentState("Scriptwriter", "Idle", "Awaiting hook selection");
  pushMessage({ runId, from: "FactChecker", to: "VisualDirector", type: "info", text: "Checked script ready for scenes." });
  await sleep(700);

  setAgentState("VisualDirector", "Working", "Planning kinetic scenes...");
  setAgentState("FactChecker", "Idle", "No script to verify yet");
  await sleep(700);

  setAgentState("AudioEngineer", "Working", "Generating TTS...");
  setAgentState("VisualDirector", "Idle", "Preparing kinetic typography presets");
  pushMessage({ runId, from: "AudioEngineer", to: "SubtitleSmith", type: "artifact", text: "TTS generated: 27.4s duration, loudnorm applied." });
  await sleep(700);

  setAgentState("SubtitleSmith", "Working", "Making SRT...");
  setAgentState("AudioEngineer", "Idle", "TTS engine ready, loudnorm filters configured");
  pushMessage({ runId, from: "SubtitleSmith", to: "RenderBot", type: "artifact", text: "SRT ready: 42 subtitle entries, safe margin verified." });
  await sleep(700);

  setAgentState("RenderBot", "Rendering", "FFmpeg render (simulated)...");
  setAgentState("SubtitleSmith", "Idle", "Safe margin templates loaded");
  await sleep(1200);

  setAgentState("QAProducer", "QA", "QA checks...");
  setAgentState("RenderBot", "Idle", "FFmpeg pipeline ready");
  await sleep(600);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  run.status = "completed";
  run.retentionScore = Math.floor(Math.random() * 20 + 75);
  run.viralityScore = Math.floor(Math.random() * 20 + 68);
  run.duration = Number(elapsed);
  broadcast({ kind: "run_update", payload: run });

  for (const a of agents) setAgentState(a.name, "Idle", "Waiting for next run");
  pushMessage({ runId, from: "SYSTEM", to: "ALL", type: "info", text: `Run complete — Retention: ${run.retentionScore}, Virality: ${run.viralityScore}. Next: add SQLite + OpenAI + FFmpeg.` });

  // Broadcast updated queue status
  broadcast({ kind: "queue_update", payload: buildQueueStatus() });
}

function buildQueueStatus() {
  const done = runs.filter(r => r.status === "completed").length;
  const failed = runs.filter(r => r.status === "failed").length;
  const queued = runs.filter(r => r.status === "queued").length;
  const running = runs.filter(r => r.status === "running").length;
  return [
    { name: 'research', waiting: 0, active: agents.find(a => a.name === 'TrendScout')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'writing', waiting: 0, active: agents.find(a => a.name === 'Scriptwriter')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'audio', waiting: 0, active: agents.find(a => a.name === 'AudioEngineer')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'subtitles', waiting: 0, active: agents.find(a => a.name === 'SubtitleSmith')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'render', waiting: 0, active: agents.find(a => a.name === 'RenderBot')?.state !== 'Idle' ? 1 : 0, completed: done, failed: 0 },
    { name: 'qa', waiting: queued, active: running, completed: done, failed }
  ];
}
