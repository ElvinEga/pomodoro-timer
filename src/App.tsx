// src/App.tsx
import React, { useEffect } from "react";
import { TimerWithNotifications } from "@/components/Timer/TimerWithNotifications";
import { Toaster } from "@/components/ui/toaster";
import { audioNotification } from "@/utils/audio";

function App() {
  useEffect(() => {
    // Initialize audio on first user interaction
    const initializeAudio = () => {
      audioNotification.playSound("notification");
      document.removeEventListener("click", initializeAudio);
      document.removeEventListener("keydown", initializeAudio);
    };

    document.addEventListener("click", initializeAudio);
    document.addEventListener("keydown", initializeAudio);

    return () => {
      document.removeEventListener("click", initializeAudio);
      document.removeEventListener("keydown", initializeAudio);
      audioNotification.destroy();
    };
  }, []);

  return (
    <>
      <TimerWithNotifications />
      <Toaster />
    </>
  );
}

export default App;
