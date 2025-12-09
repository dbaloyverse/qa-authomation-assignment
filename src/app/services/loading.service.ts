import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _isLoading = signal(false);

  readonly isLoading = this._isLoading.asReadonly();

  show(): void {
    this._isLoading.set(true);
  }

  hide(): void {
    this._isLoading.set(false);
  }

  /**
   * Executes an async operation with loading overlay
   * @param operation The async operation to execute
   * @param minDelay Minimum delay in ms
   * @param maxDelay Maximum delay in ms
   */
  async withLoading<T>(
    operation: () => Promise<T>,
    minDelay: number,
    maxDelay: number
  ): Promise<T> {
    this.show();
    const delay = this.randomDelay(minDelay, maxDelay);

    try {
      const [result] = await Promise.all([
        operation(),
        this.sleep(delay)
      ]);
      return result;
    } finally {
      this.hide();
    }
  }

  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
