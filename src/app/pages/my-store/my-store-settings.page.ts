import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../core/store.service';
import { environment } from '../../../environments/environment';
import { Copy, ExternalLink, LucideAngularModule, Save } from 'lucide-angular';

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

            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Store URL</label>
              <div class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-900 focus-within:bg-white">
                @if (!subdomainsEnabled) {
                  <span class="shrink-0 text-sm text-slate-400">{{ rootDomain }}/store/</span>
                }
                <input type="text" [(ngModel)]="slug"
                  class="min-w-0 flex-1 bg-transparent text-sm font-mono outline-none" />
                @if (subdomainsEnabled) {
                  <span class="shrink-0 text-sm text-slate-400">.{{ rootDomain }}</span>
                }
              </div>

              <div class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                @if (subdomainsEnabled) {
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Your store URL</div>
                      <div class="mt-0.5 truncate font-mono text-sm font-semibold text-slate-900">{{ subdomainHost() }}</div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button"
                        class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        [title]="copiedSubdomain() ? 'Copied' : 'Copy URL'"
                        (click)="copy(subdomainUrl(), 'subdomain')">
                        <lucide-angular [img]="CopyIcon" class="h-4 w-4" />
                      </button>
                      <a [href]="subdomainUrl()" target="_blank" rel="noopener"
                        class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Open in new tab">
                        <lucide-angular [img]="ExternalLinkIcon" class="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <div class="mt-2 border-t border-slate-200 pt-2">
                    <div class="flex items-center justify-between gap-3">
                      <div class="min-w-0">
                        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Platform link</div>
                        <div class="mt-0.5 truncate font-mono text-[12px] text-slate-600">{{ apexHost() }}</div>
                      </div>
                      <button type="button"
                        class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        [title]="copiedApex() ? 'Copied' : 'Copy URL'"
                        (click)="copy(apexUrl(), 'apex')">
                        <lucide-angular [img]="CopyIcon" class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Your store URL</div>
                      <div class="mt-0.5 truncate font-mono text-sm font-semibold text-slate-900">{{ apexHost() }}</div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button"
                        class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        [title]="copiedApex() ? 'Copied' : 'Copy URL'"
                        (click)="copy(apexUrl(), 'apex')">
                        <lucide-angular [img]="CopyIcon" class="h-4 w-4" />
                      </button>
                      <a [href]="apexUrl()" target="_blank" rel="noopener"
                        class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        title="Open in new tab">
                        <lucide-angular [img]="ExternalLinkIcon" class="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                }
              </div>

              @if (slugChanged()) {
                <div class="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
                  <span class="font-semibold">Heads up:</span>
                  changing this URL will make your old links
                  @if (subdomainsEnabled) {
                    (<span class="font-mono">{{ originalSlug() }}.{{ rootDomain }}</span>)
                  } @else {
                    (<span class="font-mono">{{ rootDomain }}/store/{{ originalSlug() }}</span>)
                  }
                  stop working.
                </div>
              }
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
  readonly CopyIcon = Copy;
  readonly ExternalLinkIcon = ExternalLink;

  private storeService = inject(StoreService);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  readonly rootDomain = environment.rootDomain;
  readonly subdomainsEnabled = environment.subdomainsEnabled;

  loading = signal(true);
  saveStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<string | null>(null);
  /** The slug that was loaded from Firestore; compared against the input to detect pending renames. */
  originalSlug = signal('');
  copiedSubdomain = signal(false);
  copiedApex = signal(false);

  name = '';
  slug = '';
  description = '';
  category = '';
  logoUrl = '';
  active = true;

  subdomainHost = () => `${(this.slug || 'your-store').toLowerCase()}.${this.rootDomain}`;
  apexHost = () => `${this.rootDomain}/store/${(this.slug || 'your-store').toLowerCase()}`;
  subdomainUrl = () => `https://${this.subdomainHost()}`;
  apexUrl = () => `https://${this.apexHost()}`;

  slugChanged = () => this.originalSlug() && this.slug.trim().toLowerCase() !== this.originalSlug();

  constructor() {
    if (this.firebaseConfigured()) void this.loadStore();
  }

  private async loadStore() {
    await this.storeService.loadMyStore();
    const store = this.storeService.store();
    if (store) {
      this.name = store.name;
      this.slug = store.slug;
      this.originalSlug.set(store.slug);
      this.description = store.description;
      this.category = store.category;
      this.logoUrl = store.logoUrl ?? '';
      this.active = store.active;
    }
    this.loading.set(false);
  }

  async copy(value: string, which: 'subdomain' | 'apex') {
    try {
      await navigator.clipboard.writeText(value);
      if (which === 'subdomain') {
        this.copiedSubdomain.set(true);
        setTimeout(() => this.copiedSubdomain.set(false), 1500);
      } else {
        this.copiedApex.set(true);
        setTimeout(() => this.copiedApex.set(false), 1500);
      }
    } catch {
      // clipboard permission denied — silent, UI state just won't flip
    }
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
      this.originalSlug.set(this.slug.trim().toLowerCase());
      this.saveStatus.set('success');
      setTimeout(() => this.saveStatus.set('idle'), 3000);
    } catch (e: any) {
      this.saveStatus.set('error');
      const msg = String(e?.message ?? e);
      if (msg.includes('slug_taken')) {
        this.error.set('That store URL is already taken. Please choose another.');
      } else if (msg.includes('reserved_slug')) {
        this.error.set(`"${this.slug}" is a reserved word — please try another URL.`);
      } else if (msg.includes('slug_too_short')) {
        this.error.set('Store URL must be at least 3 characters.');
      } else if (msg.includes('slug_too_long')) {
        this.error.set('Store URL must be 30 characters or fewer.');
      } else if (msg.includes('invalid_slug')) {
        this.error.set('Store URL can only contain lowercase letters, numbers, and hyphens.');
      } else {
        this.error.set(msg);
      }
    }
  }
}
