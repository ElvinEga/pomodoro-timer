// src/App.tsx
import React from "react";
import { TimerWithActivityTracking } from "@/components/Timer/TimerWithActivityTracking";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <TimerWithActivityTracking />
      <Toaster />
    </>
  );
}

export default App;
