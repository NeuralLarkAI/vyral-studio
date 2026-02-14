import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Eye, Download, Copy, Upload, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HookVariants } from "@/components/HookVariants";
import { ScorePanel } from "@/components/ScorePanel";
import { QueuePanel } from "@/components/QueuePanel";
import { MessageStream } from "@/components/MessageStream";
import { mockMessages, mockQueues, mockAgents } from "@/lib/mockData";

export default function Dashboard() {
  const [previewMode, setPreviewMode] = useState(true);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-glow-green">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and monitor content generation runs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-mono text-xs">
            <Zap className="h-3.5 w-3.5 mr-1.5" /> Run Daily Schedule Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Run Config */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">New Run</h2>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Template</Label>
                <Select defaultValue="history">
                  <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="history">History/Facts Daily</SelectItem>
                    <SelectItem value="science">Science Explainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Niche</Label>
                  <Input defaultValue="History" className="mt-1 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mode</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Topic (optional)</Label>
                <Input placeholder="Leave empty for auto-research" className="mt-1 bg-secondary border-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Target Length</Label>
                  <Input defaultValue="30s" className="mt-1 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Animation</Label>
                  <Select defaultValue="dark-neon">
                    <SelectTrigger className="mt-1 bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark-neon">Dark Neon Kinetic</SelectItem>
                      <SelectItem value="minimal">Minimal Clean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs text-muted-foreground">Preview Mode</Label>
                <Switch checked={previewMode} onCheckedChange={setPreviewMode} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 font-mono text-xs" variant="outline">
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> Generate (Preview)
                </Button>
                <Button className="flex-1 font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                  <Play className="h-3.5 w-3.5 mr-1.5" /> Generate (Final)
                </Button>
              </div>
            </div>
          </div>

          {/* Hooks */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">Hook Variants</h2>
            <HookVariants />
          </div>

          {/* Upload Checklist */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">Upload Checklist</h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              {["Download final MP4", "Download thumbnail PNG", "Copy caption text", "Copy hashtags", "Open TikTok Studio", "Upload video", "Set cover image", "Paste caption", "Schedule/Publish"].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-border flex items-center justify-center text-[10px] font-mono text-muted-foreground">{i + 1}</div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full font-mono text-xs">
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Open TikTok Upload
            </Button>
          </div>
        </motion.div>

        {/* Center: Preview + Scores */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-4">
          {/* Video Preview */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="aspect-[9/16] max-h-[500px] bg-secondary flex items-center justify-center relative">
              <div className="absolute inset-0 gradient-neon" />
              <div className="text-center z-10">
                <Play className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs font-mono text-muted-foreground">Preview will appear here</p>
                <p className="text-[10px] text-muted-foreground mt-1">720×1280 • CRF 24 • Preview</p>
              </div>
            </div>
            <div className="p-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 font-mono text-xs">
                <Download className="h-3 w-3 mr-1" /> MP4
              </Button>
              <Button variant="outline" size="sm" className="flex-1 font-mono text-xs">
                <Download className="h-3 w-3 mr-1" /> Thumb
              </Button>
              <Button variant="outline" size="sm" className="flex-1 font-mono text-xs">
                <Download className="h-3 w-3 mr-1" /> ZIP
              </Button>
            </div>
          </div>

          {/* Scores */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">Scores</h2>
            <ScorePanel retentionScore={84} viralityScore={78} reasons={[
              "Strong curiosity hook",
              "Concise beat structure",
              "Loop trigger ending",
              "High novelty topic",
            ]} />
          </div>

          {/* Caption & Hashtags */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">Caption</h2>
            <div className="p-3 rounded bg-secondary text-xs text-muted-foreground font-mono mb-2">
              This ancient city was lost for centuries — and when they finally found it, nothing made sense 🏛️
            </div>
            <Button variant="outline" size="sm" className="font-mono text-xs w-full">
              <Copy className="h-3 w-3 mr-1" /> Copy Caption
            </Button>
            <div className="mt-3 flex flex-wrap gap-1">
              {["#history", "#mystery", "#ancientcity", "#facts", "#mindblown", "#fyp"].map(tag => (
                <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{tag}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Live Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1 space-y-4">
          {/* Agent Status */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">Agent Status</h2>
            <div className="space-y-1.5">
              {mockAgents.slice(0, 6).map(agent => (
                <div key={agent.id} className="flex items-center gap-2 py-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${agent.state === 'Idle' ? 'bg-muted-foreground/30' : agent.state === 'Researching' ? 'bg-info animate-glow-pulse' : 'bg-muted-foreground/30'}`} />
                  <span className="text-xs font-mono text-foreground w-28">{agent.name}</span>
                  <span className="text-[10px] text-muted-foreground">{agent.state}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Messages */}
          <div className="p-5 rounded-xl border border-border bg-card max-h-[400px] overflow-y-auto">
            <h2 className="text-sm font-semibold text-foreground mb-3">Live Messages</h2>
            <MessageStream messages={mockMessages} />
          </div>

          {/* Queue */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-sm font-semibold text-foreground mb-3">Queue Status</h2>
            <QueuePanel queues={mockQueues} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
