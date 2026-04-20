import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FilePlus,
  Home,
  Loader2,
  LucideAngularModule,
  Menu as MenuIcon,
  Package,
  PencilLine,
  Plus,
  Sparkles,
  Star,
  Trash2,
  TriangleAlert,
  X
} from 'lucide-angular';
import { StoreHomeTarget, StoreService } from '../../core/store.service';
import { StorePage, StorePagesService } from '../../core/store-pages.service';

type BuiltinPage = {
  id: 'products';
  label: string;
  description: string;
  pathSuffix: string;
  routerLink: any[];
  icon: any;
};

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;

function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

@Component({
  selector: 'app-my-store-pages-list-page',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-[1200px] space-y-4">
      <!-- Title bar -->
      <div class="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Storefront pages</h1>
          <p class="text-xs text-slate-500">Build your landing, About, Contact, and more — each from sections.</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/my-store/storefront/nav"
            class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <lucide-angular [img]="MenuIcon" class="h-4 w-4" />
            Navigation
          </a>
          <button type="button"
            class="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            (click)="openCreate()">
            <lucide-angular [img]="FilePlusIcon" class="h-4 w-4" />
            New page
          </button>
        </div>
      </div>

      @if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }
      @if (notice()) {
        <div class="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{{ notice() }}</div>
      }

      <!-- Appearance -->
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Theme colour</h2>
            <p class="text-[11px] text-slate-500">Sets the primary accent colour used across your storefront.</p>
          </div>
          <div class="flex items-center gap-2">
            @if (savingTheme()) {
              <lucide-angular [img]="LoaderIcon" class="h-4 w-4 animate-spin text-slate-400" />
              <span class="text-[11px] font-semibold text-slate-500">Saving…</span>
            } @else if (themeNotice()) {
              <span class="text-[11px] font-semibold text-emerald-600">{{ themeNotice() }}</span>
            }
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          @for (color of themeColors; track color.value) {
            <button
              type="button"
              class="h-10 w-10 rounded-2xl border-2 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              [style.background]="color.value"
              [class.border-slate-900]="themeColor() === color.value"
              [class.border-transparent]="themeColor() !== color.value"
              [class.scale-110]="themeColor() === color.value"
              [title]="color.name"
              [attr.aria-label]="color.name"
              [disabled]="savingTheme()"
              (click)="selectTheme(color.value)"
            ></button>
          }
          <div class="flex items-center gap-2">
            <input #customColor type="color" [value]="themeColor()"
              (change)="selectTheme(customColor.value)"
              [disabled]="savingTheme()"
              class="h-10 w-10 cursor-pointer rounded-2xl border border-slate-200 p-0.5 disabled:cursor-not-allowed disabled:opacity-60" />
            <span class="font-mono text-xs text-slate-500">{{ themeColor() }}</span>
          </div>
        </div>
      </div>

      <!-- Built-in pages -->
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Built-in pages</h2>
            <p class="text-[11px] text-slate-500">Always-available storefront destinations. Any of these can be set as your home page.</p>
          </div>
        </div>
        <ul class="divide-y divide-slate-100">
          @for (b of builtinPages; track b.id) {
            <li class="flex items-center gap-3 px-1 py-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                [class.bg-amber-50]="isBuiltinHome(b.id)" [class.text-amber-600]="isBuiltinHome(b.id)"
                [class.bg-slate-50]="!isBuiltinHome(b.id)" [class.text-slate-500]="!isBuiltinHome(b.id)">
                <lucide-angular [img]="isBuiltinHome(b.id) ? HomeIcon : b.icon" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-900 truncate">{{ b.label }}</span>
                  @if (isBuiltinHome(b.id)) {
                    <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">Home</span>
                  }
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Built-in</span>
                </div>
                <div class="text-xs text-slate-400">{{ b.description }} · /{{ b.pathSuffix }}</div>
              </div>
              <div class="flex items-center gap-1">
                @if (!isBuiltinHome(b.id)) {
                  <div class="group relative">
                    <button type="button"
                      class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Set as home"
                      aria-label="Set as home"
                      [disabled]="isAnyBusy()"
                      (click)="setBuiltinHome(b.id)">
                      @if (isBusyFor(b.id, 'home')) {
                        <lucide-angular [img]="LoaderIcon" class="h-4 w-4 animate-spin" />
                      } @else {
                        <lucide-angular [img]="StarIcon" class="h-4 w-4" />
                      }
                    </button>
                    <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
                      Set as home
                    </span>
                  </div>
                }
                <a
                  class="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                  title="Open"
                  [routerLink]="b.routerLink">
                  <lucide-angular [img]="ExternalLinkIcon" class="h-4 w-4" />
                </a>
              </div>
            </li>
          }
        </ul>
      </div>

      <!-- Custom pages -->
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        @if (loading()) {
          <div class="space-y-2">
            @for (_ of [1,2,3]; track _) {
              <div class="h-16 animate-pulse rounded-2xl bg-slate-100"></div>
            }
          </div>
        } @else if (pages().length === 0) {
          <div class="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
            No pages yet. Click “New page” to create your first one.
          </div>
        } @else {
          <ul class="divide-y divide-slate-100">
            @for (p of pages(); track p.id) {
              <li class="flex items-center gap-3 px-1 py-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                  [class.bg-amber-50]="isCustomHome(p)" [class.text-amber-600]="isCustomHome(p)"
                  [class.bg-slate-50]="!isCustomHome(p)" [class.text-slate-500]="!isCustomHome(p)">
                  <lucide-angular [img]="isCustomHome(p) ? HomeIcon : SparklesIcon" class="h-5 w-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-slate-900 truncate">{{ p.title || p.slug }}</span>
                    @if (isCustomHome(p)) {
                      <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">Home</span>
                    } @else if (p.isHome) {
                      <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Default home</span>
                    }
                    @if (!p.visible) {
                      <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Hidden</span>
                    }
                  </div>
                  <div class="text-xs text-slate-400">/{{ p.isHome ? '' : 'p/' }}{{ p.slug }}</div>
                </div>
                <div class="flex items-center gap-1">
                  @if (!isCustomHome(p)) {
                    <div class="group relative">
                      <button type="button"
                        class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Set as home"
                        aria-label="Set as home"
                        [disabled]="isBusy(p.id) || isAnyBusy()"
                        (click)="setHome(p)">
                        @if (isBusyFor(p.id, 'home')) {
                          <lucide-angular [img]="LoaderIcon" class="h-4 w-4 animate-spin" />
                        } @else {
                          <lucide-angular [img]="StarIcon" class="h-4 w-4" />
                        }
                      </button>
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
                        Set as home
                      </span>
                    </div>
                  }
                  <div class="group relative">
                    <button type="button"
                      class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      [title]="p.visible ? 'Hide' : 'Publish'"
                      [attr.aria-label]="p.visible ? 'Hide' : 'Publish'"
                      [disabled]="(p.isHome && p.visible) || isBusy(p.id) || isAnyBusy()"
                      (click)="toggleVisible(p)">
                      @if (isBusyFor(p.id, 'visible')) {
                        <lucide-angular [img]="LoaderIcon" class="h-4 w-4 animate-spin" />
                      } @else {
                        <lucide-angular [img]="p.visible ? EyeIcon : EyeOffIcon" class="h-4 w-4" />
                      }
                    </button>
                    <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
                      {{ p.visible ? 'Hide' : 'Publish' }}
                    </span>
                  </div>
                  <div class="group relative">
                    <button type="button"
                      class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Duplicate"
                      aria-label="Duplicate"
                      [disabled]="isBusy(p.id) || isAnyBusy()"
                      (click)="duplicate(p)">
                      @if (isBusyFor(p.id, 'duplicate')) {
                        <lucide-angular [img]="LoaderIcon" class="h-4 w-4 animate-spin" />
                      } @else {
                        <lucide-angular [img]="CopyIcon" class="h-4 w-4" />
                      }
                    </button>
                    <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
                      Duplicate
                    </span>
                  </div>
                  <div class="group relative">
                    <a
                      class="inline-flex rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                      title="Edit"
                      aria-label="Edit"
                      [routerLink]="['/my-store/storefront/pages', p.id]">
                      <lucide-angular [img]="PencilIcon" class="h-4 w-4" />
                    </a>
                    <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
                      Edit
                    </span>
                  </div>
                  @if (!p.isHome) {
                    <div class="group relative">
                      <button type="button"
                        class="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Delete"
                        aria-label="Delete"
                        [disabled]="isBusy(p.id) || isAnyBusy()"
                        (click)="askRemove(p)">
                        @if (isBusyFor(p.id, 'delete')) {
                          <lucide-angular [img]="LoaderIcon" class="h-4 w-4 animate-spin" />
                        } @else {
                          <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
                        }
                      </button>
                      <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow transition group-hover:opacity-100">
                        Delete
                      </span>
                    </div>
                  }
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </div>

    @if (showCreate()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
        (click)="closeCreate()">
        <div class="my-16 w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl"
          (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 class="text-base font-bold text-slate-900">New page</h3>
            <button type="button" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100" (click)="closeCreate()">
              <lucide-angular [img]="XIcon" class="h-5 w-5" />
            </button>
          </div>
          <form class="space-y-4 p-5" (submit)="$event.preventDefault(); create()">
            <div>
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Title</label>
              <input type="text" [ngModel]="title()" (ngModelChange)="onTitleChange($event)" name="title" required
                placeholder="About us"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
            </div>
            <div>
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">URL slug</label>
              <div class="flex items-center rounded-2xl border border-slate-200 bg-slate-100">
                <span class="pl-4 pr-1 text-sm text-slate-400">/p/</span>
                <input type="text" [value]="slug()" name="slug" readonly tabindex="-1"
                  placeholder="about-us"
                  class="flex-1 cursor-not-allowed rounded-r-2xl bg-transparent px-2 py-2.5 text-sm text-slate-600 outline-none" />
              </div>
              <p class="mt-1 text-[11px] text-slate-400">Auto-generated from the title.</p>
            </div>
            @if (createError()) {
              <div class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ createError() }}</div>
            }
            <button type="submit"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              [disabled]="creating() || !canCreate()">
              @if (creating()) {
                <lucide-angular [img]="LoaderIcon" class="h-4 w-4 animate-spin" />
                Creating…
              } @else {
                Create page
              }
            </button>
          </form>
        </div>
      </div>
    }

    @if (confirmDelete(); as target) {
      <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
        (click)="cancelDelete()">
        <div class="my-16 w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl"
          (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3 px-5 py-5">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <lucide-angular [img]="AlertIcon" class="h-5 w-5" />
            </div>
            <div class="flex-1">
              <h3 class="text-base font-bold text-slate-900">Delete page?</h3>
              <p class="mt-1 text-sm text-slate-600">
                Are you sure you want to delete <span class="font-semibold text-slate-900">“{{ target.title || target.slug }}”</span>? This action cannot be undone.
              </p>
            </div>
            <button type="button" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              [disabled]="isBusyFor(target.id, 'delete')"
              (click)="cancelDelete()">
              <lucide-angular [img]="XIcon" class="h-5 w-5" />
            </button>
          </div>
          <div class="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
            <button type="button"
              class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              [disabled]="isBusyFor(target.id, 'delete')"
              (click)="cancelDelete()">
              Cancel
            </button>
            <button type="button"
              class="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              [disabled]="isBusyFor(target.id, 'delete')"
              (click)="remove(target)">
              @if (isBusyFor(target.id, 'delete')) {
                <lucide-angular [img]="LoaderIcon" class="h-4 w-4 animate-spin" />
                Deleting…
              } @else {
                <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
                Delete page
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class MyStorePagesListPage {
  readonly FilePlusIcon = FilePlus;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly CopyIcon = Copy;
  readonly PencilIcon = PencilLine;
  readonly StarIcon = Star;
  readonly HomeIcon = Home;
  readonly SparklesIcon = Sparkles;
  readonly MenuIcon = MenuIcon;
  readonly XIcon = X;
  readonly PlusIcon = Plus;
  readonly LoaderIcon = Loader2;
  readonly AlertIcon = TriangleAlert;
  readonly ExternalLinkIcon = ExternalLink;
  readonly PackageIcon = Package;

  private storeService = inject(StoreService);
  private pagesService = inject(StorePagesService);
  private router = inject(Router);

  pages = signal<StorePage[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  notice = signal<string | null>(null);

  showCreate = signal(false);
  creating = signal(false);
  createError = signal<string | null>(null);
  title = signal('');
  slug = signal('');

  busy = signal<{ id: string; kind: 'home' | 'visible' | 'duplicate' | 'delete' } | null>(null);
  confirmDelete = signal<StorePage | null>(null);

  savingTheme = signal(false);
  themeNotice = signal<string | null>(null);
  readonly themeColors = [
    { name: 'Midnight', value: '#0f172a' },
    { name: 'Indigo', value: '#4338ca' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Sky', value: '#0284c7' }
  ];

  storeId = computed(() => this.storeService.store()?.id ?? null);
  themeColor = computed(() => this.storeService.store()?.themeColor ?? '#0f172a');
  homeTarget = computed<StoreHomeTarget>(() => this.storeService.store()?.homeTarget ?? 'custom');

  canCreate = computed(() => this.title().trim().length > 0 && SLUG_RE.test(this.slug()));

  readonly builtinPages: BuiltinPage[] = [
    {
      id: 'products',
      label: 'Products catalog',
      description: 'Your complete product listing page',
      pathSuffix: 'products',
      routerLink: ['/my-store/products'],
      icon: Package
    }
  ];

  isBuiltinHome(id: BuiltinPage['id']): boolean {
    return this.homeTarget() === id;
  }

  isCustomHome(p: StorePage): boolean {
    return this.homeTarget() === 'custom' && p.isHome;
  }

  isBusyFor(id: string, kind: 'home' | 'visible' | 'duplicate' | 'delete'): boolean {
    const b = this.busy();
    return b?.id === id && b.kind === kind;
  }

  isBusy(id: string): boolean {
    return this.busy()?.id === id;
  }

  isAnyBusy(): boolean {
    return this.busy() !== null;
  }

  constructor() {
    effect(() => {
      const id = this.storeId();
      if (!id) return;
      void this.load(id);
    });

    if (!this.storeService.store()) void this.storeService.loadMyStore();
  }

  private async load(storeId: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const pages = await this.pagesService.listPages({ storeId, auth: true });
      this.pages.set(pages);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load pages.');
    } finally {
      this.loading.set(false);
    }
  }

  openCreate() {
    this.title.set('');
    this.slug.set('');
    this.createError.set(null);
    this.showCreate.set(true);
  }

  closeCreate() {
    if (this.creating()) return;
    this.showCreate.set(false);
  }

  onTitleChange(value: string) {
    this.title.set(value);
    this.slug.set(slugify(value));
  }

  async create() {
    if (!this.canCreate()) return;
    this.creating.set(true);
    this.createError.set(null);
    try {
      const page = await this.pagesService.createPage({
        title: this.title().trim(),
        slug: slugify(this.slug()),
        sections: [],
        visible: true
      });
      this.showCreate.set(false);
      await this.router.navigate(['/my-store/storefront/pages', page.id]);
    } catch (e: any) {
      this.createError.set(e?.message ?? 'Could not create page.');
    } finally {
      this.creating.set(false);
    }
  }

  async selectTheme(value: string) {
    if (this.savingTheme()) return;
    const next = (value || '').trim();
    if (!next || next === this.themeColor()) return;
    this.savingTheme.set(true);
    this.error.set(null);
    try {
      await this.storeService.updateStore({ themeColor: next });
      this.themeNotice.set('Theme updated');
      setTimeout(() => this.themeNotice.set(null), 2000);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not update theme.');
    } finally {
      this.savingTheme.set(false);
    }
  }

  async setHome(p: StorePage) {
    const id = this.storeId();
    if (!id || this.isAnyBusy()) return;
    this.busy.set({ id: p.id, kind: 'home' });
    this.error.set(null);
    try {
      await this.pagesService.setHomePage(p.id);
      if (this.homeTarget() !== 'custom') {
        await this.storeService.updateStore({ homeTarget: 'custom' });
      }
      this.notice.set(`${p.title || p.slug} is now the home page.`);
      setTimeout(() => this.notice.set(null), 2500);
      await this.load(id);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not set home.');
    } finally {
      this.busy.set(null);
    }
  }

  async setBuiltinHome(target: BuiltinPage['id']) {
    const id = this.storeId();
    if (!id || this.isAnyBusy()) return;
    const b = this.builtinPages.find((x) => x.id === target);
    if (!b) return;
    this.busy.set({ id: target, kind: 'home' });
    this.error.set(null);
    try {
      await this.storeService.updateStore({ homeTarget: target });
      this.notice.set(`${b.label} is now the home page.`);
      setTimeout(() => this.notice.set(null), 2500);
      await this.load(id);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not set home.');
    } finally {
      this.busy.set(null);
    }
  }

  async toggleVisible(p: StorePage) {
    const id = this.storeId();
    if (!id || this.isAnyBusy()) return;
    if (p.isHome && p.visible) return;
    this.busy.set({ id: p.id, kind: 'visible' });
    this.error.set(null);
    try {
      await this.pagesService.updatePage(p.id, { visible: !p.visible });
      await this.load(id);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not update page.');
    } finally {
      this.busy.set(null);
    }
  }

  async duplicate(p: StorePage) {
    const id = this.storeId();
    if (!id || this.isAnyBusy()) return;
    this.busy.set({ id: p.id, kind: 'duplicate' });
    this.error.set(null);
    try {
      const baseSlug = slugify(`${p.slug}-copy`);
      let slug = baseSlug || 'page-copy';
      const existing = new Set(this.pages().map(x => x.slug));
      let i = 2;
      while (existing.has(slug)) { slug = `${baseSlug}-${i++}`; }
      const copy = await this.pagesService.createPage({
        title: `${p.title} (copy)`,
        slug,
        sections: p.sections,
        visible: false,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription
      });
      this.notice.set(`Duplicated as “${copy.title}”.`);
      setTimeout(() => this.notice.set(null), 2500);
      await this.load(id);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not duplicate page.');
    } finally {
      this.busy.set(null);
    }
  }

  askRemove(p: StorePage) {
    if (p.isHome || this.isAnyBusy()) return;
    this.confirmDelete.set(p);
  }

  cancelDelete() {
    if (this.busy()?.kind === 'delete') return;
    this.confirmDelete.set(null);
  }

  async remove(p: StorePage) {
    if (p.isHome) return;
    const id = this.storeId();
    if (!id) return;
    this.busy.set({ id: p.id, kind: 'delete' });
    this.error.set(null);
    try {
      await this.pagesService.deletePage(p.id);
      this.notice.set(`“${p.title || p.slug}” was deleted.`);
      setTimeout(() => this.notice.set(null), 2500);
      this.confirmDelete.set(null);
      await this.load(id);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not delete page.');
    } finally {
      this.busy.set(null);
    }
  }
}
