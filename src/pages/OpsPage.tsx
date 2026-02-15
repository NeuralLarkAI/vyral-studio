import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle, HardDrive, Cpu, DollarSign, Clock, Trash2, RefreshCw } from "lucide-react";
import { apiGet } from "@/lib/api";

interface HealthCheck {
  name: string;
  status: string;
  detail: string;
}

const statusIcon = (status: string) => {
  if (status === "ok") return <CheckCircle className="h-4 w-4 text-success" />;
  if (status === "warn") return <Clock className="h-4 w-4 text-warning" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

export default function OpsPage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchHealth() {
    setLoading(true);
    apiGet<{ ok: boolean; checks: HealthCheck[] }>("/api/ops/health")
      .then((data) => { setHealthChecks(data.checks || []); setLoading(false); })
      .catch(() => { setHealthChecks([{ name: "Backend", status: "error", detail: "Cannot reach backend server" }]); setLoading(false); });
  }

  useEffect(() => { fetchHealth(); }, []);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-glow-green">Ops / Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">System health, budget controls, and maintenance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-xl border border-border bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /> System Health
          </h2>
          <div className="space-y-2">
            {healthChecks.map((check) => (
              <div key={check.name} className="flex items-center gap-3 p-2 rounded bg-secondary/30 border border-border">
                {statusIcon(check.status)}
                <div className="flex-1">
                  <span className="text-xs font-mono text-foreground">{check.name}</span>
                  <p className="text-[10px] text-muted-foreground">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3 w-full font-mono text-xs" onClick={fetchHealth}>
            <RefreshCw className={`h-3 w-3 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh Health Checks
          </Button>
        </motion.div>

        {/* Budget Controls */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-xl border border-border bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-warning" /> Budget Controls
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Daily Cap</Label>
                <Input defaultValue="$5.00" className="mt-1 bg-secondary border-border font-mono text-xs" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Weekly Cap</Label>
                <Input defaultValue="$25.00" className="mt-1 bg-secondary border-border font-mono text-xs" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Per-Run Max</Label>
                <Input defaultValue="$2.00" className="mt-1 bg-secondary border-border font-mono text-xs" />
              </div>
            </div>
            <div className="p-3 rounded bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Today's spend</span>
                <span className="text-sm font-mono font-bold text-primary">$1.42</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "28%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">28% of daily cap</p>
            </div>
            <Button size="sm" className="w-full font-mono text-xs bg-primary text-primary-foreground">Save Budget Settings</Button>
          </div>
        </motion.div>

        {/* Caching */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-xl border border-border bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-neon-cyan" /> Caching Controls
          </h2>
          <div className="space-y-3">
            {[
              { label: "Trend Report TTL", value: "6h" },
              { label: "Hook Variants TTL", value: "24h" },
              { label: "Script TTL", value: "24h" },
              { label: "TTS Audio", value: "Content-hash" },
              { label: "Transcription SRT", value: "Content-hash" },
            ].map(c => (
              <div key={c.label} className="flex items-center justify-between p-2 rounded bg-secondary/30 border border-border">
                <span className="text-xs font-mono text-foreground">{c.label}</span>
                <Input defaultValue={c.value} className="w-24 bg-secondary border-border font-mono text-xs text-right h-7" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cleanup */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-xl border border-border bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" /> Cleanup Controls
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30 border border-border">
              <span className="text-xs text-foreground">Keep finals forever</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30 border border-border">
              <span className="text-xs text-foreground">Delete intermediates after</span>
              <Input defaultValue="7 days" className="w-24 bg-secondary border-border font-mono text-xs text-right h-7" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 font-mono text-xs">
                Export & Purge Run
              </Button>
              <Button variant="outline" size="sm" className="flex-1 font-mono text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                Run Cleanup Now
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
