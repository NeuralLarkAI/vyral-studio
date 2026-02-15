import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Eye, Clock, Heart, Share2, Bookmark, Lightbulb } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsEntry {
  runId: string;
  topic: string;
  postedAt: string;
  views: number;
  avgWatch: number;
  completion: number;
  likes: number;
  shares: number;
  saves: number;
}

interface Learning {
  agent: string;
  insight: string;
  confidence: number;
}

interface RunOption {
  id: string;
  topic: string | null;
  status: string;
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsEntry[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [runs, setRuns] = useState<RunOption[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [formValues, setFormValues] = useState({ views: "", avgWatch: "", completion: "", likes: "", shares: "", saves: "" });

  useEffect(() => {
    apiGet<AnalyticsEntry[]>("/api/analytics")
      .then(setAnalyticsData)
      .catch(() => setAnalyticsData([]));

    apiGet<Learning[]>("/api/analytics/learnings")
      .then(setLearnings)
      .catch(() => setLearnings([]));

    apiGet<RunOption[]>("/api/runs")
      .then((data) => {
        setRuns(data);
        const completed = data.filter(r => r.status === "completed");
        if (completed.length > 0) setSelectedRunId(completed[0].id);
      })
      .catch(() => setRuns([]));
  }, []);

  async function saveMetrics() {
    if (!selectedRunId) {
      toast({ title: "Select a run", description: "Pick a completed run to log metrics for.", variant: "destructive" });
      return;
    }
    try {
      const entry = await apiPost<AnalyticsEntry>("/api/analytics", {
        runId: selectedRunId,
        views: formValues.views,
        avgWatch: formValues.avgWatch,
        completion: formValues.completion,
        likes: formValues.likes,
        shares: formValues.shares,
        saves: formValues.saves,
      });
      setAnalyticsData((prev) => [entry, ...prev]);
      setFormValues({ views: "", avgWatch: "", completion: "", likes: "", shares: "", saves: "" });
      toast({ title: "Metrics saved", description: `Logged metrics for run ${selectedRunId.slice(0, 8)}...` });
    } catch (e: any) {
      toast({ title: "Failed to save", description: e?.message || "Unknown error", variant: "destructive" });
    }
  }

  const completedRuns = runs.filter(r => r.status === "completed");

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-glow-green">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track performance and learn from results</p>
      </div>

      {/* Metrics Input */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground mb-3">Log Metrics for Run</h2>
        <div className="mb-3">
          <Label className="text-[10px] text-muted-foreground">Select Run</Label>
          <Select value={selectedRunId} onValueChange={setSelectedRunId}>
            <SelectTrigger className="mt-1 bg-secondary border-border font-mono text-xs">
              <SelectValue placeholder="Select a completed run..." />
            </SelectTrigger>
            <SelectContent>
              {completedRuns.length === 0 && (
                <SelectItem value="none" disabled>No completed runs yet</SelectItem>
              )}
              {completedRuns.map(r => (
                <SelectItem key={r.id} value={r.id} className="font-mono text-xs">
                  {r.topic || r.id.slice(0, 8)} — {r.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Views", icon: Eye, key: "views", placeholder: "0" },
            { label: "Avg Watch", icon: Clock, key: "avgWatch", placeholder: "0s" },
            { label: "Completion %", icon: TrendingUp, key: "completion", placeholder: "0%" },
            { label: "Likes", icon: Heart, key: "likes", placeholder: "0" },
            { label: "Shares", icon: Share2, key: "shares", placeholder: "0" },
            { label: "Saves", icon: Bookmark, key: "saves", placeholder: "0" },
          ].map(m => (
            <div key={m.label}>
              <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                <m.icon className="h-3 w-3" /> {m.label}
              </Label>
              <Input
                className="mt-1 bg-secondary border-border font-mono text-xs h-8"
                placeholder={m.placeholder}
                value={formValues[m.key as keyof typeof formValues]}
                onChange={(e) => setFormValues(prev => ({ ...prev, [m.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex items-end">
            <Button size="sm" className="w-full font-mono text-xs bg-primary text-primary-foreground" onClick={saveMetrics}>
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {["Topic", "Posted", "Views", "Avg Watch", "Completion", "Likes", "Shares", "Saves"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analyticsData.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground font-mono">
                  No analytics yet. Complete a run and log its TikTok metrics above.
                </td>
              </tr>
            )}
            {analyticsData.map((row, i) => (
              <motion.tr key={`${row.runId}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border hover:bg-secondary/20">
                <td className="px-4 py-3 text-xs text-foreground font-medium">{row.topic}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{row.postedAt}</td>
                <td className="px-4 py-3 text-xs font-mono text-primary">{row.views >= 1000 ? `${(row.views / 1000).toFixed(1)}K` : row.views}</td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">{row.avgWatch}s</td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">{row.completion}%</td>
                <td className="px-4 py-3 text-xs font-mono text-neon-red">{row.likes >= 1000 ? `${(row.likes / 1000).toFixed(1)}K` : row.likes}</td>
                <td className="px-4 py-3 text-xs font-mono text-neon-cyan">{row.shares >= 1000 ? `${(row.shares / 1000).toFixed(1)}K` : row.shares}</td>
                <td className="px-4 py-3 text-xs font-mono text-neon-yellow">{row.saves >= 1000 ? `${(row.saves / 1000).toFixed(1)}K` : row.saves}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground mb-3">Trend Lines</h2>
        <div className="h-48 flex items-center justify-center border border-border rounded-lg bg-secondary/20">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs font-mono text-muted-foreground">
              {analyticsData.length > 0 ? `${analyticsData.length} data point(s) — chart coming soon` : "Log metrics to see trends"}
            </p>
          </div>
        </div>
      </div>

      {/* Learnings */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" /> Agent Learnings
        </h2>
        <div className="space-y-3">
          {learnings.length === 0 && (
            <p className="text-xs text-muted-foreground font-mono">Learnings will appear here from agent performance data.</p>
          )}
          {learnings.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-3 rounded-lg border border-border bg-secondary/30 flex items-start gap-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">{l.agent}</span>
              <div className="flex-1">
                <p className="text-xs text-foreground">{l.insight}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">Confidence: {(l.confidence * 100).toFixed(0)}%</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
