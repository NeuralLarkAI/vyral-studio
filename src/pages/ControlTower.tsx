import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, RefreshCw, Play, Pause, MessageSquare, ArrowUpRight, Shield, Brain, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/AgentCard";
import { MessageStream } from "@/components/MessageStream";
import { QueuePanel } from "@/components/QueuePanel";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Agent, AgentMessage, QueueStatus } from "@/lib/mockData";
import { apiGet } from "@/lib/api";
import { useBackendSocket } from "@/hooks/useBackendSocket";

export default function ControlTower() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [queues, setQueues] = useState<QueueStatus[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Fetch data from backend on mount
  useEffect(() => {
    apiGet<Agent[]>("/api/agents")
      .then((data) => {
        setAgents(data);
        if (data.length > 0) setSelectedAgent(data[0]);
      })
      .catch(() => setAgents([]));

    apiGet<AgentMessage[]>("/api/messages")
      .then(setMessages)
      .catch(() => setMessages([]));

    apiGet<QueueStatus[]>("/api/ops/queue")
      .then(setQueues)
      .catch(() => setQueues([]));
  }, []);

  // Live updates via WebSocket
  useBackendSocket((event) => {
    if (!event?.kind) return;

    if (event.kind === "agent_state") {
      const { name, state, currentThought } = event.payload || {};
      setAgents((prev) =>
        prev.map((a) =>
          a.name === name ? { ...a, state, currentThought: currentThought || a.currentThought } : a
        )
      );
      setSelectedAgent((prev) =>
        prev && prev.name === name ? { ...prev, state, currentThought: currentThought || prev.currentThought } : prev
      );
    }

    if (event.kind === "message") {
      setMessages((prev) => [event.payload as AgentMessage, ...prev]);
    }

    if (event.kind === "queue_update") {
      setQueues(event.payload);
    }
  });

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground font-mono">Loading agents from backend...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-glow-green">Control Tower</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and intervene in agent operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-mono text-xs">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Force Team Discussion
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Agent Roster */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Agent Roster</h2>
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={selectedAgent.id === agent.id}
                onClick={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        </div>

        {/* Center: Message Stream */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Live Message Stream</h2>
          <div className="p-5 rounded-xl border border-border bg-card max-h-[500px] overflow-y-auto">
            <MessageStream messages={messages} />
          </div>

          {/* Interventions */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">Interventions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="font-mono text-xs justify-start">
                <Lock className="h-3 w-3 mr-1.5 text-warning" /> Lock Topic
              </Button>
              <Button variant="outline" size="sm" className="font-mono text-xs justify-start">
                <Lock className="h-3 w-3 mr-1.5 text-neon-cyan" /> Lock Hook
              </Button>
              <Button variant="outline" size="sm" className="font-mono text-xs justify-start">
                <RefreshCw className="h-3 w-3 mr-1.5 text-neon-purple" /> Rewrite Script
              </Button>
              <Button variant="outline" size="sm" className="font-mono text-xs justify-start">
                <RefreshCw className="h-3 w-3 mr-1.5 text-neon-orange" /> Rerender Preview
              </Button>
              <Button variant="outline" size="sm" className="font-mono text-xs justify-start">
                <ArrowUpRight className="h-3 w-3 mr-1.5 text-primary" /> Promote → Final
              </Button>
              <Button variant="outline" size="sm" className="font-mono text-xs justify-start">
                <Pause className="h-3 w-3 mr-1.5 text-destructive" /> Pause Agent
              </Button>
            </div>
          </div>

          {/* Queue */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">Queue & Workers</h2>
            <QueuePanel queues={queues} />
          </div>
        </div>

        {/* Right: Agent Detail */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Agent: <span className="text-primary">{selectedAgent.name}</span>
          </h2>

          <motion.div key={selectedAgent.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* KPIs */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold font-mono text-foreground">{((selectedAgent.kpis?.selectionRate ?? 0) * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">Selection</p>
                </div>
                <div className="text-center">
                  <Zap className="h-4 w-4 mx-auto mb-1 text-neon-cyan" />
                  <p className="text-lg font-bold font-mono text-foreground">{((selectedAgent.kpis?.upliftContribution ?? 0) * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">Uplift</p>
                </div>
                <div className="text-center">
                  <Shield className="h-4 w-4 mx-auto mb-1 text-destructive" />
                  <p className="text-lg font-bold font-mono text-foreground">{((selectedAgent.kpis?.failureRate ?? 0) * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">Failure</p>
                </div>
                <div className="text-center">
                  <Brain className="h-4 w-4 mx-auto mb-1 text-neon-purple" />
                  <p className="text-lg font-bold font-mono text-foreground">{selectedAgent.kpis?.avgLatency ?? 0}s</p>
                  <p className="text-[10px] text-muted-foreground">Latency</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="soul" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-secondary">
                <TabsTrigger value="soul" className="text-xs font-mono">Soul</TabsTrigger>
                <TabsTrigger value="goals" className="text-xs font-mono">Goals</TabsTrigger>
                <TabsTrigger value="thoughts" className="text-xs font-mono">Thoughts</TabsTrigger>
                <TabsTrigger value="trust" className="text-xs font-mono">Trust</TabsTrigger>
              </TabsList>

              <TabsContent value="soul" className="mt-3">
                <div className="p-4 rounded-lg border border-border bg-secondary/30">
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
{JSON.stringify({
  name: selectedAgent.name,
  role: selectedAgent.role,
  traits: selectedAgent.soulSummary,
  communication_style: "Direct, data-backed",
  strengths: ["Pattern recognition", "Speed", "Consistency"],
  weaknesses: ["May miss creative angles"]
}, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="goals" className="mt-3">
                <div className="p-4 rounded-lg border border-border bg-secondary/30">
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
{JSON.stringify({
  primary: selectedAgent.goalsSummary,
  secondary: ["Minimize false positives", "Maintain consistency across runs"],
  constraints: ["Stay within niche glossary", "Respect brand voice"]
}, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="thoughts" className="mt-3">
                <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-glow-pulse" />
                    <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
                  </div>
                  <p className="text-xs font-mono text-foreground">{selectedAgent.currentThought}</p>
                </div>
              </TabsContent>

              <TabsContent value="trust" className="mt-3">
                <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-foreground">Trust Score</span>
                      <span className="text-sm font-bold font-mono text-primary">{((selectedAgent.trustScore ?? 0) * 100).toFixed(0)}%</span>
                    </div>
                    <Slider defaultValue={[(selectedAgent.trustScore ?? 0) * 100]} max={100} step={1} className="w-full" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Relationships</p>
                    {agents.filter(a => a.id !== selectedAgent.id).slice(0, 4).map(a => (
                      <div key={a.id} className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">{a.name}</span>
                        <span className="text-xs font-mono text-primary">{(0.5 + Math.random() * 0.5).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
