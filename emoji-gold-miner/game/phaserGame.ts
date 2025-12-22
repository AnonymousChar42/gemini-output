import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { GAME_WIDTH, GAME_HEIGHT } from './Constants';

export const createGame = (parent: string) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#87CEEB', // Sky blue fallback
    scene: [MainScene],
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };

  return new Phaser.Game(config);
};
