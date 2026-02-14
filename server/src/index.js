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

// In-memory placeholders (we’ll replace with SQLite next)
let agents = [
  { name: "TrendScout", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "NicheCurator", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "HookLab", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "Scriptwriter", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "FactChecker", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "VisualDirector", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "AudioEngineer", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "SubtitleSmith", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "RenderBot", state: "Idle", thoughts: { now: "Waiting" } },
  { name: "QAProducer", state: "Idle", thoughts: { now: "Waiting" } }
];

let runs = [];
let messages = [];

// Health
app.get("/api/ops/health", (req, res) => {
  res.json({ ok: true, service: "vyral-backend", port: PORT, time: new Date().toISOString() });
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

// Create run
app.post("/api/runs", (req, res) => {
  const { niche = "History/Facts", mode = "auto", topic = null, preview = true } = req.body || {};
  const id = crypto.randomUUID();
  const run = {
    id,
    createdAt: new Date().toISOString(),
    niche,
    mode,
    topic,
    preview,
    status: "QUEUED",
    retentionScore: null,
    viralityScore: null
  };
  runs.unshift(run);

  pushMessage({ runId: id, from: "SYSTEM", to: "ALL", type: "run_created", text: `Run queued (${preview ? "preview" : "final"})` });
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
  const msg = { id: crypto.randomUUID(), runId, ts: new Date().toISOString(), from, to, type, text };
  messages.unshift(msg);
  broadcast({ kind: "message", payload: msg });
}

function setAgentState(name, state, thought) {
  const a = agents.find(x => x.name === name);
  if (!a) return;
  a.state = state;
  if (thought) a.thoughts = { now: thought };
  broadcast({ kind: "agent_state", payload: { name, state, thoughts: a.thoughts } });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function simulateRun(runId) {
  const run = runs.find(r => r.id === runId);
  if (!run) return;

  run.status = "RUNNING";
  broadcast({ kind: "run_update", payload: run });

  setAgentState("TrendScout", "Researching", "Scanning signals...");
  pushMessage({ runId, from: "TrendScout", to: "NicheCurator", type: "info", text: "Found 5 candidates. Sending for filtering." });
  await sleep(700);

  setAgentState("NicheCurator", "Working", "Filtering topics...");
  pushMessage({ runId, from: "NicheCurator", to: "HookLab", type: "decide", text: "Approved topic: Lost City of Z (high novelty)." });
  await sleep(700);

  setAgentState("HookLab", "Working", "Generating hooks...");
  pushMessage({ runId, from: "HookLab", to: "Scriptwriter", type: "artifact", text: "3 hooks generated. Recommending Hook A." });
  await sleep(700);

  setAgentState("Scriptwriter", "Working", "Drafting 30s script...");
  pushMessage({ runId, from: "Scriptwriter", to: "FactChecker", type: "review", text: "Draft complete. Please fact-check." });
  await sleep(700);

  setAgentState("FactChecker", "Working", "Conservatizing claims...");
  pushMessage({ runId, from: "FactChecker", to: "VisualDirector", type: "artifact", text: "Checked script ready for scenes." });
  await sleep(700);

  setAgentState("VisualDirector", "Working", "Planning kinetic scenes...");
  await sleep(700);

  setAgentState("AudioEngineer", "Working", "Generating TTS...");
  await sleep(700);

  setAgentState("SubtitleSmith", "Working", "Making SRT...");
  await sleep(700);

  setAgentState("RenderBot", "Rendering", "FFmpeg render (simulated)...");
  await sleep(1200);

  setAgentState("QAProducer", "Working", "QA checks...");
  await sleep(600);

  run.status = "DONE";
  run.retentionScore = 84;
  run.viralityScore = 78;
  broadcast({ kind: "run_update", payload: run });

  for (const a of agents) setAgentState(a.name, "Idle", "Waiting");
  pushMessage({ runId, from: "SYSTEM", to: "ALL", type: "done", text: "Run complete (SIM backend). Next: add SQLite + OpenAI + FFmpeg real render." });
}
