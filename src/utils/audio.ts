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
      // Tibetan Singing Bowl
      const frequencies = [261.63, 523.25, 784.88, 1046.5];
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
      // Marimba notes (E5 -> A5)
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
      // Digital Focus Ping
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
      // Bell
      const freqs = [587.33, 1174.66, 1760.0];
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
    console.warn('Audio chime playback failed:', err);
  }
}

// Map of royalty-free, high-quality, loopable ambient audio tracks (CC0 / Public Domain)
export const AMBIENT_AUDIO_URLS: Partial<Record<BuiltInAmbientSound, string>> = {
  light_rain: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/rain/light-rain.mp3',
  heavy_rain: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/rain/heavy-rain.mp3',
  rain_on_tent: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/rain/rain-on-tent.mp3',
  thunderstorm: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/rain/thunder.mp3',
  waves: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/nature/waves.mp3',
  waterfall: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/nature/waterfall.mp3',
  river: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/nature/river.mp3',
  birds: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/animals/birds.mp3',
  fireplace: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/nature/campfire.mp3',
  campfire: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/nature/campfire.mp3',
  summer_night: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/animals/crickets.mp3',
  wind: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/nature/wind-in-trees.mp3',
  street_cafe: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/places/cafe.mp3',
  japanese_library: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/places/library.mp3',
  commuter_train: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/transport/inside-a-train.mp3',
  wind_chimes: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/things/wind-chimes.mp3',
  keyboard: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/things/keyboard.mp3',
  record_player: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/things/vinyl-effect.mp3',
  clock: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/things/clock.mp3',
  cat_purr: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/animals/cat-purring.mp3',
  room_fan: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/things/ceiling-fan.mp3',
  whales: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/animals/whale.mp3',
  underwater: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/places/underwater.mp3',
  // Aliases
  rain: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/rain/light-rain.mp3',
  forest: 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds/animals/birds.mp3',
};

// Multi-track audio engine state
interface ActiveSynthState {
  masterGain: GainNode;
  sources: (AudioNode | { stop: () => void })[];
  timers: number[];
  type: BuiltInAmbientSound;
}

const activeAudioElements = new Map<string, HTMLAudioElement>();
const activeSynths = new Map<string, ActiveSynthState>();

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
    // Brown noise
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
 * Stop a single active sound
 */
export function stopSingleAmbientSound(sound: BuiltInAmbientSound): void {
  // Stop audio element if present
  const audio = activeAudioElements.get(sound);
  if (audio) {
    try {
      audio.pause();
      audio.src = '';
      audio.load();
    } catch {
      // Ignored
    }
    activeAudioElements.delete(sound);
  }

  // Stop synth if present
  const synth = activeSynths.get(sound);
  if (synth) {
    synth.timers.forEach((t) => clearInterval(t));
    synth.sources.forEach((s) => {
      try {
        if ('stop' in s && typeof s.stop === 'function') {
          s.stop();
        }
        if ('disconnect' in s && typeof s.disconnect === 'function') {
          s.disconnect();
        }
      } catch {
        // Ignored
      }
    });
    try {
      synth.masterGain.disconnect();
    } catch {
      // Ignored
    }
    activeSynths.delete(sound);
  }
}

/**
 * Stops all currently active ambient sounds
 */
export function stopAllAmbientSounds(): void {
  activeAudioElements.forEach((audio) => {
    try {
      audio.pause();
      audio.src = '';
      audio.load();
    } catch {
      // Ignored
    }
  });
  activeAudioElements.clear();

  activeSynths.forEach((synth) => {
    synth.timers.forEach((t) => clearInterval(t));
    synth.sources.forEach((s) => {
      try {
        if ('stop' in s && typeof s.stop === 'function') {
          s.stop();
        }
        if ('disconnect' in s && typeof s.disconnect === 'function') {
          s.disconnect();
        }
      } catch {
        // Ignored
      }
    });
    try {
      synth.masterGain.disconnect();
    } catch {
      // Ignored
    }
  });
  activeSynths.clear();
}

