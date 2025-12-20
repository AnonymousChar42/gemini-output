export interface Note {
  name: string;
  octave: number;
  midi: number;
  type: 'white' | 'black';
  keyboardShortcut: string;
}

export interface AudioState {
  isPlaying: boolean;
  playbackRate: number;
}

export enum SoundSourceType {
  UPLOAD = 'UPLOAD',
  DEFAULT = 'DEFAULT'
}

export interface AnalyserData {
  dataArray: Uint8Array;
  analyser: AnalyserNode;
}