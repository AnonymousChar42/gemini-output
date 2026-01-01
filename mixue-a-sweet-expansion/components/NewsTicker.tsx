import React from 'react';

export const NewsTicker: React.FC<{ news: string[] }> = ({ news }) => {
  const latestNews = news.length > 0 ? news[news.length - 1] : "等待游戏开始... ⛄";
  // Create a key based on content and length to trigger animation on new messages
  // Even if the same message repeats (unlikely), if length changes (before cap), it animates.
  const key = `${news.length}-${latestNews.substring(0, 20)}`; 

  return (
    <div className="bg-gray-900 text-white border-t border-red-800 overflow-hidden relative h-10 flex items-center w-full z-30 shadow-xl">
      <div className="absolute left-0 h-full bg-red-900 px-4 flex items-center justify-center text-xs font-bold z-20 shadow-[2px_0_10px_rgba(0,0,0,0.5)] min-w-[6rem] border-r border-red-700">
        <span className="mr-2">📢</span> 市场动态
      </div>
      
      <div className="flex-1 h-full relative ml-24 overflow-hidden bg-gradient-to-r from-red-900/20 to-transparent">
         {/* Key forces remount on text change, triggering the CSS animation */}
         <div key={key} className="absolute inset-0 flex items-center px-4 animate-news-slide-up">
            <span className="text-sm font-medium tracking-wide truncate w-full block text-gray-100">
                {latestNews}
            </span>
         </div>
      </div>
      
      <style>{`
        @keyframes newsSlideUp {
          0% { transform: translateY(120%); opacity: 0; filter: blur(2px); }
          100% { transform: translateY(0); opacity: 1; filter: blur(0); }
        }
        .animate-news-slide-up {
          animation: newsSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};