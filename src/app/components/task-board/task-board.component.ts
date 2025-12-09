import { Component, inject, Input } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { TaskColumnComponent } from '../task-column/task-column.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [TaskColumnComponent],
  template: `
    <div class="board-container">
      <app-task-column
        title="To Do"
        columnId="todo-column"
        listId="todo-list"
        [tasks]="taskService.todoTasks()"
        [highlightedTaskId]="highlightedTaskId"
        (moveForward)="onMoveForward($event)"
        (delete)="onDelete($event)"
      />

      <app-task-column
        title="In Progress"
        columnId="inprogress-column"
        listId="inprogress-list"
        [tasks]="taskService.inProgressTasks()"
        [highlightedTaskId]="highlightedTaskId"
        (moveForward)="onMoveForward($event)"
        (delete)="onDelete($event)"
      />

      <app-task-column
        title="Done"
        columnId="done-column"
        listId="done-list"
        [tasks]="taskService.doneTasks()"
        [highlightedTaskId]="highlightedTaskId"
        (moveForward)="onMoveForward($event)"
        (delete)="onDelete($event)"
      />
    </div>
  `,
  styles: [`
    .board-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .board-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .board-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TaskBoardComponent {
  @Input() highlightedTaskId: string | null = null;

  protected taskService = inject(TaskService);

  async onMoveForward(taskId: string): Promise<void> {
    await this.taskService.moveTaskForward(taskId);
  }

  async onDelete(taskId: string): Promise<void> {
    await this.taskService.deleteTask(taskId);
  }
}
