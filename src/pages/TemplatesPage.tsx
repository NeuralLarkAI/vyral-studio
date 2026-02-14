import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Mic, Film, Type, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const presetTypes = [
  { key: "templates", label: "Templates", icon: Film, items: [
    { id: "1", name: "History/Facts Daily", description: "Daily history and facts videos for education niche" },
    { id: "2", name: "Science Explainer", description: "Quick science breakdowns with visual emphasis" },
  ]},
  { key: "voice", label: "Voice Profiles", icon: Mic, items: [
    { id: "1", name: "Punchy Narrator", description: "Fast-paced, high-energy delivery with strategic pauses" },
    { id: "2", name: "Calm Educator", description: "Warm, measured tone for complex topics" },
  ]},
  { key: "animation", label: "Animation", icon: Film, items: [
    { id: "1", name: "Dark Neon Kinetic", description: "Neon glow text on dark backgrounds with bounce/pop-in" },
    { id: "2", name: "Minimal Clean", description: "White text on solid colors, subtle fade transitions" },
  ]},
  { key: "subtitle", label: "Subtitles", icon: Type, items: [
    { id: "1", name: "Bold Safe Margin", description: "Large bold font, positioned above TikTok UI elements" },
  ]},
  { key: "music", label: "Music", icon: Music, items: [
    { id: "1", name: "No Music", description: "Disabled — voice only" },
    { id: "2", name: "Ambient Lo-fi", description: "Subtle lo-fi background at -18dB with ducking" },
  ]},
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-glow-green">Templates & Style</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage run templates, voice profiles, animation presets, and more</p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="bg-secondary">
          {presetTypes.map(pt => (
            <TabsTrigger key={pt.key} value={pt.key} className="text-xs font-mono gap-1.5">
              <pt.icon className="h-3.5 w-3.5" /> {pt.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {presetTypes.map(pt => (
          <TabsContent key={pt.key} value={pt.key} className="mt-4">
            <div className="flex justify-end mb-4">
              <Button size="sm" className="font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> New {pt.label.replace(/s$/, '')}
              </Button>
            </div>
            <div className="space-y-3">
              {pt.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl border border-border bg-card flex items-start justify-between hover:border-muted-foreground/30 transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Niche Glossary */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h2 className="text-sm font-semibold text-foreground mb-3">Niche Glossary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Allowed Terms</Label>
            <Textarea className="mt-1 bg-secondary border-border font-mono text-xs" rows={3} defaultValue="ancient, civilization, discovery, archaeological, expedition, artifact" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Banned Terms</Label>
            <Textarea className="mt-1 bg-secondary border-border font-mono text-xs" rows={3} defaultValue="aliens, conspiracy, paranormal, supernatural, cover-up" />
          </div>
        </div>
      </div>
    </div>
  );
}
