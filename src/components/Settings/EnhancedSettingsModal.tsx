// src/components/Settings/EnhancedSettingsModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Volume2,
  Bell,
  Play,
  Monitor,
  Minimize,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Save,
  Palette,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useProfileContext } from "@/stores/ProfileContext";
import { useActivityContext } from "@/stores/ActivityContext";
import { audioNotification } from "@/utils/audio";
import { invoke } from "@tauri-apps/api/core";
// Updated import for Tauri 2
import { open as openDialog, save } from "@tauri-apps/plugin-dialog";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedSettingsModal({
  open,
  onOpenChange,
}: EnhancedSettingsModalProps) {
  const { settings, updateSettings, activeProfile } = useProfileContext();
  const { exportActivities, clearOldActivities } = useActivityContext();
  const [tempSettings, setTempSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [soundVolume, setSoundVolume] = useState(50);

  // Update temp settings when settings change
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  // Test notification permission
  useEffect(() => {
    if (open && tempSettings.desktopNotifications) {
      checkNotificationPermission();
    }
  }, [open, tempSettings.desktopNotifications]);

  const checkNotificationPermission = async () => {
    try {
      const granted = await invoke<boolean>("request_notification_permission");
      if (!granted) {
        toast({
          title: "Notification permission required",
          description: "Please enable notifications in your system settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.warn("Failed to check notification permission:", error);
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update settings
      await updateSettings(tempSettings);

      // Apply always on top setting
      if (tempSettings.alwaysOnTop !== settings.alwaysOnTop) {
        await invoke("set_always_on_top", {
          alwaysOnTop: tempSettings.alwaysOnTop,
        });
      }

      // Test sounds if enabled
      if (tempSettings.soundAlerts) {
        audioNotification.playSound("notification");
      }

      setHasChanges(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
        className: " text-primary-foreground",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSound = async (
    soundType: "start" | "pause" | "complete" | "break" | "notification"
  ) => {
    audioNotification.playSound(soundType);
  };

  const handleExportData = async (
    dataType: "activities" | "profiles" | "settings"
  ) => {
    try {
      const filePath = await save({
        filters: [
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
        defaultPath: `${dataType}-${
          new Date().toISOString().split("T")[0]
        }.json`,
      });

      if (filePath) {
        await invoke("export_data", { dataType, filePath });
        toast({
          title: "Export successful",
          description: `${dataType} data has been exported.`,
          className: " text-primary-foreground",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = async (
    dataType: "activities" | "profiles" | "settings"
  ) => {
    try {
      const selected = await openDialog({
        filters: [
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
        multiple: false,
      });

      if (selected) {
        const filePath = Array.isArray(selected) ? selected[0] : selected;
        await invoke("import_data", { dataType, filePath });
        toast({
          title: "Import successful",
          description: `${dataType} data has been imported.`,
          className: " text-primary-foreground",
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleClearOldActivities = async () => {
    try {
      await clearOldActivities(30); // Keep last 30 days
      toast({
        title: "Activities cleared",
        description: "Activities older than 30 days have been removed.",
        className: " text-primary-foreground",
      });
    } catch (error) {
      toast({
        title: "Clear failed",
        description: "Failed to clear old activities.",
        variant: "destructive",
      });
    }
  };

  const handleResetSettings = () => {
    setTempSettings({
      autoStartNextSession: false,
      soundAlerts: true,
      desktopNotifications: true,
      alwaysOnTop: false,
      minimizeToTray: true,
      soundVolume: 50,
    });
    setHasChanges(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]  text-primary-foreground max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Settings</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Customize your Pomodoro experience
              </DialogDescription>
            </div>
            <AnimatePresence>
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm text-orange-500">
                    Unsaved changes
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#2a2a2a]">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-orange-500"
            >
              <Clock className="w-4 h-4 mr-2" />
              {/* General */}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-orange-500"
            >
              <Bell className="w-4 h-4 mr-2" />
              {/* Notification */}
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="data-[state=active]:bg-orange-500"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {/* Audio */}
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="data-[state=active]:bg-orange-500"
            >
              <Download className="w-4 h-4 mr-2" />
              {/* Data */}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="auto-start"
                    className="text-primary-foreground"
                  >
                    Auto-start Next Session
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically start the next timer when current one ends
                  </p>
                </div>
                <Switch
                  id="auto-start"
                  checked={tempSettings.autoStartNextSession}
                  onCheckedChange={(checked) =>
                    handleSettingChange("autoStartNextSession", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="always-on-top"
                    className="text-primary-foreground"
                  >
                    Always on Top
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Keep the window above other applications
                  </p>
                </div>
                <Switch
                  id="always-on-top"
                  checked={tempSettings.alwaysOnTop}
                  onCheckedChange={(checked) =>
                    handleSettingChange("alwaysOnTop", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="minimize-to-tray"
                    className="text-primary-foreground"
                  >
                    Minimize to Tray
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Hide window in system tray instead of closing
                  </p>
                </div>
                <Switch
                  id="minimize-to-tray"
                  checked={tempSettings.minimizeToTray}
                  onCheckedChange={(checked) =>
                    handleSettingChange("minimizeToTray", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="desktop-notifications"
                    className="text-primary-foreground"
                  >
                    Desktop Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show system notifications for session changes
                  </p>
                </div>
                <Switch
                  id="desktop-notifications"
                  checked={tempSettings.desktopNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("desktopNotifications", checked)
                  }
                />
              </div>

              <div className="p-4 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                <h4 className="text-primary-foreground font-medium mb-2">
                  Notification Settings
                </h4>
                <p className="text-sm text-muted-foreground">
                  {tempSettings.desktopNotifications
                    ? "Desktop notifications are enabled"
                    : "Desktop notifications are disabled"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={checkNotificationPermission}
                  className="mt-2 border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a]"
                >
                  Check Permission
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="sound-alerts"
                    className="text-primary-foreground"
                  >
                    Sound Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for session transitions
                  </p>
                </div>
                <Switch
                  id="sound-alerts"
                  checked={tempSettings.soundAlerts}
                  onCheckedChange={(checked) =>
                    handleSettingChange("soundAlerts", checked)
                  }
                />
              </div>

              {tempSettings.soundAlerts && (
                <div className="space-y-4 p-4 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                  <div>
                    <Label className="text-primary-foreground">
                      Sound Volume
                    </Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[soundVolume]}
                        onValueChange={([value]) => setSoundVolume(value)}
                        max={100}
                        min={0}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-12">
                        {soundVolume}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-primary-foreground mb-2 block">
                      Test Sounds
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestSound("start")}
                        className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a]"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestSound("pause")}
                        className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a]"
                      >
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestSound("complete")}
                        className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a]"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestSound("break")}
                        className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a]"
                      >
                        Break
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleExportData("activities")}
                  className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Activities
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportData("profiles")}
                  className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Profiles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportData("settings")}
                  className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Settings
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleImportData("activities")}
                  className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Activities
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleImportData("profiles")}
                  className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Profiles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleImportData("settings")}
                  className="border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Settings
                </Button>
              </div>

              <div className="p-4 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                <h4 className="text-primary-foreground font-medium mb-2">
                  Data Management
                </h4>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearOldActivities}
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Activities (30+ days)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetSettings}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset All Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#2a2a2a]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
