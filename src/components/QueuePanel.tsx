export function QueuePanel({ queues }: { queues: any }) {
  // Normalize input so it NEVER crashes
  const list = Array.isArray(queues)
    ? queues
    : Array.isArray(queues?.queues)
    ? queues.queues
    : [];

  if (!list.length) {
    return (
      <div className="text-xs font-mono text-muted-foreground px-2 py-1">
        No queue data yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((q: any) => (
        <div
          key={q.name ?? q.id ?? Math.random()}
          className="flex items-center gap-3 px-3 py-2 rounded bg-secondary/50 border border-border"
        >
          <span className="text-xs font-mono text-foreground w-20">
            {q.name ?? "queue"}
          </span>

          <div className="flex-1 flex items-center gap-2">
            {q.active > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                {q.active} active
              </span>
            )}

            {q.waiting > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                {q.waiting} waiting
              </span>
            )}

            <span className="text-[10px] font-mono text-muted-foreground">
              ✓{q.completed ?? 0}
            </span>

            {q.failed > 0 && (
              <span className="text-[10px] font-mono text-destructive">
                ✗{q.failed}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
