import { Component, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, X } from 'lucide-angular';
import { UploadService } from '../core/upload.service';

/**
 * Two-way bound URL input with an integrated "Upload" button that
 * pushes the file to Firebase Storage via getUploadUrl and writes
 * the resulting publicUrl back to the model.
 */
@Component({
  selector: 'app-image-url-input',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-2">
      <div class="flex gap-2">
        <input
          type="url"
          [ngModel]="value()"
          (ngModelChange)="value.set($event)"
          [placeholder]="placeholder()"
          class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
        />
        <label class="flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <lucide-angular [img]="UploadIcon" class="h-4 w-4" />
          {{ uploading() ? 'Uploading…' : 'Upload' }}
          <input
            type="file"
            accept="image/*"
            class="hidden"
            [disabled]="uploading()"
            (change)="onFile($event)"
          />
        </label>
        @if (value()) {
          <button type="button"
            class="flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-slate-500 hover:bg-slate-50"
            (click)="value.set('')">
            <lucide-angular [img]="XIcon" class="h-4 w-4" />
          </button>
        }
      </div>
      @if (value()) {
        <img [src]="value()" alt="preview"
          class="h-20 w-full max-w-xs rounded-xl border border-slate-200 object-cover" />
      }
      @if (error()) {
        <p class="text-xs text-red-600">{{ error() }}</p>
      }
    </div>
  `
})
export class ImageUrlInputComponent {
  readonly UploadIcon = Upload;
  readonly XIcon = X;

  value = model<string>('');
  placeholder = input('https://example.com/image.png');
  folder = input<'products' | 'logos' | 'storefront'>('storefront');

  private uploader = inject(UploadService);
  uploading = signal(false);
  error = signal<string | null>(null);

  async onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.error.set(null);
    this.uploading.set(true);
    try {
      const res = await this.uploader.upload(file, this.folder());
      this.value.set(res.publicUrl);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Upload failed');
    } finally {
      this.uploading.set(false);
    }
  }
}
