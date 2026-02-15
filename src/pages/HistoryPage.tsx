import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Eye } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useBackendSocket } from "@/hooks/useBackendSocket";

interface RunRecord {
  id: string;
  createdAt: string;
  template?: string;
  niche: string;
  topic: string | null;
  status: string;
  retentionScore: number;
  viralityScore: number;
  duration: number;
  costEstimate: number;
  mode: string;
}

const statusColors: Record<string, string> = {
  completed: "bg-success/20 text-success border-success/30",
  running: "bg-primary/20 text-primary border-primary/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
  blocked: "bg-warning/20 text-warning border-warning/30",
  queued: "bg-muted text-muted-foreground border-border",
};

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<RunRecord[]>("/api/runs")
      .then((data) => { setRuns(data); setLoading(false); })
      .catch(() => { setRuns([]); setLoading(false); });
  }, []);

  // Live updates via WebSocket
  useBackendSocket((event) => {
    if (event?.kind === "run_update") {
      const updated = event.payload as RunRecord;
      setRuns((prev) => {
        const idx = prev.findIndex((r) => r.id === updated.id);
        if (idx === -1) return [updated, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updated };
        return copy;
      });
    }
  });

  function refreshRuns() {
    setLoading(true);
    apiGet<RunRecord[]>("/api/runs")
      .then((data) => { setRuns(data); setLoading(false); })
      .catch(() => { setRuns([]); setLoading(false); });
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-glow-green">Runs / History</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse and inspect all generation runs</p>
        </div>
        <Button variant="outline" size="sm" className="font-mono text-xs" onClick={refreshRuns}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {["Date", "Template", "Niche", "Topic", "Status", "Retention", "Virality", "Duration", "Cost", "Mode", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && !loading && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-muted-foreground font-mono">
                    No runs yet. Start a run from the Dashboard.
                  </td>
                </tr>
              )}
              {runs.map((run, i) => (
                <motion.tr
                  key={run.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{run.createdAt}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{run.template || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{run.niche}</td>
                  <td className="px-4 py-3 text-xs text-foreground font-medium">{run.topic || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusColors[run.status] || "bg-muted text-muted-foreground border-border"}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-primary">{run.retentionScore || "—"}</td>
                  <td className="px-4 py-3 text-xs font-mono text-accent">{run.viralityScore || "—"}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{run.duration ? `${run.duration}s` : "—"}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">${(run.costEstimate || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${run.mode === 'final' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {run.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Eye className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><RefreshCw className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Download className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
