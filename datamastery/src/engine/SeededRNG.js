/**
 * SeededRNG — Deterministic pseudo-random number generator.
 *
 * Uses mulberry32, a fast 32-bit PRNG with good statistical properties.
 * Given the same seed, it always produces the same sequence.
 *
 * Usage:
 *   const rng = new SeededRNG(12345);
 *   rng.next();          // 0..1 float
 *   rng.int(0, 100);     // integer in [0, 100]
 *   rng.pick(array);     // random element
 *   rng.shuffle(array);  // in-place Fisher-Yates shuffle
 */
export class SeededRNG {
  constructor(seed) {
    this._state = seed >>> 0; // ensure unsigned 32-bit
  }

  /**
   * Create an RNG from a learner seed + mission-specific salt.
   * This ensures each mission gets a unique but reproducible sequence.
   */
  static forMission(learnerSeed, missionId) {
    const salt = SeededRNG.hash(missionId);
    return new SeededRNG((learnerSeed ^ salt) >>> 0);
  }

  /**
   * Simple string hash (djb2) → 32-bit unsigned integer.
   */
  static hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  /**
   * Generate a random learner seed using crypto API.
   */
  static generateLearnerSeed() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0];
  }

  /**
   * Mulberry32 core — returns float in [0, 1).
   */
  next() {
    this._state = (this._state + 0x6d2b79f5) >>> 0;
    let t = this._state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Random integer in [min, max] inclusive.
   */
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Pick a random element from an array.
   */
  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /**
   * Pick N unique elements from an array (without replacement).
   */
  pickN(arr, n) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < Math.min(n, copy.length); i++) {
      const idx = Math.floor(this.next() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }

  /**
   * Fisher-Yates shuffle (in-place). Returns the array.
   */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Weighted pick — items is [{ value, weight }].
   */
  weightedPick(items) {
    const totalWeight = items.reduce((sum, it) => sum + it.weight, 0);
    let r = this.next() * totalWeight;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item.value;
    }
    return items[items.length - 1].value;
  }

  /**
   * Generate a date string (YYYY-MM-DD) in range.
   */
  date(startYear, endYear) {
    const y = this.int(startYear, endYear);
    const m = String(this.int(1, 12)).padStart(2, '0');
    const d = String(this.int(1, 28)).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
