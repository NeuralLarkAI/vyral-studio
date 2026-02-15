import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Eye, Download, Copy, Upload, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HookVariants } from "@/components/HookVariants";
import { ScorePanel } from "@/components/ScorePanel";
import { QueuePanel } from "@/components/QueuePanel";
import { MessageStream } from "@/components/MessageStream";
import { apiGet, apiPost, API_BASE } from "@/lib/api";
import { useBackendSocket } from "@/hooks/useBackendSocket";
import { useToast } from "@/hooks/use-toast";

type Agent = {
  name: string;
  role?: string;
  state: string;
  thoughts?: { now?: string };
};

type Message = {
  id: string;
  runId?: string;
  ts: string;
  from: string;
  to?: string;
  type?: string;
  text: string;
};

type Run = {
  id: string;
  createdAt: string;
  niche: string;
  mode: string;
  topic: string | null;
  preview: boolean;
  status: string;
  retentionScore?: number | null;
  viralityScore?: number | null;
};

type QueueStatus = any; // backend can shape this later; keep flexible

export default function Dashboard() {
  const { toast } = useToast();

  // Form state
  const [previewMode, setPreviewMode] = useState(true);
  const [template, setTemplate] = useState("history");
  const [niche, setNiche] = useState("History");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [topic, setTopic] = useState("");

  // Backend-driven state
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [queues, setQueues] = useState<QueueStatus | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Derived: active run + scores (fallbacks keep UI stable)
  const activeRun = useMemo(
    () => runs.find((r) => r.id === activeRunId) || runs[0] || null,
    [runs, activeRunId]
  );

  const retentionScore = activeRun?.retentionScore ?? 0;
  const viralityScore = activeRun?.viralityScore ?? 0;

  // Initial loads
  useEffect(() => {
    (async () => {
      try {
        await apiGet("/api/ops/health");
        setHealthOk(true);
      } catch {
        setHealthOk(false);
      }
    })();

    apiGet<Agent[]>("/api/agents")
      .then(setAgents)
      .catch(() => setAgents([]));

    apiGet<Run[]>("/api/runs")
      .then(setRuns)
      .catch(() => setRuns([]));

    apiGet<Message[]>("/api/messages")
      .then(setMessages)
      .catch(() => setMessages([]));

    // If your backend doesn’t have /api/ops/queue yet, this will just fail gracefully.
    apiGet<QueueStatus>("/api/ops/queue")
      .then(setQueues)
      .catch(() => setQueues(null));
  }, []);

  // Live updates via WS
  useBackendSocket((event) => {
    if (!event?.kind) return;

    if (event.kind === "agent_state") {
      const { name, state, thoughts } = event.payload || {};
      setAgents((prev) =>
        prev.map((a) => (a.name === name ? { ...a, state, thoughts } : a))
      );
    }

    if (event.kind === "message") {
      setMessages((prev) => [event.payload as Message, ...prev]);
    }

    if (event.kind === "run_update") {
      const updated = event.payload as Run;
      setRuns((prev) => {
        const idx = prev.findIndex((r) => r.id === updated.id);
        if (idx === -1) return [updated, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updated };
        return copy;
      });
    }

    if (event.kind === "queue_update") {
      setQueues(event.payload);
    }
  });

  async function createRun(preview: boolean) {
    try {
      const body = {
        niche: niche || "History/Facts",
        mode,
        topic: mode === "manual" ? (topic || null) : (topic || null),
        preview,
        template, // backend can ignore for now
      };

      const resp = await apiPost<{ runId: string }>("/api/runs", body);
      setActiveRunId(resp.runId);

      // Pull fresh messages for that run (optional)
      apiGet<Message[]>(`/api/messages?runId=${resp.runId}`)
        .then((ms) => setMessages(ms))
        .catch(() => {});

      toast({
        title: preview ? "Preview run started" : "Final run started",
        description: `Run ID: ${resp.runId}`,
      });
    } catch (e: any) {
      toast({
        title: "Failed to start run",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }

  const topAgents = agents.slice(0, 6);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-glow-green">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and monitor content generation runs
          </p>
          <p className="text-[10px] font-mono mt-2 text-muted-foreground">
            Backend: {API_BASE}{" "}
            <span
              className={
                healthOk === null
                  ? "opacity-60"
                  : healthOk
                  ? "text-emerald-400"
                  : "text-red-400"
              }
            >
              {healthOk === null ? "checking…" : healthOk ? "connected" : "offline"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={() => {
              toast({
                title: "Scheduler",
                description:
                  "Hook this button to POST /api/schedule when backend is ready.",
              });
            }}
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" /> Run Daily Schedule Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Run Config */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              New Run
            </h2>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="mt-1 bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="history">History/Facts Daily</SelectItem>
                    <SelectItem value="science">Science Explainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Niche</Label>
                  <Input
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mode</Label>
                  <Select
                    value={mode}
                    onValueChange={(v) => setMode(v as any)}
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Topic (optional)
                </Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Leave empty for auto-research"
                  className="mt-1 bg-secondary border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Target Length
                  </Label>
                  <Input
                    defaultValue="30s"
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Animation
                  </Label>
                  <Select defaultValue="dark-neon">
                    <SelectTrigger className="mt-1 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark-neon">Dark Neon Kinetic</SelectItem>
                      <SelectItem value="minimal">Minimal Clean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs text-muted-foreground">
                  Preview Mode
                </Label>
                <Switch checked={previewMode} onCheckedChange={setPreviewMode} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 font-mono text-xs"
                  variant="outline"
                  onClick={() => createRun(true)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> Generate (Preview)
                </Button>
                <Button
                  className="flex-1 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => createRun(false)}
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" /> Generate (Final)
                </Button>
              </div>
            </div>
          </div>

          {/* Hooks */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Hook Variants
            </h2>
            <HookVariants />
          </div>

          {/* Upload Checklist */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Upload Checklist
            </h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              {[
                "Download final MP4",
                "Download thumbnail PNG",
                "Copy caption text",
                "Copy hashtags",
                "Open TikTok Studio",
                "Upload video",
                "Set cover image",
                "Paste caption",
                "Schedule/Publish",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-border flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full font-mono text-xs"
              onClick={() => window.open("https://www.tiktok.com/upload", "_blank")}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Open TikTok Upload
            </Button>
          </div>
        </motion.div>

        {/* Center: Preview + Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Video Preview */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="aspect-[9/16] max-h-[500px] bg-secondary flex items-center justify-center relative">
              <div className="absolute inset-0 gradient-neon" />
              <div className="text-center z-10">
                <Play className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs font-mono text-muted-foreground">
                  {activeRun
                    ? `Run ${activeRun.status} • ${activeRun.preview ? "Preview" : "Final"}`
                    : "Preview will appear here"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {activeRun?.preview ? "720×1280 • CRF 24 • Preview" : "1080×1920 • CRF 18–20 • Final"}
                </p>
              </div>
            </div>
            <div className="p-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-mono text-xs"
                onClick={() => toast({ title: "MP4", description: "Download will be available once the render is complete." })}
              >
                <Download className="h-3 w-3 mr-1" /> MP4
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-mono text-xs"
                onClick={() => toast({ title: "Thumbnail", description: "Download will be available once the render is complete." })}
              >
                <Download className="h-3 w-3 mr-1" /> Thumb
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-mono text-xs"
                onClick={() => toast({ title: "ZIP", description: "Wire to backend ZIP export URL when available." })}
              >
                <Download className="h-3 w-3 mr-1" /> ZIP
              </Button>
            </div>
          </div>

          {/* Scores */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Scores
            </h2>
            <ScorePanel
              retentionScore={retentionScore || 0}
              viralityScore={viralityScore || 0}
              reasons={[
                activeRun ? `Status: ${activeRun.status}` : "No run yet",
                activeRun?.topic ? `Topic: ${activeRun.topic}` : "Topic: (auto)",
              ]}
            />
          </div>

          {/* Caption & Hashtags */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Caption
            </h2>
            <div className="p-3 rounded bg-secondary text-xs text-muted-foreground font-mono mb-2">
              {activeRun?.topic
                ? `Topic: ${activeRun.topic} — (caption will be loaded from backend artifacts next)`
                : "Caption will appear here once the backend outputs metadata."}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs w-full"
              onClick={() => navigator.clipboard.writeText("caption placeholder")}
            >
              <Copy className="h-3 w-3 mr-1" /> Copy Caption
            </Button>
            <div className="mt-3 flex flex-wrap gap-1">
              {["#history", "#facts", "#fyp"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Live Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Agent Status */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Agent Status
            </h2>
            <div className="space-y-1.5">
              {topAgents.map((agent) => (
                <div key={agent.name} className="flex items-center gap-2 py-1">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      agent.state === "Idle"
                        ? "bg-muted-foreground/30"
                        : agent.state === "Researching" || agent.state === "Working" || agent.state === "Rendering"
                        ? "bg-info animate-glow-pulse"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  <span className="text-xs font-mono text-foreground w-28">
                    {agent.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {agent.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Messages */}
          <div className="p-5 rounded-xl border border-border bg-card max-h-[400px] overflow-y-auto">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Live Messages
            </h2>
            <MessageStream messages={messages} />
          </div>

          {/* Queue */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Queue Status
            </h2>
            <QueuePanel queues={queues ?? {}} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
