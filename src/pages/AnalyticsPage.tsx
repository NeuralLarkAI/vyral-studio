import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Eye, Clock, Heart, Share2, Bookmark, Lightbulb } from "lucide-react";

const analyticsData = [
  { runId: "run-003", topic: "Dark Matter Discovery", postedAt: "Feb 12", views: 124500, avgWatch: 18.2, completion: 62, likes: 8900, shares: 2100, saves: 3400 },
  { runId: "run-004", topic: "Antikythera Mechanism", postedAt: "Feb 11", views: 89200, avgWatch: 15.8, completion: 55, likes: 5600, shares: 1200, saves: 2100 },
  { runId: "run-002", topic: "Voynich Manuscript", postedAt: "Feb 13", views: 201000, avgWatch: 22.1, completion: 71, likes: 14200, shares: 4800, saves: 5900 },
];

const learnings = [
  { agent: "HookLab", insight: "Questions outperform statements by 23% in hook retention for History niche", confidence: 0.87 },
  { agent: "Scriptwriter", insight: "Scripts ending with a callback to the hook see 15% higher completion rate", confidence: 0.82 },
  { agent: "TrendScout", insight: "Topics with Wikipedia pageview spikes >200% correlate with 40% higher virality", confidence: 0.79 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-glow-green">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track performance and learn from results</p>
      </div>

      {/* Metrics Input */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground mb-3">Log Metrics for Run</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Views", icon: Eye, placeholder: "0" },
            { label: "Avg Watch", icon: Clock, placeholder: "0s" },
            { label: "Completion %", icon: TrendingUp, placeholder: "0%" },
            { label: "Likes", icon: Heart, placeholder: "0" },
            { label: "Shares", icon: Share2, placeholder: "0" },
            { label: "Saves", icon: Bookmark, placeholder: "0" },
          ].map(m => (
            <div key={m.label}>
              <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                <m.icon className="h-3 w-3" /> {m.label}
              </Label>
              <Input className="mt-1 bg-secondary border-border font-mono text-xs h-8" placeholder={m.placeholder} />
            </div>
          ))}
          <div className="flex items-end">
            <Button size="sm" className="w-full font-mono text-xs bg-primary text-primary-foreground">Save</Button>
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
            {analyticsData.map((row, i) => (
              <motion.tr key={row.runId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border hover:bg-secondary/20">
                <td className="px-4 py-3 text-xs text-foreground font-medium">{row.topic}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{row.postedAt}</td>
                <td className="px-4 py-3 text-xs font-mono text-primary">{(row.views / 1000).toFixed(1)}K</td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">{row.avgWatch}s</td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">{row.completion}%</td>
                <td className="px-4 py-3 text-xs font-mono text-neon-red">{(row.likes / 1000).toFixed(1)}K</td>
                <td className="px-4 py-3 text-xs font-mono text-neon-cyan">{(row.shares / 1000).toFixed(1)}K</td>
                <td className="px-4 py-3 text-xs font-mono text-neon-yellow">{(row.saves / 1000).toFixed(1)}K</td>
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
            <p className="text-xs font-mono text-muted-foreground">Charts render when connected to backend</p>
          </div>
        </div>
      </div>

      {/* Learnings */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" /> Agent Learnings
        </h2>
        <div className="space-y-3">
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
