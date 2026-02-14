import { motion } from "framer-motion";

interface ScorePanelProps {
  retentionScore: number;
  viralityScore: number;
  reasons?: string[];
}

export function ScorePanel({ retentionScore, viralityScore, reasons }: ScorePanelProps) {
  return (
    <div className="flex gap-4">
      <ScoreRing label="Retention" score={retentionScore} color="primary" />
      <ScoreRing label="Virality" score={viralityScore} color="accent" />
      {reasons && reasons.length > 0 && (
        <div className="flex-1 ml-4">
          <p className="text-xs font-mono text-muted-foreground mb-1">Reasons:</p>
          <ul className="space-y-0.5">
            {reasons.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ label, score, color }: { label: string; score: number; color: string }) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" stroke="hsl(var(--border))" strokeWidth="4" fill="none" />
          <motion.circle
            cx="40" cy="40" r="36"
            stroke={`hsl(var(--${color}))`}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold font-mono text-${color}`}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
