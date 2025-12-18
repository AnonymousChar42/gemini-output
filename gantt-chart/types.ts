
export interface GanttTask {
  id: string;
  rowId: string;
  label: string;
  startTime: number; // timestamp
  endTime: number;   // timestamp
  color?: string;
  data?: any;
}

export interface GanttRow {
  id: string;
  label: string;
  subLabel?: string;
}

export interface GanttDimensions {
  rowHeight: number;
  columnWidth: number; // width per hour
  sidebarWidth: number;
  headerHeight: number;
}

export interface GanttConfig {
  startDate: number;
  endDate: number;
  dimensions: GanttDimensions;
}
