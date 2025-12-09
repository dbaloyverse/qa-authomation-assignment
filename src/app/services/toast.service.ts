import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private readonly AUTO_DISMISS_MS = 3000;

  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info'): void {
    const id = this.generateId();
    const toast: Toast = { id, message, type };

    this._toasts.update(toasts => [...toasts, toast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      this.dismiss(id);
    }, this.AUTO_DISMISS_MS);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
