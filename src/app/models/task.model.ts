import { Priority, TaskStatus } from './enums';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: Date;
}
