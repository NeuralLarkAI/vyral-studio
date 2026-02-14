import { Agent, AgentState } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Brain, Target, MessageSquare, Shield } from "lucide-react";

const stateColors: Record<AgentState, string> = {
  Idle: "bg-muted-foreground/30",
  Researching: "bg-info",
  Writing: "bg-neon-purple",
  Rendering: "bg-neon-orange",
  QA: "bg-warning",
  Blocked: "bg-destructive",
  Debating: "bg-neon-cyan",
};

const stateGlows: Record<AgentState, string> = {
  Idle: "",
  Researching: "glow-cyan",
  Writing: "glow-purple",
  Rendering: "",
  QA: "",
  Blocked: "",
  Debating: "glow-cyan",
};

export function AgentCard({ agent, onClick, selected }: { agent: Agent; onClick?: () => void; selected?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all
        ${selected ? "border-primary/50 bg-card glow-green" : "border-border bg-card hover:border-muted-foreground/30"}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
          <p className="text-xs text-muted-foreground">{agent.role}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${stateColors[agent.state]} ${agent.state !== 'Idle' ? 'animate-glow-pulse' : ''}`} />
          <span className="text-xs font-mono text-muted-foreground">{agent.state}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 font-mono leading-relaxed">
        💭 {agent.currentThought}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-primary" />
          <span className="text-xs font-mono text-primary">{(agent.trustScore * 100).toFixed(0)}%</span>
        </div>
        <div className="flex gap-2 text-muted-foreground">
          <div className="flex items-center gap-0.5">
            <Target className="h-3 w-3" />
            <span className="text-xs font-mono">{(agent.kpis.selectionRate * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Brain className="h-3 w-3" />
            <span className="text-xs font-mono">{agent.kpis.avgLatency}s</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
