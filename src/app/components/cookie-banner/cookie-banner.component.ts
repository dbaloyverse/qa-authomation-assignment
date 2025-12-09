import { Component, inject } from '@angular/core';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  template: `
    @if (cookieService.showBanner()) {
      <div class="cookie-banner" [class.visible]="cookieService.isVisible()">
        <div class="cookie-content">
          <p class="cookie-text">
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          </p>
          <div class="cookie-actions">
            <button
              id="cookie-decline"
              class="btn btn-secondary"
              (click)="cookieService.decline()"
            >
              Decline
            </button>
            <button
              id="cookie-accept"
              class="btn btn-primary"
              (click)="cookieService.accept()"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: #1f2937;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateY(100%);
      transition: transform 0.3s ease-in-out;
      box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .cookie-banner.visible {
      transform: translateY(0);
    }

    .cookie-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      max-width: 1200px;
      width: 100%;
      padding: 0 24px;
    }

    .cookie-text {
      color: #f3f4f6;
      margin: 0;
      font-size: 14px;
    }

    .cookie-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .btn {
      padding: 8px 20px;
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
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: transparent;
      color: #9ca3af;
      border: 1px solid #4b5563;
    }

    .btn-secondary:hover {
      background: #374151;
      color: white;
    }
  `]
})
export class CookieBannerComponent {
  protected cookieService = inject(CookieConsentService);
}