/**
 * Sets or adjusts the volume of an individual ambient sound track (0 to 100).
 * If volume is 0 or sound is 'none', it stops that individual sound.
 * Multi-sound playback allows many sound tracks to run simultaneously.
 */
export function setMultiAmbientSound(sound: BuiltInAmbientSound, volume: number): void {
  if (sound === 'none' || volume <= 0) {
    stopSingleAmbientSound(sound);
    return;
  }

  const normalizedVol = Math.max(0, Math.min(1, volume / 100));

  // 1. Check if audio element already playing
  const existingAudio = activeAudioElements.get(sound);
  if (existingAudio) {
    existingAudio.volume = normalizedVol;
    if (existingAudio.paused) {
      existingAudio.play().catch(() => {});
    }
    return;
  }

  // 2. Check if synth already playing
  const existingSynth = activeSynths.get(sound);
  if (existingSynth) {
    const ctx = getAudioContext();
    if (ctx) {
      existingSynth.masterGain.gain.setValueAtTime(normalizedVol, ctx.currentTime);
    }
    return;
  }

  // 3. Start new audio element if track URL exists
  const audioUrl = AMBIENT_AUDIO_URLS[sound];
  if (audioUrl) {
    try {
      const audio = new Audio();
      audio.src = audioUrl;
      audio.crossOrigin = 'anonymous';
      audio.loop = true;
      audio.volume = normalizedVol;
      audio.preload = 'auto';

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`Ambient track ${sound} autoplay waiting for gesture:`, err);
        });
      }

      activeAudioElements.set(sound, audio);
      return;
    } catch (err) {
      console.warn(`Failed to play audio track ${sound}:`, err);
    }
  }

  // 4. Synthesized Web Audio for pure noises and binaural beats
  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(normalizedVol, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const sourcesList: (AudioNode | { stop: () => void })[] = [];
  const timersList: number[] = [];

  const addNoise = (type: 'white' | 'pink' | 'brown') => {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, type);
    src.loop = true;
    sourcesList.push(src);
    return src;
  };

  const createPanner = (pan: number) => {
    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, ctx.currentTime);
      return panner;
    }
    return null;
  };

  if (sound === 'whitenoise') {
    const white = addNoise('white');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3800, ctx.currentTime);
    white.connect(lp);
    lp.connect(masterGain);
    white.start();
  } else if (sound === 'pinknoise') {
    const pink = addNoise('pink');
    pink.connect(masterGain);
    pink.start();
  } else if (sound === 'brownnoise') {
    const brown = addNoise('brown');
    brown.connect(masterGain);
    brown.start();
  } else if (sound === 'binaural_gamma') {
    // 40Hz Gamma beat (Peak cognition)
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    left.type = 'sine';
    right.type = 'sine';
    left.frequency.setValueAtTime(200, ctx.currentTime);
    right.frequency.setValueAtTime(240, ctx.currentTime);

    const panL = createPanner(-0.85);
    const panR = createPanner(0.85);
    if (panL && panR) {
      left.connect(panL);
      panL.connect(masterGain);
      right.connect(panR);
      panR.connect(masterGain);
    } else {
      left.connect(masterGain);
      right.connect(masterGain);
    }
    left.start();
    right.start();
    sourcesList.push(left, right);
  } else if (sound === 'binaural_beta') {
    // 20Hz Beta beat (High alertness)
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    left.type = 'sine';
    right.type = 'sine';
    left.frequency.setValueAtTime(200, ctx.currentTime);
    right.frequency.setValueAtTime(220, ctx.currentTime);

    const panL = createPanner(-0.85);
    const panR = createPanner(0.85);
    if (panL && panR) {
      left.connect(panL);
      panL.connect(masterGain);
      right.connect(panR);
      panR.connect(masterGain);
    } else {
      left.connect(masterGain);
      right.connect(masterGain);
    }
    left.start();
    right.start();
    sourcesList.push(left, right);
  } else if (sound === 'binaural_alpha' || sound === 'binaural') {
    // 10Hz Alpha beat (Relaxed flow state)
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    left.type = 'sine';
    right.type = 'sine';
    left.frequency.setValueAtTime(216, ctx.currentTime);
    right.frequency.setValueAtTime(226, ctx.currentTime);

    const panL = createPanner(-0.85);
    const panR = createPanner(0.85);
    if (panL && panR) {
      left.connect(panL);
      panL.connect(masterGain);
      right.connect(panR);
      panR.connect(masterGain);
    } else {
      left.connect(masterGain);
      right.connect(masterGain);
    }
    left.start();
    right.start();
    sourcesList.push(left, right);
  } else if (sound === 'binaural_theta') {
    // 6Hz Theta beat (Deep meditation)
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    left.type = 'sine';
    right.type = 'sine';
    left.frequency.setValueAtTime(200, ctx.currentTime);
    right.frequency.setValueAtTime(206, ctx.currentTime);

    const panL = createPanner(-0.85);
    const panR = createPanner(0.85);
    if (panL && panR) {
      left.connect(panL);
      panL.connect(masterGain);
      right.connect(panR);
      panR.connect(masterGain);
    } else {
      left.connect(masterGain);
      right.connect(masterGain);
    }
    left.start();
    right.start();
    sourcesList.push(left, right);
  } else if (sound === 'binaural_delta') {
    // 2.5Hz Delta beat (Restorative sleep)
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    left.type = 'sine';
    right.type = 'sine';
    left.frequency.setValueAtTime(150, ctx.currentTime);
    right.frequency.setValueAtTime(152.5, ctx.currentTime);

    const panL = createPanner(-0.85);
    const panR = createPanner(0.85);
    if (panL && panR) {
      left.connect(panL);
      panL.connect(masterGain);
      right.connect(panR);
      panR.connect(masterGain);
    } else {
      left.connect(masterGain);
      right.connect(masterGain);
    }
    left.start();
    right.start();
    sourcesList.push(left, right);
  }

  activeSynths.set(sound, {
    masterGain,
    sources: sourcesList,
    timers: timersList,
    type: sound,
  });
}

