import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { StoreService } from '../../core/store.service';
import { ArrowRight, Check, LucideAngularModule, Store, TriangleAlert } from 'lucide-angular';
import { environment } from '../../../environments/environment';

const CATEGORIES = [
  'Fashion & Apparel', 'Electronics', 'Home & Living', 'Beauty & Health',
  'Sports & Outdoors', 'Books & Media', 'Food & Beverage', 'Art & Crafts',
  'Jewelry & Accessories', 'Toys & Games', 'Automotive', 'General'
];

@Component({
  selector: 'app-create-store-page',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="flex min-h-[80vh] items-start justify-center bg-slate-50/50 py-12 px-4">
      <div class="w-full max-w-2xl">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white">
            <lucide-angular [img]="StoreIcon" class="h-7 w-7" />
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Create your store</h1>
          <p class="mt-2 text-slate-500">Launch your own ecommerce store in minutes</p>
        </div>

        @if (!firebaseConfigured()) {
          <div class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div class="flex items-center gap-2">
              <lucide-angular [img]="TriangleAlertIcon" class="h-4 w-4 shrink-0" />
              Configure Firebase to enable store creation.
            </div>
          </div>
        }

        <!-- Step indicator -->
        <div class="mb-8 flex items-center justify-center gap-3">
          @for (s of steps; track s.id) {
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors"
                [class.bg-slate-900]="currentStep() >= s.id"
                [class.text-white]="currentStep() >= s.id"
                [class.bg-slate-200]="currentStep() < s.id"
                [class.text-slate-500]="currentStep() < s.id"
              >
                @if (currentStep() > s.id) {
                  <lucide-angular [img]="CheckIcon" class="h-4 w-4" />
                } @else {
                  {{ s.id }}
                }
              </div>
              <span class="hidden text-xs font-semibold sm:block" [class.text-slate-900]="currentStep() >= s.id" [class.text-slate-400]="currentStep() < s.id">
                {{ s.label }}
              </span>
              @if (!$last) {
                <div class="mx-1 h-px w-8 bg-slate-200"></div>
              }
            </div>
          }
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">

          <!-- Step 1: Basic Info -->
          @if (currentStep() === 1) {
            <h2 class="text-xl font-semibold text-slate-900">Basic information</h2>
            <p class="mt-1 text-sm text-slate-500">Tell us about your store</p>

            <div class="mt-6 space-y-5">
              <div>
                <label class="mb-1.5 block text-[13px] font-semibold uppercase tracking-wider text-slate-700">Store name *</label>
                <input
                  type="text"
                  [(ngModel)]="name"
                  (ngModelChange)="onNameChange($event)"
                  placeholder="My Awesome Store"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-[13px] font-semibold uppercase tracking-wider text-slate-700">Store URL *</label>
                <div class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-900 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-900/5">
                  @if (!subdomainsEnabled) {
                    <span class="shrink-0 text-sm text-slate-400">{{ rootDomain }}/store/</span>
                  }
                  <input
                    type="text"
                    [(ngModel)]="slug"
                    placeholder="my-awesome-store"
                    class="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                  @if (subdomainsEnabled) {
                    <span class="shrink-0 text-sm text-slate-400">.{{ rootDomain }}</span>
                  }
                </div>
                @if (slug.trim()) {
                  <div class="mt-2 space-y-0.5 px-1 text-[12px]">
                    @if (subdomainsEnabled) {
                      <div class="font-semibold text-slate-900">
                        Your store URL: <span class="font-mono">{{ slug }}.{{ rootDomain }}</span>
                      </div>
                      <div class="text-slate-400">
                        Platform link: <span class="font-mono">{{ rootDomain }}/store/{{ slug }}</span>
                      </div>
                    } @else {
                      <div class="font-semibold text-slate-900">
                        Your store URL: <span class="font-mono">{{ rootDomain }}/store/{{ slug }}</span>
                      </div>
                    }
                  </div>
                }
                <p class="mt-1 px-1 text-[11px] text-slate-400">3–30 chars. Lowercase letters, numbers and hyphens only.</p>
              </div>

              <div>
                <label class="mb-1.5 block text-[13px] font-semibold uppercase tracking-wider text-slate-700">Category</label>
                <select
                  [(ngModel)]="category"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                >
                  @for (c of categories; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="mb-1.5 block text-[13px] font-semibold uppercase tracking-wider text-slate-700">Description</label>
                <textarea
                  [(ngModel)]="description"
                  placeholder="Describe your store and what you sell..."
                  rows="3"
                  class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                ></textarea>
              </div>
            </div>
          }

          <!-- Step 2: Appearance -->
          @if (currentStep() === 2) {
            <h2 class="text-xl font-semibold text-slate-900">Appearance</h2>
            <p class="mt-1 text-sm text-slate-500">Customise the look of your store</p>

            <div class="mt-6 space-y-5">
              <div>
                <label class="mb-1.5 block text-[13px] font-semibold uppercase tracking-wider text-slate-700">Theme colour</label>
                <div class="flex flex-wrap gap-3 mt-2">
                  @for (color of themeColors; track color.value) {
                    <button
                      type="button"
                      class="h-10 w-10 rounded-2xl border-2 transition-all"
                      [style.background]="color.value"
                      [class.border-slate-900]="themeColor === color.value"
                      [class.border-transparent]="themeColor !== color.value"
                      [class.scale-110]="themeColor === color.value"
                      (click)="themeColor = color.value"
                      [title]="color.name"
                    ></button>
                  }
                </div>
              </div>

              <div>
                <label class="mb-1.5 block text-[13px] font-semibold uppercase tracking-wider text-slate-700">Logo URL (optional)</label>
                <input
                  type="url"
                  [(ngModel)]="logoUrl"
                  placeholder="https://example.com/logo.png"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                />
                <p class="mt-1 px-1 text-[11px] text-slate-400">You can upload images from your store dashboard later.</p>
              </div>

              <!-- Preview card -->
              <div class="overflow-hidden rounded-2xl border border-slate-200">
                <div class="px-4 py-3 text-sm font-bold text-white" [style.background]="themeColor">
                  {{ name || 'Store preview' }}
                </div>
                <div class="bg-white px-4 py-3 text-sm text-slate-600">
                  {{ description || 'Your store description will appear here.' }}
                </div>
              </div>
            </div>
          }

          <!-- Step 3: Review -->
          @if (currentStep() === 3) {
            <h2 class="text-xl font-semibold text-slate-900">Review & launch</h2>
            <p class="mt-1 text-sm text-slate-500">Confirm your store details before publishing</p>

            <div class="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div class="flex items-start justify-between gap-4">
                <span class="text-slate-500">Store name</span>
                <span class="font-semibold text-slate-900">{{ name }}</span>
              </div>
              <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <span class="text-slate-500">Your store URL</span>
                <div class="text-right">
                  @if (subdomainsEnabled) {
                    <div class="font-mono text-sm font-semibold text-slate-900">{{ slug }}.{{ rootDomain }}</div>
                    <div class="mt-0.5 text-[11px] text-slate-400 font-mono">{{ rootDomain }}/store/{{ slug }}</div>
                  } @else {
                    <div class="font-mono text-sm font-semibold text-slate-900">{{ rootDomain }}/store/{{ slug }}</div>
                  }
                </div>
              </div>
              <div class="flex items-start justify-between gap-4">
                <span class="text-slate-500">Category</span>
                <span class="text-slate-700">{{ category }}</span>
              </div>
              @if (description) {
                <div class="flex items-start justify-between gap-4">
                  <span class="shrink-0 text-slate-500">Description</span>
                  <span class="text-right text-slate-700">{{ description }}</span>
                </div>
              }
              <div class="flex items-center justify-between gap-4">
                <span class="text-slate-500">Theme colour</span>
                <div class="h-5 w-10 rounded-full border border-slate-200" [style.background]="themeColor"></div>
              </div>
            </div>

            @if (status() === 'error') {
              <div class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {{ error() }}
              </div>
            }
            @if (status() === 'success' && launchedSlug()) {
              <div class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div class="font-semibold">Your store is live!</div>
                @if (subdomainsEnabled) {
                  <div class="mt-0.5 font-mono text-[12px]">{{ launchedSlug() }}.{{ rootDomain }}</div>
                } @else {
                  <div class="mt-0.5 font-mono text-[12px]">{{ rootDomain }}/store/{{ launchedSlug() }}</div>
                }
              </div>
            }
          }

          <!-- Navigation buttons -->
          <div class="mt-8 flex items-center justify-between gap-4">
            @if (currentStep() > 1) {
              <button
                type="button"
                class="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                (click)="prevStep()"
              >
                Back
              </button>
            } @else {
              <div></div>
            }

            @if (currentStep() < 3) {
              <button
                type="button"
                class="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                [disabled]="!canProceed()"
                (click)="nextStep()"
              >
                Continue
                <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4" />
              </button>
            } @else {
              <button
                type="button"
                class="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                [disabled]="status() === 'loading' || status() === 'success' || !firebaseConfigured()"
                (click)="launch()"
              >
                @if (status() === 'loading') {
                  Launching...
                } @else if (status() === 'success') {
                  Redirecting...
                } @else {
                  Launch store
                  <lucide-angular [img]="ArrowRightIcon" class="h-4 w-4" />
                }
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreateStorePage {
  readonly StoreIcon = Store;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckIcon = Check;
  readonly TriangleAlertIcon = TriangleAlert;

  private storeService = inject(StoreService);
  private router = inject(Router);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  readonly rootDomain = environment.rootDomain;
  readonly subdomainsEnabled = environment.subdomainsEnabled;

  currentStep = signal(1);
  status = signal<'idle' | 'loading' | 'error' | 'success'>('idle');
  error = signal<string | null>(null);
  launchedSlug = signal<string | null>(null);

  name = '';
  slug = '';
  description = '';
  category = 'General';
  logoUrl = '';
  themeColor = '#0f172a';

  categories = CATEGORIES;

  steps = [
    { id: 1, label: 'Basic info' },
    { id: 2, label: 'Appearance' },
    { id: 3, label: 'Review' }
  ];

  themeColors = [
    { name: 'Midnight', value: '#0f172a' },
    { name: 'Indigo', value: '#4338ca' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Sky', value: '#0284c7' },
  ];

  onNameChange(val: string) {
    this.slug = val
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  canProceed() {
    if (this.currentStep() === 1) return this.name.trim().length > 0 && this.slug.trim().length > 0;
    return true;
  }

  nextStep() {
    if (this.currentStep() < 3 && this.canProceed()) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  async launch() {
    if (!this.firebaseConfigured()) return;
    this.status.set('loading');
    this.error.set(null);
    try {
      const { slug } = await this.storeService.createStore({
        name: this.name.trim(),
        slug: this.slug.trim(),
        description: this.description.trim(),
        category: this.category,
        logoUrl: this.logoUrl.trim() || undefined,
        themeColor: this.themeColor
      });
      this.launchedSlug.set(slug);
      this.status.set('success');
      // Brief success state so the user sees the live URL before we navigate.
      setTimeout(() => {
        void this.router.navigate(['/my-store'], { queryParams: { welcome: '1' } });
      }, 900);
    } catch (e: any) {
      this.status.set('error');
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
      } else if (msg.includes('store_exists')) {
        this.error.set('You already have a store.');
      } else {
        this.error.set(msg);
      }
    }
  }
}
