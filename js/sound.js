// No audio assets or network requests. An AudioContext is created only in direct
// response to a click/keypress. Sound preference lasts only for this page session.
export class ArcadeSound {
  constructor() { this.muted = false; this.context = null; }
  activate() {
    if (this.muted) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio && !this.context) this.context = new Audio();
      if (this.context?.state === 'suspended') this.context.resume().catch(() => {});
    } catch { /* The activity still works without Web Audio. */ }
  }
  play(type) {
    if (this.muted || !this.context) return;
    const notes = {
      correct: [660, 880], wrong: [200, 150], code: [523, 659, 784],
      unlock: [440, 554, 659, 880], complete: [523, 659, 784, 1047, 784, 1047]
    }[type] || [660];
    const start = this.context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      const time = start + index * 0.11;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.07, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(time);
      oscillator.stop(time + 0.15);
    });
  }
}
