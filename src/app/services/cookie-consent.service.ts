import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'cookie_consent';

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private _showBanner = signal(false);
  private _isVisible = signal(false);

  readonly showBanner = this._showBanner.asReadonly();
  readonly isVisible = this._isVisible.asReadonly();

  constructor() {
    this.checkConsent();
  }

  private checkConsent(): void {
    const consent = localStorage.getItem(STORAGE_KEY);

    if (!consent) {
      // Show banner after 500ms delay (automation challenge)
      setTimeout(() => {
        this._showBanner.set(true);
        this._isVisible.set(true);
      }, 500);
    }
  }

  accept(): void {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    this._isVisible.set(false);
    // Keep showBanner true briefly for animation, then hide
    setTimeout(() => {
      this._showBanner.set(false);
    }, 300);
  }

  decline(): void {
    localStorage.setItem(STORAGE_KEY, 'declined');
    this._isVisible.set(false);
    setTimeout(() => {
      this._showBanner.set(false);
    }, 300);
  }

  /**
   * Reset consent for testing purposes
   */
  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._showBanner.set(false);
    this._isVisible.set(false);
    // Re-trigger the delayed banner appearance
    setTimeout(() => {
      this._showBanner.set(true);
      this._isVisible.set(true);
    }, 500);
  }
}
