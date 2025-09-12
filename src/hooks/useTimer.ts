import { useReducer, useEffect, useCallback } from "react";
import { TimerState, TimerAction, Profile } from "@/types";

const defaultProfile: Profile = {
  id: "work",
  name: "Work",
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakAfter: 4,
  color: "#ff6b35",
  isCustom: false,
};

const initialState: TimerState = {
  isRunning: false,
  isPaused: false,
  currentSession: "focus",
  timeRemaining: 25 * 60, // 25 minutes in seconds
  sessionsCompleted: 0,
  currentProfile: defaultProfile,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "START":
      return {
        ...state,
        isRunning: true,
        isPaused: false,
      };
    case "PAUSE":
      return {
        ...state,
        isPaused: true,
      };
    case "RESUME":
      return {
        ...state,
        isPaused: false,
      };
    case "RESET":
      return {
        ...initialState,
        currentProfile: state.currentProfile,
        timeRemaining: state.currentProfile.focusDuration * 60,
      };
    case "TICK":
      if (state.timeRemaining <= 1) {
        return {
          ...state,
          timeRemaining: 0,
        };
      }
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1,
      };
    case "SESSION_COMPLETE":
      const isFocusSession = state.currentSession === "focus";
      const newSessionsCompleted = isFocusSession
        ? state.sessionsCompleted + 1
        : state.sessionsCompleted;

      let nextSession: "focus" | "short-break" | "long-break";
      let nextDuration: number;

      if (isFocusSession) {
        if (newSessionsCompleted % state.currentProfile.longBreakAfter === 0) {
          nextSession = "long-break";
          nextDuration = state.currentProfile.longBreakDuration * 60;
        } else {
          nextSession = "short-break";
          nextDuration = state.currentProfile.shortBreakDuration * 60;
        }
      } else {
        nextSession = "focus";
        nextDuration = state.currentProfile.focusDuration * 60;
      }

      return {
        ...state,
        currentSession: nextSession,
        timeRemaining: nextDuration,
        sessionsCompleted: newSessionsCompleted,
        isRunning: false,
        isPaused: false,
      };
    case "SET_PROFILE":
      return {
        ...state,
        currentProfile: action.payload,
        timeRemaining: action.payload.focusDuration * 60,
        currentSession: "focus",
        isRunning: false,
        isPaused: false,
        sessionsCompleted: 0,
      };
    default:
      return state;
  }
}

export function useTimer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.isRunning && !state.isPaused) {
      interval = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    }

    if (state.timeRemaining === 0 && state.isRunning) {
      dispatch({ type: "SESSION_COMPLETE" });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning, state.isPaused, state.timeRemaining]);

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const setProfile = useCallback(
    (profile: Profile) => dispatch({ type: "SET_PROFILE", payload: profile }),
    [],
  );

  return {
    state,
    start,
    pause,
    resume,
    reset,
    setProfile,
  };
}
