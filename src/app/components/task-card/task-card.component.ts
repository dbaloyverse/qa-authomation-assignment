import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskStatus } from '../../models/enums';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [DatePipe, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="task-card"
      [attr.data-task-id]="task.id"
      [class.priority-low]="task.priority === 'low'"
      [class.priority-medium]="task.priority === 'medium'"
      [class.priority-high]="task.priority === 'high'"
      [class.highlighted]="highlighted"
    >
      <div class="task-header">
        <span class="task-title">{{ task.title }}</span>
        <button
          class="btn-icon btn-menu"
          (click)="toggleMenu()"
          aria-label="Task menu"
        >
          ⋮
        </button>
      </div>

      @if (task.description) {
        <p class="task-description">{{ task.description }}</p>
      }

      @if (menuOpen()) {
        <div class="task-actions">
          @if (task.status !== 'done') {
            <button
              class="action-btn move-btn"
              (click)="onMoveForward()"
            >
              Move Forward →
            </button>
          }
          <button
            class="action-btn delete-btn"
            (click)="onDelete()"
          >
            Delete
          </button>
        </div>
      }

      <div class="task-footer">
        <span class="priority-badge" [class]="'priority-' + task.priority">
          {{ task.priority | titlecase }}
        </span>
        <span class="created-date">{{ task.createdAt | date:'short' }}</span>
      </div>
    </div>
  `,
  styles: [`
    .task-card {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #e5e7eb;
      transition: box-shadow 0.2s, border-color 0.2s;
    }

    .task-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .task-card.priority-low {
      border-left-color: #10b981;
    }

    .task-card.priority-medium {
      border-left-color: #f59e0b;
    }

    .task-card.priority-high {
      border-left-color: #ef4444;
    }

    .task-card.highlighted {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
      animation: highlight-pulse 2s ease-out;
    }

    @keyframes highlight-pulse {
      0% {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.8);
      }
      100% {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0);
      }
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .task-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.4;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 16px;
      color: #6b7280;
      border-radius: 4px;
      transition: background-color 0.15s;
    }

    .btn-icon:hover {
      background: #f3f4f6;
    }

    .task-description {
      font-size: 13px;
      color: #6b7280;
      margin: 8px 0;
      line-height: 1.5;
    }

    .task-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 12px 0;
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
    }

    .action-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      text-align: left;
    }

    .move-btn {
      background: #3b82f6;
      color: white;
    }

    .move-btn:hover {
      background: #2563eb;
    }

    .delete-btn {
      background: white;
      color: #ef4444;
      border: 1px solid #fecaca;
    }

    .delete-btn:hover {
      background: #fef2f2;
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .priority-badge {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .priority-badge.priority-low {
      background: #d1fae5;
      color: #065f46;
    }

    .priority-badge.priority-medium {
      background: #fef3c7;
      color: #92400e;
    }

    .priority-badge.priority-high {
      background: #fee2e2;
      color: #991b1b;
    }

    .created-date {
      font-size: 12px;
      color: #9ca3af;
    }
  `]
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input() highlighted = false;

  @Output() moveForward = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  onMoveForward(): void {
    this.menuOpen.set(false);
    this.moveForward.emit(this.task.id);
  }

  onDelete(): void {
    this.menuOpen.set(false);
    this.delete.emit(this.task.id);
  }
}
