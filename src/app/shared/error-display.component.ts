import { Component, input, output } from '@angular/core';
import { AlertCircle, LucideAngularModule, RefreshCw } from 'lucide-angular';

/** Inline error block with an optional retry button. */
@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center gap-4 rounded-xl border border-red-100 bg-red-50 px-6 py-8 text-center">
      <lucide-angular [img]="AlertCircleIcon" class="h-8 w-8 text-red-400" />
      <div>
        <p class="font-medium text-red-700">{{ title() }}</p>
        @if (message()) {
          <p class="mt-1 text-sm text-red-500">{{ message() }}</p>
        }
      </div>
      @if (retryLabel()) {
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          (click)="retry.emit()"
        >
          <lucide-angular [img]="RefreshIcon" class="h-4 w-4" />
          {{ retryLabel() }}
        </button>
      }
    </div>
  `
})
export class ErrorDisplayComponent {
  readonly AlertCircleIcon = AlertCircle;
  readonly RefreshIcon = RefreshCw;

  title = input('Something went wrong');
  message = input('');
  retryLabel = input('');

  retry = output<void>();
}
