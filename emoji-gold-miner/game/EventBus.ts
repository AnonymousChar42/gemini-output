import Phaser from 'phaser';

// Global event emitter to talk between React and Phaser
export const EventBus = new Phaser.Events.EventEmitter();

export enum GameEvents {
  SCORE_CHANGE = 'score-change',
  TIME_CHANGE = 'time-change',
  LEVEL_CHANGE = 'level-change',
  GAME_OVER = 'game-over',
  LEVEL_COMPLETE = 'level-complete',
  START_GAME = 'start-game',
}
