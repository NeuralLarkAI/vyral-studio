import { motion } from "framer-motion";

const hookVariants = [
  { id: "A", text: "This city shouldn't exist", score: 87, selected: true },
  { id: "B", text: "Scientists can't explain this", score: 82, selected: false },
  { id: "C", text: "They found something impossible", score: 79, selected: false },
];

export function HookVariants() {
  return (
    <div className="space-y-2">
      {hookVariants.map((hook, i) => (
        <motion.div
          key={hook.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`
            flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
            ${hook.selected 
              ? "border-primary/50 bg-primary/5 glow-green" 
              : "border-border bg-card hover:border-muted-foreground/30"}
          `}
        >
          <div className={`
            h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold font-mono
            ${hook.selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
          `}>
            {hook.id}
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">"{hook.text}"</p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold font-mono ${hook.selected ? "text-primary" : "text-muted-foreground"}`}>
              {hook.score}
            </span>
            <p className="text-[10px] text-muted-foreground">score</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
