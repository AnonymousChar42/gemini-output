import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated, useTransition, config } from '@react-spring/web';
import { v4 as uuidv4 } from 'uuid';

interface ScoreBoardProps {
  score: number;
}

interface PointPopup {
  id: string;
  value: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score }) => {
  const [popups, setPopups] = useState<PointPopup[]>([]);
  const prevScoreRef = useRef(score);

  // Main score animation (bump effect)
  const [scoreAnim, api] = useSpring(() => ({
    scale: 1,
    color: '#ffffff',
    textShadow: '0px 0px 0px rgba(0,255,255,0)',
    config: { tension: 300, friction: 10 }
  }));

  useEffect(() => {
    const diff = score - prevScoreRef.current;
    
    if (diff > 0) {
      // Add floating popup
      const newPopup = { id: uuidv4(), value: diff };
      setPopups(prev => [...prev, newPopup]);
      
      // Cleanup popup after animation
      setTimeout(() => {
        setPopups(prev => prev.filter(p => p.id !== newPopup.id));
      }, 1000);

      // Trigger Score Shake/Bump
      api.start({
        from: { scale: 1.5, color: '#00ffff', textShadow: '0px 0px 20px rgba(0,255,255,0.8)' },
        to: { scale: 1, color: '#ffffff', textShadow: '0px 0px 0px rgba(0,255,255,0)' },
      });
    }

    prevScoreRef.current = score;
  }, [score, api]);

  // Transition for floating numbers
  const transitions = useTransition(popups, {
    from: { opacity: 1, transform: 'translate3d(0, 0px, 0) scale(0.5)' },
    enter: { opacity: 0, transform: 'translate3d(0, -50px, 0) scale(1.5)' },
    leave: { opacity: 0 },
    config: { duration: 800 },
  });

  return (
    <div className="relative">
      <div className="bg-black/50 backdrop-blur-md border border-cyan-500/30 p-4 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.2)] min-w-[140px] flex flex-col items-end overflow-visible">
        <div className="text-xs text-cyan-400 font-mono uppercase tracking-wider mb-1">Score</div>
        
        <div className="relative">
            <animated.div 
                style={{ 
                    scale: scoreAnim.scale,
                    color: scoreAnim.color,
                    textShadow: scoreAnim.textShadow
                }} 
                className="text-3xl font-bold font-mono leading-none"
            >
                {score}
            </animated.div>

            {/* Floating Points Container */}
            {transitions((style, item) => (
                <animated.div
                    style={style}
                    className="absolute right-0 top-0 text-yellow-400 font-bold font-mono text-xl whitespace-nowrap pointer-events-none"
                >
                    +{item.value}
                </animated.div>
            ))}
        </div>
      </div>
    </div>
  );
};
