import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../core/store.service';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, Save } from 'lucide-angular';

@Component({
  selector: 'app-my-store-settings-page',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Store settings</h1>
        <p class="mt-0.5 text-xs text-slate-500">Update your store profile and preferences</p>
      </div>

      @if (!firebaseConfigured()) {
        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Configure Firebase to save settings.</div>
      } @else if (loading()) {
        <div class="h-64 animate-pulse rounded-3xl bg-white border border-slate-200"></div>
      } @else {
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="font-semibold text-slate-900">Basic information</h2>

          <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Store name</label>
              <input type="text" [(ngModel)]="name"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white" />
            </div>

            <div>
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Store URL slug</label>
              <input type="text" [(ngModel)]="slug"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono outline-none focus:border-slate-900 focus:bg-white" />
              <p class="mt-1 text-[11px] text-slate-400">casstore.app/store/<strong>{{ slug }}</strong></p>
            </div>

            <div>
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Category</label>
              <input type="text" [(ngModel)]="category"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white" />
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Description</label>
              <textarea [(ngModel)]="description" rows="3"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white"></textarea>
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Logo URL</label>
              <input type="url" [(ngModel)]="logoUrl" placeholder="https://example.com/logo.png"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white" />
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <input type="checkbox" [(ngModel)]="active" id="active" class="h-4 w-4 rounded" />
            <label for="active" class="text-sm font-semibold text-slate-700">Store is active (visible to the public)</label>
          </div>
        </div>

        @if (saveStatus() === 'error') {
          <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{{ error() }}</div>
        }
        @if (saveStatus() === 'success') {
          <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Settings saved successfully.</div>
        }

        <div class="flex justify-end">
          <button
            type="button"
            class="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            [disabled]="saveStatus() === 'loading'"
            (click)="save()"
          >
            <lucide-angular [img]="SaveIcon" class="h-4 w-4" />
            {{ saveStatus() === 'loading' ? 'Saving...' : 'Save settings' }}
          </button>
        </div>
      }
    </div>
  `
})
export class MyStoreSettingsPage {
  readonly SaveIcon = Save;

  private storeService = inject(StoreService);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  loading = signal(true);
  saveStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<string | null>(null);

  name = '';
  slug = '';
  description = '';
  category = '';
  logoUrl = '';
  active = true;

  constructor() {
    if (this.firebaseConfigured()) void this.loadStore();
  }

  private async loadStore() {
    await this.storeService.loadMyStore();
    const store = this.storeService.store();
    if (store) {
      this.name = store.name;
      this.slug = store.slug;
      this.description = store.description;
      this.category = store.category;
      this.logoUrl = store.logoUrl ?? '';
      this.active = store.active;
    }
    this.loading.set(false);
  }

  async save() {
    this.saveStatus.set('loading');
    this.error.set(null);
    try {
      await this.storeService.updateStore({
        name: this.name.trim(),
        slug: this.slug.trim(),
        description: this.description.trim(),
        category: this.category,
        logoUrl: this.logoUrl.trim() || null,
        active: this.active
      });
      this.saveStatus.set('success');
      setTimeout(() => this.saveStatus.set('idle'), 3000);
    } catch (e: any) {
      this.saveStatus.set('error');
      this.error.set(e?.message ?? String(e));
    }
  }
}
