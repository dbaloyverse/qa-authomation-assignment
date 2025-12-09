import { Injectable, signal, computed } from '@angular/core';
import { Task } from '../models/task.model';
import { Priority, TaskStatus } from '../models/enums';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private _tasks = signal<Task[]>([]);
  private _isInitialized = signal(false);

  readonly tasks = this._tasks.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();

  readonly todoTasks = computed(() =>
    this._tasks().filter(t => t.status === TaskStatus.Todo)
  );

  readonly inProgressTasks = computed(() =>
    this._tasks().filter(t => t.status === TaskStatus.InProgress)
  );

  readonly doneTasks = computed(() =>
    this._tasks().filter(t => t.status === TaskStatus.Done)
  );

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {}

  /**
   * Initialize with sample tasks (simulates API call)
   * Delay: 1000-2000ms
   */
  async initialize(): Promise<void> {
    if (this._isInitialized()) return;

    await this.loadingService.withLoading(
      async () => {
        const sampleTasks = this.getSampleTasks();
        this._tasks.set(sampleTasks);
        this._isInitialized.set(true);
      },
      500,
      800
    );
  }

  /**
   * Create a new task
   * Delay: 800-1200ms
   */
  async createTask(title: string, description: string, priority: Priority): Promise<Task> {
    const newTask: Task = {
      id: this.generateId(),
      title,
      description,
      priority,
      status: TaskStatus.Todo,
      createdAt: new Date()
    };

    await this.loadingService.withLoading(
      async () => {
        this._tasks.update(tasks => [...tasks, newTask]);
      },
      800,
      1200
    );

    this.toastService.success('Task created successfully');
    return newTask;
  }

  /**
   * Move task to the next status
   * Delay: 400-700ms
   */
  async moveTaskForward(taskId: string): Promise<void> {
    await this.loadingService.withLoading(
      async () => {
        this._tasks.update(tasks =>
          tasks.map(task => {
            if (task.id !== taskId) return task;

            // Generate new ID to simulate re-rendering (stale element challenge)
            const newId = this.generateId();

            let newStatus: TaskStatus;
            switch (task.status) {
              case TaskStatus.Todo:
                newStatus = TaskStatus.InProgress;
                break;
              case TaskStatus.InProgress:
                newStatus = TaskStatus.Done;
                break;
              default:
                return task; // Already done, no change
            }

            return { ...task, id: newId, status: newStatus };
          })
        );
      },
      400,
      700
    );

    this.toastService.success('Task moved successfully');
  }

  /**
   * Delete a task
   * Delay: 300-500ms
   */
  async deleteTask(taskId: string): Promise<void> {
    await this.loadingService.withLoading(
      async () => {
        this._tasks.update(tasks => tasks.filter(t => t.id !== taskId));
      },
      300,
      500
    );

    this.toastService.success('Task deleted successfully');
  }

  /**
   * Search tasks by title (with simulated API delay)
   * Delay: 200-400ms
   */
  async searchTasks(query: string): Promise<Task[]> {
    // Simulate API delay
    await new Promise(resolve =>
      setTimeout(resolve, this.randomDelay(200, 400))
    );

    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return this._tasks().filter(task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
    );
  }

  getTaskById(id: string): Task | undefined {
    return this._tasks().find(t => t.id === id);
  }

  private getSampleTasks(): Task[] {
    return [
      {
        id: this.generateId(),
        title: 'Setup project repository',
        description: 'Initialize Git repo and configure CI/CD pipeline',
        priority: Priority.High,
        status: TaskStatus.Done,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        id: this.generateId(),
        title: 'Design database schema',
        description: 'Create ERD and define table structures for user and task entities',
        priority: Priority.High,
        status: TaskStatus.Done,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        id: this.generateId(),
        title: 'Implement user authentication',
        description: 'Add login, registration, and JWT token handling',
        priority: Priority.High,
        status: TaskStatus.InProgress,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        id: this.generateId(),
        title: 'Create API endpoints',
        description: 'Build REST API for task CRUD operations',
        priority: Priority.Medium,
        status: TaskStatus.Todo,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: this.generateId(),
        title: 'Write unit tests',
        description: 'Add test coverage for services and components',
        priority: Priority.Low,
        status: TaskStatus.Todo,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
