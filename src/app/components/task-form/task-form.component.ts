import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Priority } from '../../models/enums';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form id="task-form" class="task-form" (ngSubmit)="onSubmit($event)">
      <h2 class="form-title">Create New Task</h2>

      <div class="form-group">
        <label for="task-title" class="form-label">Title *</label>
        <input
          id="task-title"
          type="text"
          class="form-input"
          [class.error]="titleError()"
          placeholder="Enter task title..."
          [(ngModel)]="title"
          name="title"
        />
        @if (titleError()) {
          <span class="error-message">Title is required</span>
        }
      </div>

      <div class="form-group">
        <label for="task-description" class="form-label">Description</label>
        <textarea
          id="task-description"
          class="form-textarea"
          placeholder="Description (optional)"
          [(ngModel)]="description"
          name="description"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="priority-select" class="form-label">Priority</label>
        <select
          id="priority-select"
          class="form-select"
          [(ngModel)]="priority"
          name="priority"
        >
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button
        id="submit-task"
        type="submit"
        class="btn btn-primary btn-submit"
        [disabled]="isSubmitting()"
      >
        {{ isSubmitting() ? 'Saving...' : 'Add Task' }}
      </button>
    </form>
  `,
  styles: [`
    .task-form {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .form-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 20px 0;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .form-input.error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .error-message {
      display: block;
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      width: 100%;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-submit {
      margin-top: 8px;
    }
  `]
})
export class TaskFormComponent {
  private taskService = inject(TaskService);

  title = '';
  description = '';
  priority = '';

  titleError = signal(false);
  isSubmitting = signal(false);

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    // Validate title
    if (!this.title.trim()) {
      this.titleError.set(true);
      return;
    }

    this.titleError.set(false);
    this.isSubmitting.set(true);

    try {
      await this.taskService.createTask(
        this.title.trim(),
        this.description.trim(),
        (this.priority as Priority) || Priority.Medium
      );

      // Reset form
      this.title = '';
      this.description = '';
      this.priority = '';
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
