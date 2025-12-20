import React, { useState } from 'react';
import { GameScreen, LevelConfig, WeaponType, GameStats } from './types';
import { GameEngine } from './components/GameEngine';
import { MainMenu, LevelSelect, Compendium, GameOver } from './components/Screens';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(GameScreen.MENU);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>(WeaponType.PISTOL);
  const [lastStats, setLastStats] = useState<GameStats | null>(null);

  const startGame = (level: LevelConfig, weapon: WeaponType) => {
    setCurrentLevel(level);
    setCurrentWeapon(weapon);
    setCurrentScreen(GameScreen.PLAYING);
  };

  const handleGameOver = (stats: GameStats) => {
    setLastStats(stats);
    setCurrentScreen(GameScreen.GAME_OVER);
  };

  const handleRestart = () => {
    if (currentLevel && currentWeapon) {
        setCurrentScreen(GameScreen.PLAYING);
    } else {
        setCurrentScreen(GameScreen.LEVEL_SELECT);
    }
  };

  return (
    <div className="w-screen h-screen bg-black text-white font-sans overflow-hidden">
      
      {currentScreen === GameScreen.MENU && (
        <MainMenu 
          onStart={() => setCurrentScreen(GameScreen.LEVEL_SELECT)}
          onCompendium={() => setCurrentScreen(GameScreen.COMPENDIUM)}
        />
      )}

      {currentScreen === GameScreen.LEVEL_SELECT && (
        <LevelSelect 
          onBack={() => setCurrentScreen(GameScreen.MENU)}
          onSelect={startGame}
        />
      )}

      {currentScreen === GameScreen.COMPENDIUM && (
        <Compendium onBack={() => setCurrentScreen(GameScreen.MENU)} />
      )}

      {currentScreen === GameScreen.PLAYING && currentLevel && (
        <GameEngine 
          level={currentLevel}
          selectedWeapon={currentWeapon}
          onGameOver={handleGameOver}
          onExit={() => setCurrentScreen(GameScreen.MENU)}
        />
      )}

      {currentScreen === GameScreen.GAME_OVER && lastStats && (
        <>
            {/* We render the game engine in background paused? Or just a screenshot? 
                For simplicity, we render a blurred background image or just overlay on black */}
            <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=4')] bg-cover opacity-30"></div>
            <GameOver 
            stats={lastStats}
            onRestart={handleRestart}
            onMenu={() => setCurrentScreen(GameScreen.MENU)}
            />
        </>
      )}
    </div>
  );
}