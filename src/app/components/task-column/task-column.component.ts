import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [TaskCardComponent],
  template: `
    <div class="column" [id]="columnId">
      <h3 class="column-header">
        {{ title }}
        <span class="count">{{ tasks.length }}</span>
      </h3>
      <div class="task-list" [id]="listId">
        @for (task of tasks; track task.id) {
          <app-task-card
            [task]="task"
            [highlighted]="task.id === highlightedTaskId"
            (moveForward)="onMoveForward($event)"
            (delete)="onDelete($event)"
          />
        } @empty {
          <div class="empty-state">
            <span class="empty-icon">📭</span>
            <span class="empty-text">No tasks</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .column {
      background: #f3f4f6;
      border-radius: 12px;
      padding: 16px;
      min-height: 400px;
      display: flex;
      flex-direction: column;
    }

    .column-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    }

    .count {
      background: #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #9ca3af;
    }

    .empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .empty-text {
      font-size: 14px;
    }
  `]
})
export class TaskColumnComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) tasks!: Task[];
  @Input({ required: true }) columnId!: string;
  @Input({ required: true }) listId!: string;
  @Input() highlightedTaskId: string | null = null;

  @Output() moveForward = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  onMoveForward(taskId: string): void {
    this.moveForward.emit(taskId);
  }

  onDelete(taskId: string): void {
    this.delete.emit(taskId);
  }
}
