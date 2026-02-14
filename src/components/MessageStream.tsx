import { AgentMessage } from "@/lib/mockData";
import { motion } from "framer-motion";

const typeColors: Record<string, string> = {
  info: "border-l-info text-info",
  decision: "border-l-primary text-primary",
  warning: "border-l-warning text-warning",
  artifact: "border-l-neon-purple text-neon-purple",
  debate: "border-l-neon-cyan text-neon-cyan",
};

const typeLabels: Record<string, string> = {
  info: "INFO",
  decision: "DECIDE",
  warning: "WARN",
  artifact: "ARTIFACT",
  debate: "DEBATE",
};

export function MessageStream({ messages }: { messages: AgentMessage[] }) {
  return (
    <div className="space-y-1">
      {messages.map((msg, i) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`border-l-2 pl-3 py-2 ${typeColors[msg.type]}`}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono opacity-60">{msg.ts}</span>
            <span className="text-[10px] font-mono font-bold uppercase opacity-80">{typeLabels[msg.type]}</span>
            <span className="text-xs font-mono text-foreground">
              {msg.fromAgent} → {msg.toAgent}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{msg.content}</p>
        </motion.div>
      ))}
    </div>
  );
}
