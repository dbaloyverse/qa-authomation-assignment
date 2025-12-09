import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">📋</span>
          <span class="logo-text">Task Board</span>
        </div>

        <div class="search-container">
          <input
            id="search-input"
            type="text"
            class="search-input"
            placeholder="Search tasks..."
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchInput($event)"
          />
          @if (searchResults().length > 0 && showResults()) {
            <div class="search-results">
              @for (result of searchResults(); track result.id) {
                <div
                  class="search-result-item"
                  (click)="onResultClick(result)"
                >
                  <span class="result-title">{{ result.title }}</span>
                  <span class="result-status">{{ getStatusLabel(result.status) }}</span>
                </div>
              }
            </div>
          }
        </div>

        <div class="user-section">
          <button
            class="user-avatar"
            (click)="toggleUserMenu()"
            aria-label="User menu"
          >
            <span class="avatar-text">JD</span>
          </button>
          @if (showUserMenu()) {
            <div class="user-dropdown">
              <div class="dropdown-item">Profile</div>
              <div class="dropdown-item">Settings</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item">Logout</div>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: white;
      z-index: 1000;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-icon {
      font-size: 24px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }

    .search-container {
      position: relative;
      width: 400px;
    }

    .search-input {
      width: 100%;
      padding: 10px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-results {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-height: 300px;
      overflow-y: auto;
      z-index: 1001;
    }

    .search-result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .search-result-item:hover {
      background: #f3f4f6;
    }

    .search-result-item:not(:last-child) {
      border-bottom: 1px solid #f3f4f6;
    }

    .result-title {
      font-size: 14px;
      color: #1f2937;
    }

    .result-status {
      font-size: 12px;
      color: #6b7280;
      padding: 2px 8px;
      background: #f3f4f6;
      border-radius: 4px;
    }

    .user-section {
      position: relative;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    .user-avatar:hover {
      transform: scale(1.05);
    }

    .avatar-text {
      color: white;
      font-size: 14px;
      font-weight: 600;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 180px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 1001;
    }

    .dropdown-item {
      padding: 12px 16px;
      font-size: 14px;
      color: #374151;
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .dropdown-item:first-child {
      border-radius: 8px 8px 0 0;
    }

    .dropdown-item:last-child {
      border-radius: 0 0 8px 8px;
    }

    .dropdown-item:hover {
      background: #f3f4f6;
    }

    .dropdown-divider {
      height: 1px;
      background: #e5e7eb;
    }
  `]
})
export class HeaderComponent {
  @Output() taskSelected = new EventEmitter<string>();

  private taskService = inject(TaskService);

  searchQuery = signal('');
  searchResults = signal<Task[]>([]);
  showResults = signal(false);
  showUserMenu = signal(false);

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_MS = 300;

  onSearchInput(value: string): void {
    this.searchQuery.set(value);

    // Clear existing timeout (debounce)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!value.trim()) {
      this.searchResults.set([]);
      this.showResults.set(false);
      return;
    }

    // Debounce search: 300ms delay before API call
    this.searchTimeout = setTimeout(async () => {
      const results = await this.taskService.searchTasks(value);
      this.searchResults.set(results);
      this.showResults.set(results.length > 0);
    }, this.DEBOUNCE_MS);
  }

  onResultClick(task: Task): void {
    this.taskSelected.emit(task.id);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showResults.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'inprogress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  }
}
