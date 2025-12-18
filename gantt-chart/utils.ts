
export const MS_PER_HOUR = 3600000;
export const MS_PER_DAY = MS_PER_HOUR * 24;

export const timeToX = (time: number, start: number, columnWidth: number): number => {
  const diffHours = (time - start) / MS_PER_HOUR;
  return diffHours * columnWidth;
};

export const xToTime = (x: number, start: number, columnWidth: number): number => {
  const hours = x / columnWidth;
  return start + (hours * MS_PER_HOUR);
};

export const formatDate = (timestamp: number): string => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

export const formatTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const generateMockData = (rowCount: number, days: number) => {
  const startDate = new Date().setHours(0, 0, 0, 0);
  const rows: any[] = [];
  const tasks: any[] = [];
  
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 
    'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
    'bg-cyan-500', 'bg-fuchsia-500'
  ];

  for (let i = 0; i < rowCount; i++) {
    const flightNum = `FL${1000 + i}`;
    rows.push({
      id: `row-${i}`,
      label: flightNum,
      subLabel: `A320 / GATE ${Math.floor(Math.random() * 50) + 1}`
    });

    // Each row gets 2-3 tasks distributed over the days
    const taskCount = Math.floor(Math.random() * 2) + 2;
    for (let j = 0; j < taskCount; j++) {
      const dayOffset = Math.floor(Math.random() * days);
      const hourOffset = Math.floor(Math.random() * 18) + 2;
      const durationHours = Math.floor(Math.random() * 6) + 2;
      
      const start = startDate + (dayOffset * MS_PER_DAY) + (hourOffset * MS_PER_HOUR);
      const end = start + (durationHours * MS_PER_HOUR);

      tasks.push({
        id: `task-${i}-${j}`,
        rowId: `row-${i}`,
        label: `${flightNum}-S${j}`,
        startTime: start,
        endTime: end,
        color: colors[i % colors.length]
      });
    }
  }

  return { rows, tasks, startDate };
};
