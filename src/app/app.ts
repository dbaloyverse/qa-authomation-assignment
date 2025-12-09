import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { ToastContainerComponent } from './components/toast/toast.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskBoardComponent } from './components/task-board/task-board.component';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    CookieBannerComponent,
    LoadingOverlayComponent,
    ToastContainerComponent,
    TaskFormComponent,
    TaskBoardComponent
  ],
  template: `
    <app-header (taskSelected)="onTaskSelected($event)" />

    <main class="main-content">
      <h1 class="page-title">Task Board</h1>
      <div class="content-wrapper">
        <aside class="sidebar">
          <app-task-form />
        </aside>

        <section class="board-section">
          <app-task-board [highlightedTaskId]="highlightedTaskId()" />
        </section>
      </div>
    </main>

    <app-loading-overlay />
    <app-toast-container />
    <app-cookie-banner />
  `,
  styles: [`
    .main-content {
      padding-top: 60px; /* Header height */
      min-height: 100vh;
      padding-bottom: 100px; /* Space for cookie banner */
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px 24px 0;
    }

    .content-wrapper {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .sidebar {
      position: sticky;
      top: 84px; /* Header height + padding */
      align-self: start;
    }

    .board-section {
      min-width: 0; /* Prevent grid blowout */
    }

    @media (max-width: 1024px) {
      .content-wrapper {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
      }
    }
  `]
})
export class App implements OnInit {
  private taskService = inject(TaskService);

  highlightedTaskId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.taskService.initialize();
  }

  onTaskSelected(taskId: string): void {
    this.highlightedTaskId.set(taskId);

    // Scroll to the task
    setTimeout(() => {
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Clear highlight after animation
    setTimeout(() => {
      this.highlightedTaskId.set(null);
    }, 2500);
  }
}
