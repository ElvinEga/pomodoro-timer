import React, { useEffect, useState } from "react";
import { TimerWithNotifications } from "@/components/Timer/TimerWithNotifications";
import { Toaster } from "@/components/ui/toaster";
import { audioNotification } from "@/utils/audio";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Loader2, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Coffee className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold text-primary-foreground mb-2">
          Pomodoro Timer
        </h2>
        <p className="text-muted-foreground">
          Getting ready for focused work...
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mt-4"
        />
      </motion.div>
    </div>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center p-6">
          <Card className=" max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <Power className="w-5 h-5" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Something went wrong with the application. Please try refreshing
                the page.
              </p>
              <details className="text-sm text-gray-500 mb-4">
                <summary>Error details</summary>
                <pre className="mt-2 p-2 bg-[#0a0a0a] rounded overflow-auto">
                  {this.state.error?.message || "Unknown error"}
                </pre>
              </details>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 w-full"
              >
                Reload Application
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        // Initialize audio context on first user interaction
        const initializeAudio = async () => {
          try {
            // Create a silent sound to unlock audio context
            const audioContext = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
            if (audioContext.state === "suspended") {
              await audioContext.resume();
            }

            // Play a very quiet sound to fully unlock
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.001, audioContext.currentTime); // Very quiet

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.01);

            audioContext.close();
          } catch (error) {
            console.warn("Audio initialization failed:", error);
          }
        };

        // Set up global error handler
        const handleError = (event: ErrorEvent) => {
          console.error("Global error:", event.error);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
          console.error("Unhandled promise rejection:", event.reason);
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        // Wait for first user interaction to initialize audio
        const handleFirstInteraction = async () => {
          if (!isInitialized) {
            await initializeAudio();
            setIsInitialized(true);
            document.removeEventListener("click", handleFirstInteraction);
            document.removeEventListener("keydown", handleFirstInteraction);
          }
        };

        document.addEventListener("click", handleFirstInteraction);
        document.addEventListener("keydown", handleFirstInteraction);

        // Simulate loading time for better UX
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);

        // Cleanup function
        return () => {
          window.removeEventListener("error", handleError);
          window.removeEventListener(
            "unhandledrejection",
            handleUnhandledRejection,
          );
          document.removeEventListener("click", handleFirstInteraction);
          document.removeEventListener("keydown", handleFirstInteraction);
          audioNotification.destroy();
        };
      } catch (error) {
        console.error("App initialization failed:", error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [isInitialized]);

  // Handle app visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is hidden, could pause timers or reduce resource usage
        console.log("App hidden");
      } else {
        // App is visible again
        console.log("App visible");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case ",":
            event.preventDefault();
            // Open settings
            window.dispatchEvent(new CustomEvent("open-settings"));
            break;
          case "r":
            event.preventDefault();
            // Reset timer
            window.dispatchEvent(new CustomEvent("reset-timer"));
            break;
        }
      }

      // Space bar to start/pause
      if (
        event.code === "Space" &&
        !(event.target instanceof HTMLInputElement)
      ) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-timer"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <TimerWithNotifications />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;