/**
 * Synchronizes an active sound map Record<soundId, volume> with the master volume/mute.
 */
export function syncActiveAmbientMix(
  activeSounds: Record<string, number>,
  masterVolume = 100,
  isMuted = false
): void {
  const allCurrentKeys = new Set([
    ...Array.from(activeAudioElements.keys()),
    ...Array.from(activeSynths.keys()),
  ]);

  // Master scale factor
  const masterScale = isMuted ? 0 : Math.max(0, Math.min(1, masterVolume / 100));

  // 1. Update or start all sounds in the active map
  Object.entries(activeSounds).forEach(([soundId, rawVol]) => {
    const effectiveVol = rawVol * masterScale;
    if (effectiveVol > 0) {
      setMultiAmbientSound(soundId as BuiltInAmbientSound, effectiveVol);
      allCurrentKeys.delete(soundId);
    } else {
      stopSingleAmbientSound(soundId as BuiltInAmbientSound);
      allCurrentKeys.delete(soundId);
    }
  });

  // 2. Stop any remaining sounds not in the active map
  allCurrentKeys.forEach((soundId) => {
    stopSingleAmbientSound(soundId as BuiltInAmbientSound);
  });
}

/**
 * Single sound setter for backwards compatibility
 */
export function setAmbientSound(sound: BuiltInAmbientSound, volume: number): void {
  if (sound === 'none' || volume <= 0) {
    stopAllAmbientSounds();
    return;
  }
  stopAllAmbientSounds();
  setMultiAmbientSound(sound, volume);
}
