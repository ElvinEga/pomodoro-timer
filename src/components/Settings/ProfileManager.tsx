import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Edit3, Palette, Clock, Check } from "lucide-react";
import { useProfileContext } from "@/stores/ProfileContext";
import { Profile } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const colorOptions = [
  "#ff6b35",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export function ProfileManager() {
  const { profiles, createProfile, updateProfile, deleteProfile, isLoading } =
    useProfileContext();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakAfter: 4,
    color: "#ff6b35",
  });

  const handleCreate = async () => {
    try {
      await createProfile(formData);
      toast({
        title: "Profile created",
        description: `${formData.name} has been created successfully.`,
        className: " text-primary-foreground",
      });
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingProfile) return;

    try {
      await updateProfile(editingProfile.id, formData);
      toast({
        title: "Profile updated",
        description: `${formData.name} has been updated successfully.`,
        className: " text-primary-foreground",
      });
      setEditingProfile(null);
      resetForm();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (profile: Profile) => {
    if (!profile.isCustom) {
      toast({
        title: "Cannot delete",
        description: "Default profiles cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteProfile(profile.id);
      toast({
        title: "Profile deleted",
        description: `${profile.name} has been deleted.`,
        className: " text-primary-foreground",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakAfter: 4,
      color: "#ff6b35",
    });
  };

  const startEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      focusDuration: profile.focusDuration,
      shortBreakDuration: profile.shortBreakDuration,
      longBreakDuration: profile.longBreakDuration,
      longBreakAfter: profile.longBreakAfter,
      color: profile.color,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Profiles</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]  text-primary-foreground">
            <DialogHeader>
              <DialogTitle>Create Custom Profile</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Design your perfect Pomodoro timing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary-foreground">
                  Profile Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="My Custom Profile"
                  className="bg-[#2a2a2a] border-[#3a3a3a] text-primary-foreground placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-primary-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Focus Duration: {formData.focusDuration} minutes
                </Label>
                <Slider
                  value={[formData.focusDuration]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, focusDuration: value })
                  }
                  max={120}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-primary-foreground">Short Break</Label>
                  <Slider
                    value={[formData.shortBreakDuration]}
                    onValueChange={([value]) =>
                      setFormData({ ...formData, shortBreakDuration: value })
                    }
                    max={30}
                    min={1}
                    step={1}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formData.shortBreakDuration} min
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary-foreground">Long Break</Label>
                  <Slider
                    value={[formData.longBreakDuration]}
                    onValueChange={([value]) =>
                      setFormData({ ...formData, longBreakDuration: value })
                    }
                    max={60}
                    min={5}
                    step={5}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formData.longBreakDuration} min
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-primary-foreground">
                  Long Break After
                </Label>
                <Slider
                  value={[formData.longBreakAfter]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, longBreakAfter: value })
                  }
                  max={8}
                  min={2}
                  step={1}
                />
                <span className="text-xs text-muted-foreground">
                  {formData.longBreakAfter} sessions
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-primary-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Theme
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <Button
                      key={color}
                      size="icon"
                      variant="ghost"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        formData.color === color
                          ? "border-white"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formData.name.trim()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Create Profile
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a]"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: profile.color }}
              />

              <div className="flex-1">
                <div className="font-medium">{profile.name}</div>
                <div className="text-sm text-muted-foreground">
                  {profile.focusDuration}/{profile.shortBreakDuration}/
                  {profile.longBreakAfter}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!profile.isCustom && (
                  <span className="text-xs text-muted-foreground bg-primary/50 px-2 py-1 rounded">
                    Default
                  </span>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEdit(profile)}
                  className="text-muted-foreground hover:text-primary-foreground"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(profile)}
                  disabled={!profile.isCustom}
                  className={cn(
                    "text-muted-foreground hover:text-red-400",
                    !profile.isCustom && "opacity-30 cursor-not-allowed",
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingProfile}
        onOpenChange={(open) => !open && setEditingProfile(null)}
      >
        <DialogContent className="sm:max-w-[500px]  text-primary-foreground">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your profile settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-primary-foreground">
                Profile Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-[#2a2a2a] border-[#3a3a3a] text-primary-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-primary-foreground">
                Focus Duration: {formData.focusDuration} minutes
              </Label>
              <Slider
                value={[formData.focusDuration]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, focusDuration: value })
                }
                max={120}
                min={5}
                step={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-primary-foreground">Short Break</Label>
                <Slider
                  value={[formData.shortBreakDuration]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, shortBreakDuration: value })
                  }
                  max={30}
                  min={1}
                  step={1}
                />
                <span className="text-xs text-muted-foreground">
                  {formData.shortBreakDuration} min
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-primary-foreground">Long Break</Label>
                <Slider
                  value={[formData.longBreakDuration]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, longBreakDuration: value })
                  }
                  max={60}
                  min={5}
                  step={5}
                />
                <span className="text-xs text-muted-foreground">
                  {formData.longBreakDuration} min
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary-foreground">
                Long Break After
              </Label>
              <Slider
                value={[formData.longBreakAfter]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, longBreakAfter: value })
                }
                max={8}
                min={2}
                step={1}
              />
              <span className="text-xs text-muted-foreground">
                {formData.longBreakAfter} sessions
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-primary-foreground">Color Theme</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <Button
                    key={color}
                    size="icon"
                    variant="ghost"
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2",
                      formData.color === color
                        ? "border-white"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setEditingProfile(null)}
              className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
