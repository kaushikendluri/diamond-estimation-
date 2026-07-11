"use client";

import { Bell, Cpu, Globe2, Palette, RotateCcw, Save, Server } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/store/settings-store";
import { MODEL_VERSIONS, RESOLUTIONS, LANGUAGES } from "@/types/settings";
import { toast } from "sonner";

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Cpu;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-cyan)]/20 to-transparent text-[var(--brand-cyan)]">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure detection behavior, API access, and app preferences."
        actions={
          <>
            <Button
              variant="outline"
              className="glass gap-2 border-white/15"
              onClick={() => {
                resetSettings();
                toast.success("Settings reset to defaults.");
              }}
            >
              <RotateCcw className="h-4 w-4" /> Reset defaults
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] text-black hover:opacity-90"
              onClick={() => toast.success("Settings saved.")}
            >
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsSection icon={Cpu} title="Model & Detection" description="Tune how the AI detects and scores stones">
          <div>
            <div className="flex items-center justify-between">
              <Label>Confidence threshold</Label>
              <span className="text-sm font-medium tabular-nums">
                {(settings.confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              className="mt-3"
              value={[settings.confidenceThreshold * 100]}
              min={30}
              max={99}
              step={1}
              onValueChange={([v]) => updateSettings({ confidenceThreshold: v / 100 })}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Diamonds detected below this confidence are flagged for manual review.
            </p>
          </div>

          <div>
            <Label>AI model version</Label>
            <Select value={settings.modelVersion} onValueChange={(v) => updateSettings({ modelVersion: v })}>
              <SelectTrigger className="mt-2 w-full border-white/15 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_VERSIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Default image resolution</Label>
            <Select
              value={settings.defaultResolution}
              onValueChange={(v) => updateSettings({ defaultResolution: v })}
            >
              <SelectTrigger className="mt-2 w-full border-white/15 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SettingsSection>

        <SettingsSection icon={Server} title="API & Integration" description="Point the app at your detection backend">
          <div>
            <Label htmlFor="api-endpoint">API endpoint</Label>
            <Input
              id="api-endpoint"
              value={settings.apiEndpoint}
              onChange={(e) => updateSettings({ apiEndpoint: e.target.value })}
              className="mt-2 border-white/15 bg-white/5 font-mono text-sm"
              placeholder="https://api.example.com/v1"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Used for <code className="rounded bg-white/10 px-1">/upload</code> and{" "}
              <code className="rounded bg-white/10 px-1">/detect</code> once mock mode is disabled.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Push notifications</p>
              <p className="text-xs text-muted-foreground">Get notified when a detection completes</p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(v) => updateSettings({ notificationsEnabled: v })}
            />
          </div>
        </SettingsSection>

        <SettingsSection icon={Globe2} title="Language" description="Set your preferred display language">
          <div>
            <Label>Language</Label>
            <Select value={settings.language} onValueChange={(v) => updateSettings({ language: v })}>
              <SelectTrigger className="mt-2 w-full border-white/15 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SettingsSection>

        <SettingsSection icon={Palette} title="Appearance" description="Choose how Lumina AI looks on your device">
          <div className="grid grid-cols-3 gap-2">
            {(["dark", "light", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={`rounded-xl border px-3 py-2.5 text-sm capitalize transition-colors ${
                  settings.theme === t
                    ? "border-[var(--brand-cyan)]/50 bg-[var(--brand-cyan)]/10 text-foreground"
                    : "border-white/10 text-muted-foreground hover:border-white/20"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </SettingsSection>
      </div>

      <div className="glass mt-5 flex items-center gap-3 rounded-2xl p-4 text-xs text-muted-foreground">
        <Bell className="h-4 w-4 shrink-0" />
        All preferences are saved automatically to this browser&apos;s local storage — no account required.
      </div>
    </div>
  );
}
