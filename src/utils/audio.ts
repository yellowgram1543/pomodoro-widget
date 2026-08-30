import { AlarmSound, BuiltInAmbientSound } from '../types';

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Synthesizes relaxing, harmonic notification chimes
 */
export function playChime(type: AlarmSound = 'bell', volume = 0.8): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gainMaster = ctx.createGain();
    gainMaster.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), now);
    gainMaster.connect(ctx.destination);

    if (type === 'bowl') {
      // Tibetan Singing Bowl: multi-layered fundamental + rich warm harmonics
      const frequencies = [261.63, 523.25, 784.88, 1046.5]; // C4, C5, G5, C6
      const weights = [0.6, 0.3, 0.15, 0.08];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(weights[idx] * 0.7, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8 + idx * 0.4);

        osc.connect(gain);
        gain.connect(gainMaster);

        osc.start(now);
        osc.stop(now + 3.2);
      });
    } else if (type === 'marimba') {
      // Marimba: Two sweet warm notes (E5 -> A5)
      const notes = [
        { freq: 659.25, time: 0 },
        { freq: 880.0, time: 0.16 },
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.exponentialRampToValueAtTime(0.8, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + 1.2);

        osc.connect(gain);
        gain.connect(gainMaster);

        osc.start(now + time);
        osc.stop(now + time + 1.3);
      });
    } else if (type === 'digital') {
      // Digital Focus Ping: 3 brief ascending gentle clicks/tones (C6, E6, G6)
      const arpeggio = [1046.5, 1318.5, 1567.98];
      arpeggio.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        gain.gain.setValueAtTime(0.01, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.4, now + i * 0.09 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(gainMaster);

        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.4);
      });
    } else {
      // Bell (Default crystal meditation bell)
      const freqs = [587.33, 1174.66, 1760.0]; // D5, D6, A6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.5 / (idx + 1), now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(gainMaster);

        osc.start(now);
        osc.stop(now + 2.4);
      });
    }
  } catch (err) {
    console.warn('Audio playback not permitted yet or failed:', err);
  }
}

// Global ambient noise generator state
interface ActiveAmbientNodes {
  masterGain: GainNode;
  sources: (AudioNode | { stop: () => void })[];
  type: BuiltInAmbientSound;
}

let activeAmbient: ActiveAmbientNodes | null = null;

/**
 * Creates noise buffer (White/Pink)
 */
function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBuffer {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    // Brown noise (warm rumble)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  }

  return buffer;
}

/**
 * Start or update continuous built-in ambient soundscape synthesizer
 */
export function setAmbientSound(sound: BuiltInAmbientSound, volume: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (sound === 'none' || volume <= 0) {
    if (activeAmbient) {
      try {
        activeAmbient.masterGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
        const toClean = activeAmbient;
        setTimeout(() => {
          toClean.sources.forEach((s) => {
            if ('stop' in s && typeof s.stop === 'function') s.stop();
            if ('disconnect' in s && typeof s.disconnect === 'function') (s as AudioNode).disconnect();
          });
        }, 300);
      } catch {
        // ignore
      }
      activeAmbient = null;
    }
    return;
  }

  const volLevel = Math.max(0, Math.min(1, volume / 100));

  // If already playing this ambient type, just adjust volume smoothly
  if (activeAmbient && activeAmbient.type === sound) {
    activeAmbient.masterGain.gain.setTargetAtTime(volLevel, ctx.currentTime, 0.1);
    return;
  }

  // Stop previous
  if (activeAmbient) {
    try {
      activeAmbient.sources.forEach((s) => {
        if ('stop' in s && typeof s.stop === 'function') s.stop();
      });
    } catch {
      // ignore
    }
    activeAmbient = null;
  }

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
  masterGain.gain.setTargetAtTime(volLevel, ctx.currentTime, 0.3);
  masterGain.connect(ctx.destination);

  const sourcesList: (AudioNode | { stop: () => void })[] = [];

  if (sound === 'rain') {
    // Rain: Pink noise through bandpass + lowpass filters + subtle crackle
    const pinkBuf = createNoiseBuffer(ctx, 'pink');
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = pinkBuf;
    noiseSource.loop = true;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(1200, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.setValueAtTime(250, ctx.currentTime);

    noiseSource.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(masterGain);

    noiseSource.start();
    sourcesList.push(noiseSource);
  } else if (sound === 'waves') {
    // Ocean Waves: Brown noise modulated with very slow LFO
    const brownBuf = createNoiseBuffer(ctx, 'brown');
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = brownBuf;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.4, ctx.currentTime);

    // LFO for wave swells (0.1 Hz)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.3, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(masterGain);

    noiseSource.start();
    lfo.start();
    sourcesList.push(noiseSource, lfo);
  } else if (sound === 'binaural') {
    // 432Hz Alpha Waves (Binaural Beats: Left 432Hz, Right 442Hz = 10Hz Alpha Focus)
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(216, ctx.currentTime);

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(226, ctx.currentTime); // 10Hz beat

    const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    if (pannerLeft && pannerRight) {
      pannerLeft.pan.setValueAtTime(-0.8, ctx.currentTime);
      pannerRight.pan.setValueAtTime(0.8, ctx.currentTime);
      oscLeft.connect(pannerLeft);
      pannerLeft.connect(masterGain);
      oscRight.connect(pannerRight);
      pannerRight.connect(masterGain);
    } else {
      oscLeft.connect(masterGain);
      oscRight.connect(masterGain);
    }

    oscLeft.start();
    oscRight.start();
    sourcesList.push(oscLeft, oscRight);
  } else if (sound === 'forest') {
    // Forest Breeze & Soft Atmosphere
    const pinkBuf = createNoiseBuffer(ctx, 'pink');
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = pinkBuf;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.Q.setValueAtTime(0.8, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(masterGain);
    noiseSource.start();
    sourcesList.push(noiseSource);
  } else if (sound === 'fireplace') {
    // Fireplace: Low rumble + crackle
    const brownBuf = createNoiseBuffer(ctx, 'brown');
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = brownBuf;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(masterGain);
    noiseSource.start();
    sourcesList.push(noiseSource);
  } else {
    // White Noise
    const whiteBuf = createNoiseBuffer(ctx, 'white');
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = whiteBuf;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(masterGain);
    noiseSource.start();
    sourcesList.push(noiseSource);
  }

  activeAmbient = {
    masterGain,
    sources: sourcesList,
    type: sound,
  };
}
