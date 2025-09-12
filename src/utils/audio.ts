// src/utils/audio.ts
export class AudioNotification {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  async playSound(
    type: "start" | "pause" | "complete" | "break" | "notification",
  ) {
    if (!this.isInitialized || !this.audioContext) return;

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Different sounds for different events
      const soundConfigs = {
        start: { frequency: 523.25, duration: 0.1, type: "sine" }, // C5
        pause: { frequency: 392, duration: 0.15, type: "square" }, // G4
        complete: { frequency: 659.25, duration: 0.3, type: "sine" }, // E5
        break: { frequency: 440, duration: 0.2, type: "triangle" }, // A4
        notification: { frequency: 587.33, duration: 0.25, type: "sine" }, // D5
      };

      const config = soundConfigs[type];

      oscillator.frequency.setValueAtTime(
        config.frequency,
        this.audioContext.currentTime,
      );
      oscillator.type = config.type as OscillatorType;

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + config.duration,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + config.duration);
    } catch (error) {
      console.warn("Failed to play sound:", error);
    }
  }

  async playCompleteSequence() {
    if (!this.isInitialized || !this.audioContext) return;

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const duration = 0.15;
      const gap = 0.05;

      for (let i = 0; i < notes.length; i++) {
        setTimeout(
          () => {
            this.playTone(notes[i], duration, 0.1);
          },
          i * (duration + gap) * 1000,
        );
      }
    } catch (error) {
      console.warn("Failed to play complete sequence:", error);
    }
  }

  private playTone(frequency: number, duration: number, volume: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime,
    );
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration,
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
    }
  }
}

// Create singleton instance
export const audioNotification = new AudioNotification();
