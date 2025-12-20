import React from 'react';

export const NewsTicker: React.FC<{ news: string[] }> = ({ news }) => {
  return (
    <div className="bg-red-900/90 text-white p-2 border-t-2 border-red-700 overflow-hidden relative h-10 flex items-center">
      <div className="absolute left-0 bg-red-800 px-3 py-1 text-xs font-bold z-10 shadow-md">
        市场动态
      </div>
      <div className="animate-marquee whitespace-nowrap pl-24 text-sm font-light">
        {news.length > 0 ? news[news.length - 1] : "等待游戏开始..."} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; {news.length > 1 ? news[news.length - 2] : ""}
      </div>
    </div>
  );
};