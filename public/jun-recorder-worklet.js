// Jun's microphone worklet: mono input at the device's own rate, resampled to the 16 kHz
// 16-bit PCM Gemini Live expects, posted in batches of 1024 samples (64 ms).
// It resamples itself because Firefox refuses to connect a microphone to an
// AudioContext running at a different rate than the device.
const TARGET_RATE = 16000;
const BATCH = 1024;

class JunRecorder extends AudioWorkletProcessor {
  constructor() {
    super();
    this.step = sampleRate / TARGET_RATE; // input samples per output sample
    this.pos = 0; // read position into the carried-over input, in input samples
    this.carry = new Float32Array(0);
    this.batch = new Int16Array(BATCH);
    this.filled = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel) return true;
    const input = new Float32Array(this.carry.length + channel.length);
    input.set(this.carry);
    input.set(channel, this.carry.length);

    while (this.pos + 1 < input.length) {
      const i = Math.floor(this.pos);
      const t = this.pos - i;
      const s = Math.max(-1, Math.min(1, input[i] * (1 - t) + input[i + 1] * t));
      this.batch[this.filled++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.filled === BATCH) {
        const out = this.batch.buffer;
        this.port.postMessage(out, [out]);
        this.batch = new Int16Array(BATCH);
        this.filled = 0;
      }
      this.pos += this.step;
    }
    const keep = Math.floor(this.pos);
    this.carry = input.slice(keep);
    this.pos -= keep;
    return true;
  }
}

registerProcessor("jun-recorder", JunRecorder);
