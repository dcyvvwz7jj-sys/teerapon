// ============================================================
// LEARN FIGHT — Audio System (Web Audio API Synthesizer)
// ============================================================

let actx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let ambienceGain: GainNode | null = null;
let currentAmbience: OscillatorNode | AudioBufferSourceNode | null = null;

export function initAudio() {
  if (!actx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    actx = new AudioContextClass();
    
    masterGain = actx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(actx.destination);

    sfxGain = actx.createGain();
    sfxGain.gain.value = 0.8;
    sfxGain.connect(masterGain);

    ambienceGain = actx.createGain();
    ambienceGain.gain.value = 0.3;
    ambienceGain.connect(masterGain);

    // Try to resume if it was suspended by browser policy
    if (actx.state === 'suspended') {
      actx.resume();
    }
  }
}

function createNoiseBuffer(duration: number): AudioBuffer | null {
  if (!actx) return null;
  const bufferSize = actx.sampleRate * duration;
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playGymAmbience() {
  if (!actx || !ambienceGain) return;
  stopAmbience();
  
  const buffer = createNoiseBuffer(2);
  if (!buffer) return;
  
  const noise = actx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = actx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400; // Muffled gym hum
  
  noise.connect(filter);
  filter.connect(ambienceGain);
  noise.start();
  currentAmbience = noise;
}

export function playArenaAmbience() {
  if (!actx || !ambienceGain) return;
  stopAmbience();
  
  const buffer = createNoiseBuffer(2);
  if (!buffer) return;
  
  const noise = actx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = actx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.5;
  
  noise.connect(filter);
  filter.connect(ambienceGain);
  noise.start();
  currentAmbience = noise;
}

export function stopAmbience() {
  if (currentAmbience) {
    try { currentAmbience.stop(); } catch(e) {}
    currentAmbience.disconnect();
    currentAmbience = null;
  }
}

export function playPunchSound(isCritical = false) {
  if (!actx || !sfxGain) return;
  const t = actx.currentTime;
  
  // Low thud
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isCritical ? 120 : 150, t);
  osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.3);
  gain.gain.setValueAtTime(isCritical ? 1.5 : 1, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.3);

  // High snap
  const noiseBuffer = createNoiseBuffer(0.1);
  if (noiseBuffer) {
    const noise = actx.createBufferSource();
    noise.buffer = noiseBuffer;
    const nFilter = actx.createBiquadFilter();
    nFilter.type = 'highpass';
    nFilter.frequency.value = 1000;
    const nGain = actx.createGain();
    nGain.gain.setValueAtTime(isCritical ? 1.0 : 0.5, t);
    nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(sfxGain);
    noise.start(t);
  }
}

export function playKickSound(isCritical = false) {
  if (!actx || !sfxGain) return;
  const t = actx.currentTime;
  
  // Deep thud
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(isCritical ? 100 : 120, t);
  osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.4);
  gain.gain.setValueAtTime(isCritical ? 1.8 : 1.2, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.4);

  // Noise smack
  const noiseBuffer = createNoiseBuffer(0.15);
  if (noiseBuffer) {
    const noise = actx.createBufferSource();
    noise.buffer = noiseBuffer;
    const nGain = actx.createGain();
    nGain.gain.setValueAtTime(isCritical ? 1.2 : 0.7, t);
    nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noise.connect(nGain);
    nGain.connect(sfxGain);
    noise.start(t);
  }
}

export function playBlockSound() {
  if (!actx || !sfxGain) return;
  const t = actx.currentTime;
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
  const filter = actx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  gain.gain.setValueAtTime(0.6, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.15);
}

export function playDodgeSound() {
  if (!actx || !sfxGain) return;
  const t = actx.currentTime;
  const noiseBuffer = createNoiseBuffer(0.3);
  if (!noiseBuffer) return;
  const noise = actx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = actx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, t);
  filter.frequency.exponentialRampToValueAtTime(100, t + 0.3);
  filter.Q.value = 5;
  const gain = actx.createGain();
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  noise.start(t);
}

export function playKnockdownSound() {
  if (!actx || !sfxGain) return;
  playKickSound(true); // Big thud
  const t = actx.currentTime;
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(20, t + 1.0);
  gain.gain.setValueAtTime(1.5, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 1.0);
}

export function playCrowdCheer() {
  if (!actx || !sfxGain) return;
  const t = actx.currentTime;
  const noiseBuffer = createNoiseBuffer(3.0);
  if (!noiseBuffer) return;
  const noise = actx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = actx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;
  const gain = actx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.6, t + 1.0);
  gain.gain.linearRampToValueAtTime(0, t + 3.0);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  noise.start(t);
}

export function playBellSound() {
  if (!actx || !sfxGain) return;
  const ctx = actx;
  const gainNode = sfxGain;
  const t = ctx.currentTime;
  [1200, 1500, 1800].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, t + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 1.5);
    osc.connect(gain);
    gain.connect(gainNode);
    osc.start(t + i * 0.1);
    osc.stop(t + i * 0.1 + 1.5);
  });
}

export function playUIClick() {
  if (!actx || !sfxGain) return;
  initAudio();
  const t = actx.currentTime;
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 0.05);
}

export function playVictorySound() {
  if (!actx || !sfxGain) return;
  const ctx = actx;
  const gainNode = sfxGain;
  const t = ctx.currentTime;
  [440, 554.37, 659.25, 880].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, t + i * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.2 + 1.0);
    osc.connect(gain);
    gain.connect(gainNode);
    osc.start(t + i * 0.2);
    osc.stop(t + i * 0.2 + 1.0);
  });
}

export function playDefeatSound() {
  if (!actx || !sfxGain) return;
  const ctx = actx;
  const gainNode = sfxGain;
  const t = ctx.currentTime;
  [300, 250, 200, 150].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, t + i * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.4 + 1.5);
    osc.connect(gain);
    gain.connect(gainNode);
    osc.start(t + i * 0.4);
    osc.stop(t + i * 0.4 + 1.5);
  });
}

export function setVolume(volume: number) {
  if (masterGain) masterGain.gain.value = volume;
}

export function stopAll() {
  if (actx) {
    actx.close();
    actx = null;
  }
}
