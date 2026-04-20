import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  ExternalLink,
  GripVertical,
  Home,
  Link as LinkIcon,
  LucideAngularModule,
  Plus,
  RotateCcw,
  Save,
  ShoppingBag,
  Trash2,
  User
} from 'lucide-angular';
import { NavItem, NavPlacement, StoreService } from '../../core/store.service';
import { StorePage, StorePagesService } from '../../core/store-pages.service';

type NavKind = NavItem['kind'];

function newId(): string {
  return `nav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

@Component({
  selector: 'app-my-store-nav-editor-page',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule, CdkDropList, CdkDrag, CdkDragHandle],
  template: `
    <div class="mx-auto space-y-4">
      <!-- Title bar -->
      <div class="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div class="flex items-center gap-3">
          <a routerLink="/my-store/storefront"
            class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
            title="Back to pages">
            <lucide-angular [img]="ArrowLeftIcon" class="h-4 w-4" />
          </a>
          <div>
            <h1 class="text-xl font-bold text-slate-900">Navigation</h1>
            <p class="text-xs text-slate-500">Control which links appear in your storefront header and footer.</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button"
            class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            [disabled]="!dirty()"
            (click)="reset()">
            <lucide-angular [img]="RotateCcwIcon" class="h-4 w-4" />
            Reset
          </button>
          <button type="button"
            class="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
            [disabled]="!dirty() || saving()"
            (click)="save()">
            <lucide-angular [img]="SaveIcon" class="h-4 w-4" />
            {{ saving() ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>

      @if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }
      @if (saved()) {
        <div class="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Navigation updated.</div>
      }

      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-900">Menu items</h2>
          <div class="flex items-center gap-1">
            <button type="button"
              class="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              (click)="addItem('page')">
              <lucide-angular [img]="PlusIcon" class="h-3.5 w-3.5" />
              Page
            </button>
            <button type="button"
              class="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              (click)="addItem('builtin')">
              <lucide-angular [img]="PlusIcon" class="h-3.5 w-3.5" />
              Built-in
            </button>
            <button type="button"
              class="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              (click)="addItem('url')">
              <lucide-angular [img]="PlusIcon" class="h-3.5 w-3.5" />
              Link
            </button>
          </div>
        </div>

        <div cdkDropList (cdkDropListDropped)="onDrop($event)" class="space-y-2">
          @for (item of items(); track item.id) {
            <div cdkDrag class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div class="flex items-start gap-3">
                <button type="button" cdkDragHandle class="mt-2 cursor-grab text-slate-400 hover:text-slate-700">
                  <lucide-angular [img]="GripIcon" class="h-4 w-4" />
                </button>
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
                  <lucide-angular [img]="iconFor(item)" class="h-4 w-4" />
                </div>
                <div class="flex-1 space-y-2">
                  <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2">
                    <div>
                      <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Label</label>
                      <input type="text" [(ngModel)]="item.label" (ngModelChange)="touched.set(true)"
                        maxlength="40" placeholder="e.g. About us"
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900" />
                    </div>
                    @switch (item.kind) {
                      @case ('page') {
                        <div>
                          <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Page</label>
                          <select [(ngModel)]="item.pageSlug" (ngModelChange)="touched.set(true)"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900">
                            <option value="" disabled>Select a page…</option>
                            @for (p of selectablePages(); track p.slug) {
                              <option [value]="p.slug">{{ p.title }} ({{ p.isHome ? 'home' : '/p/' + p.slug }})</option>
                            }
                          </select>
                        </div>
                      }
                      @case ('builtin') {
                        <div>
                          <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Target</label>
                          <select [(ngModel)]="item.target" (ngModelChange)="touched.set(true)"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900">
                            <option value="products">Shop all products</option>
                            <option value="cart">Cart</option>
                            <option value="account">Account</option>
                          </select>
                        </div>
                      }
                      @case ('url') {
                        <div>
                          <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">URL</label>
                          <input type="url" [(ngModel)]="item.url" (ngModelChange)="touched.set(true)"
                            placeholder="https://…"
                            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900" />
                        </div>
                      }
                    }
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Show in</label>
                    <select [ngModel]="item.placement ?? 'both'" (ngModelChange)="setPlacement(item.id, $event)"
                      class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900">
                      <option value="both">Header &amp; Footer</option>
                      <option value="header">Header only</option>
                      <option value="footer">Footer only</option>
                    </select>
                  </div>
                  @if (item.kind === 'url') {
                    <label class="flex items-center gap-2 text-xs text-slate-600">
                      <input type="checkbox" [(ngModel)]="item.newTab" (ngModelChange)="touched.set(true)" />
                      Open in new tab
                    </label>
                  }
                </div>
                <button type="button"
                  class="mt-2 rounded-xl p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="Remove"
                  (click)="removeItem(item.id)">
                  <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
                </button>
              </div>
            </div>
          }
          @if (items().length === 0) {
            <div class="rounded-2xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
              No menu items. Add a page, link, or built-in destination above.
            </div>
          }
        </div>

        <p class="mt-3 text-[11px] text-slate-400">Visitors always see a Home link. Add up to 20 custom items.</p>
      </div>
    </div>
  `
})
export class MyStoreNavEditorPage {
  readonly PlusIcon = Plus;
  readonly TrashIcon = Trash2;
  readonly GripIcon = GripVertical;
  readonly SaveIcon = Save;
  readonly RotateCcwIcon = RotateCcw;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly HomeIcon = Home;
  readonly LinkIcon = LinkIcon;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly UserIcon = User;
  readonly ExternalLinkIcon = ExternalLink;

  private storeService = inject(StoreService);
  private pagesService = inject(StorePagesService);

  items = signal<NavItem[]>([]);
  pages = signal<StorePage[]>([]);
  private originalJson = signal('');
  touched = signal(false);

  saving = signal(false);
  saved = signal(false);
  error = signal<string | null>(null);

  selectablePages = computed(() => this.pages());

  dirty = computed(() => {
    if (this.touched()) return true;
    return JSON.stringify(this.items()) !== this.originalJson();
  });

  constructor() {
    effect(() => {
      const store = this.storeService.store();
      if (!store) return;
      if (this.originalJson()) return;
      const items = structuredClone(store.navItems ?? []) as NavItem[];
      this.items.set(items);
      this.originalJson.set(JSON.stringify(items));
    });

    effect(() => {
      const id = this.storeService.store()?.id;
      if (!id) return;
      void this.loadPages(id);
    });

    if (!this.storeService.store()) void this.storeService.loadMyStore();
  }

  private async loadPages(storeId: string) {
    try {
      const pages = await this.pagesService.listPages({ storeId, auth: true });
      this.pages.set(pages);
    } catch { /* ignore */ }
  }

  iconFor(item: NavItem): any {
    switch (item.kind) {
      case 'page': return this.HomeIcon;
      case 'builtin':
        if (item.target === 'cart') return this.ShoppingBagIcon;
        if (item.target === 'account') return this.UserIcon;
        return this.ShoppingBagIcon;
      case 'url': return this.ExternalLinkIcon;
    }
  }

  addItem(kind: NavKind) {
    let item: NavItem;
    switch (kind) {
      case 'page': {
        const firstPage = this.pages().find(p => !p.isHome) ?? this.pages()[0];
        item = { id: newId(), kind: 'page', label: firstPage?.title ?? 'Page', pageSlug: firstPage?.slug ?? '', placement: 'both' };
        break;
      }
      case 'builtin':
        item = { id: newId(), kind: 'builtin', label: 'Shop', target: 'products', placement: 'both' };
        break;
      case 'url':
        item = { id: newId(), kind: 'url', label: 'Link', url: '', newTab: true, placement: 'both' };
        break;
    }
    this.items.update(list => [...list, item]);
    this.touched.set(true);
  }

  setPlacement(itemId: string, placement: NavPlacement) {
    this.items.update(list => list.map(it => (it.id === itemId ? { ...it, placement } : it)) as NavItem[]);
    this.touched.set(true);
  }

  removeItem(id: string) {
    this.items.update(list => list.filter(i => i.id !== id));
    this.touched.set(true);
  }

  onDrop(event: CdkDragDrop<NavItem[]>) {
    const list = [...this.items()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.items.set(list);
    this.touched.set(true);
  }

  reset() {
    const raw = this.originalJson();
    this.items.set(raw ? JSON.parse(raw) : []);
    this.touched.set(false);
  }

  async save() {
    this.error.set(null);
    this.saved.set(false);
    this.saving.set(true);
    try {
      const updated = await this.storeService.updateNav(this.items());
      this.items.set(structuredClone(updated));
      this.originalJson.set(JSON.stringify(updated));
      this.touched.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to save.');
    } finally {
      this.saving.set(false);
    }
  }
}
