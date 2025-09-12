// src/App.tsx
import React, { useState } from "react";
import { TimerMain } from "@/components/Timer/TimerMain";
import { Toaster } from "@/components/ui/toaster";
import { SettingsModal } from "@/components/Settings/SettingsModal";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <TimerMain onSettingsClick={() => setSettingsOpen(true)} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Toaster />
    </>
  );
}

export default App;
