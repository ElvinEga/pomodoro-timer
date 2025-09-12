// src/components/Settings/SettingsModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary-foreground"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]  text-primary-foreground">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Settings</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-primary-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-muted-foreground">
            Customize your Pomodoro experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="durations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#2a2a2a]">
            <TabsTrigger
              value="durations"
              className="data-[state=active]:bg-orange-500"
            >
              Durations
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-orange-500"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-orange-500"
            >
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="durations" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="focus-duration"
                  className="text-primary-foreground"
                >
                  Focus Duration
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="focus-duration"
                    defaultValue={[25]}
                    max={60}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    25 min
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="short-break"
                  className="text-primary-foreground"
                >
                  Short Break
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="short-break"
                    defaultValue={[5]}
                    max={30}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    5 min
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="long-break" className="text-primary-foreground">
                  Long Break
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="long-break"
                    defaultValue={[15]}
                    max={60}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">
                    15 min
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="sound-alerts"
                  className="text-primary-foreground"
                >
                  Sound Alerts
                </Label>
                <Switch id="sound-alerts" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="desktop-notifications"
                  className="text-primary-foreground"
                >
                  Desktop Notifications
                </Label>
                <Switch id="desktop-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start" className="text-primary-foreground">
                  Auto-start Next Session
                </Label>
                <Switch id="auto-start" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="always-on-top"
                  className="text-primary-foreground"
                >
                  Always on Top
                </Label>
                <Switch id="always-on-top" />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="minimize-to-tray"
                  className="text-primary-foreground"
                >
                  Minimize to Tray
                </Label>
                <Switch id="minimize-to-tray" defaultChecked />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-primary-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-primary-foreground"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
