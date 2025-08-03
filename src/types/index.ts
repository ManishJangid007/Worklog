export interface Task {
  id: string;
  description: string;
  projectId: string;
  date: string;
  completed?: boolean;
}

export interface Project {
  id: string;
  name: string;
  hoursSpent?: number;
}

export interface DailyTask {
  id: string;
  date: string;
  projects: Project[];
  tasks: Task[];
}

export interface Theme {
  mode: 'light' | 'dark';
}

export interface BackupData {
  dailyTasks: DailyTask[];
  projects: Project[];
  version: string;
  timestamp: string;
} 