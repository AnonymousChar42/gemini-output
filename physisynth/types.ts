export interface SynthParams {
  decay: number;       // 0.1 to 5.0 (Seconds)
  material: number;    // 0.0 (Wood) to 1.0 (Metal/Glass) - affects harmonic ratios
  hardness: number;    // 0.0 to 1.0 - affects attack sharpness and high freq gain
  brightness: number;  // 0.0 to 1.0 - global filter cutoff modifier
  detune: number;      // 0.0 to 1.0 - inharmonicity
}

export interface NoteInfo {
  note: string;
  freq: number;
  active: boolean;
}

export const DEFAULT_PARAMS: SynthParams = {
  decay: 2.5,
  material: 0.9, // Glockenspiel-ish
  hardness: 0.8,
  brightness: 0.7,
  detune: 0.1
};