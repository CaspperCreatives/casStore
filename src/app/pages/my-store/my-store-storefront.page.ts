import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  GalleryHorizontalEnd,
  GripVertical,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  LayoutList,
  LayoutPanelLeft,
  LucideAngularModule,
  Mail,
  Megaphone,
  Monitor,
  Package,
  Plus,
  Quote,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Sparkle,
  Sparkles,
  Trash2,
  Type,
  WandSparkles,
  X
} from 'lucide-angular';
import { SectionType, StoreSection, StoreService, buildDefaultSections } from '../../core/store.service';
import { SECTION_TYPE_META, createDefaultSection } from './sections-editor/section-defaults';
import { SectionEditorComponent } from './sections-editor/section-editors.component';
import { SECTION_PRESETS, SectionPreset, buildPresetSections } from './sections-editor/section-presets';
import { SectionThumbnailComponent } from './sections-editor/section-thumbnail.component';

const ICON_MAP: Record<string, any> = {
  Image: ImageIcon,
  GalleryHorizontalEnd,
  Megaphone,
  Package,
  LayoutPanelLeft,
  Images,
  Mail,
  Quote,
  LayoutGrid,
  Sparkles,
  Award,
  LayoutList,
  Sparkle,
  Type
};

@Component({
  selector: 'app-my-store-storefront-page',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    SectionEditorComponent,
    SectionThumbnailComponent
  ],
  template: `
    <div class="mx-auto max-w-[1600px] space-y-4">
      <!-- Title bar -->
      <div class="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Storefront editor</h1>
          <p class="text-xs text-slate-500">Customize sections that appear on your public store page.</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="hidden items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 md:flex">
            <button type="button"
              (click)="viewport.set('desktop')"
              class="rounded-xl px-3 py-1.5 text-xs font-semibold"
              [class]="viewport() === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'">
              <lucide-angular [img]="MonitorIcon" class="h-4 w-4 inline" />
            </button>
            <button type="button"
              (click)="viewport.set('mobile')"
              class="rounded-xl px-3 py-1.5 text-xs font-semibold"
              [class]="viewport() === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'">
              <lucide-angular [img]="SmartphoneIcon" class="h-4 w-4 inline" />
            </button>
          </div>
          <button type="button"
            class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            (click)="showPresets.set(true)">
            <lucide-angular [img]="WandIcon" class="h-4 w-4" />
            Presets
          </button>
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
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error() }}
        </div>
      }
      @if (saved()) {
        <div class="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Storefront updated.
        </div>
      }

      <!-- Split view -->
      <div class="grid gap-4 lg:grid-cols-[minmax(0,440px)_1fr]">

        <!-- LEFT: editor -->
        <div class="space-y-4">
          <!-- Section list -->
          <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-900">Sections</h2>
              <button type="button"
                class="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                (click)="showAddPicker.set(true)">
                <lucide-angular [img]="PlusIcon" class="h-3.5 w-3.5" />
                Add section
              </button>
            </div>

            <div cdkDropList (cdkDropListDropped)="onDrop($event)" class="space-y-2">
              @for (s of sections(); track s.id; let i = $index) {
                <div cdkDrag class="rounded-2xl border border-slate-200 bg-slate-50">
                  <div class="flex items-center gap-2 px-3 py-2.5">
                    <button type="button" cdkDragHandle class="cursor-grab text-slate-400 hover:text-slate-700">
                      <lucide-angular [img]="GripIcon" class="h-4 w-4" />
                    </button>
                    <button type="button"
                      class="flex flex-1 items-center gap-2 text-left"
                      (click)="toggleExpand(s.id)">
                      <lucide-angular [img]="iconFor(s.type)" class="h-4 w-4 text-slate-500" />
                      <span class="text-sm font-semibold text-slate-900">{{ label(s.type) }}</span>
                      <span class="text-xs text-slate-400 truncate">{{ summary(s) }}</span>
                    </button>
                    <button type="button"
                      class="rounded-lg p-1 text-slate-500 hover:bg-slate-200"
                      [title]="s.visible ? 'Hide' : 'Show'"
                      (click)="toggleVisibility(s.id)">
                      <lucide-angular [img]="s.visible ? EyeIcon : EyeOffIcon" class="h-4 w-4" />
                    </button>
                    <button type="button"
                      class="rounded-lg p-1 text-slate-500 hover:bg-slate-200"
                      (click)="toggleExpand(s.id)">
                      <lucide-angular [img]="expanded() === s.id ? ChevronUpIcon : ChevronDownIcon" class="h-4 w-4" />
                    </button>
                    <button type="button"
                      class="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      (click)="remove(s.id)">
                      <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
                    </button>
                  </div>

                  @if (expanded() === s.id) {
                    <div class="border-t border-slate-200 bg-white p-4 rounded-b-2xl">
                      <app-section-editor
                        [section]="s"
                        (configChange)="updateSection($event)"
                      />
                    </div>
                  }
                </div>
              }
              @if (sections().length === 0) {
                <div class="rounded-2xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
                  No sections yet. Click “Add section” to get started.
                </div>
              }
            </div>
          </div>

          <!-- Public link -->
          @if (slug()) {
            <a [href]="previewHref()" target="_blank" rel="noopener"
              class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <span>Open storefront in new tab</span>
              <lucide-angular [img]="ExternalLinkIcon" class="h-4 w-4" />
            </a>
          }
        </div>

        <!-- RIGHT: live preview -->
        <div class="rounded-3xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <lucide-angular [img]="MonitorIcon" class="h-4 w-4" />
              Live preview
            </div>
            <button type="button"
              class="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
              (click)="reloadPreview()">
              <lucide-angular [img]="RefreshIcon" class="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          <div class="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner"
               [style.maxWidth]="viewport() === 'mobile' ? '390px' : '100%'">
            @if (slug()) {
              <iframe
                #previewFrame
                [src]="previewUrl()"
                class="block w-full border-0"
                [style.height.px]="700"
                title="Storefront preview"
              ></iframe>
            } @else {
              <div class="flex items-center justify-center py-24 text-sm text-slate-400">
                Create your store first to preview.
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Add section modal -->
    @if (showAddPicker()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
           (click)="showAddPicker.set(false)">
        <div class="my-8 w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 class="text-base font-bold text-slate-900">Add a section</h3>
              <p class="text-xs text-slate-500">Preview shows the general layout; final content uses your data.</p>
            </div>
            <button type="button" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100" (click)="showAddPicker.set(false)">
              <lucide-angular [img]="XIcon" class="h-5 w-5" />
            </button>
          </div>
          <div class="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (entry of allSectionTypes; track entry.type) {
              <button type="button"
                class="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-900 hover:shadow-sm"
                (click)="addSection(entry.type)">
                <app-section-thumbnail [type]="entry.type" />
                <div class="flex items-start gap-2 px-0.5">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white">
                    <lucide-angular [img]="iconFor(entry.type)" class="h-3.5 w-3.5" />
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-slate-900">{{ entry.meta.label }}</div>
                    <div class="line-clamp-2 text-[11px] text-slate-500">{{ entry.meta.description }}</div>
                  </div>
                </div>
              </button>
            }
          </div>
        </div>
      </div>
    }

    <!-- Preset picker modal -->
    @if (showPresets()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
           (click)="showPresets.set(false)">
        <div class="my-8 w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 class="text-base font-bold text-slate-900">Choose a preset</h3>
              <p class="text-xs text-slate-500">A preset replaces your current draft sections. You can edit after applying.</p>
            </div>
            <button type="button" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100" (click)="showPresets.set(false)">
              <lucide-angular [img]="XIcon" class="h-5 w-5" />
            </button>
          </div>
          <div class="grid gap-3 p-4 sm:grid-cols-2">
            @for (p of presets; track p.id) {
              <button type="button"
                class="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-900 hover:shadow-sm"
                (click)="applyPreset(p)">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-sm font-bold text-slate-900">{{ p.name }}</div>
                    <div class="mt-0.5 text-xs text-slate-500">{{ p.description }}</div>
                  </div>
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white">
                    <lucide-angular [img]="WandIcon" class="h-4 w-4" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2">
                  @for (t of p.sections; track $index) {
                    <div>
                      <app-section-thumbnail [type]="t" />
                      <div class="mt-1 truncate text-center text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                        {{ label(t) }}
                      </div>
                    </div>
                  }
                </div>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class MyStoreStorefrontPage {
  readonly PlusIcon = Plus;
  readonly TrashIcon = Trash2;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly GripIcon = GripVertical;
  readonly SaveIcon = Save;
  readonly RotateCcwIcon = RotateCcw;
  readonly RefreshIcon = RefreshCw;
  readonly ExternalLinkIcon = ExternalLink;
  readonly MonitorIcon = Monitor;
  readonly SmartphoneIcon = Smartphone;
  readonly XIcon = X;
  readonly WandIcon = WandSparkles;

  readonly presets = SECTION_PRESETS;

  private storeService = inject(StoreService);
  private sanitizer = inject(DomSanitizer);
  private previewFrame = viewChild<ElementRef<HTMLIFrameElement>>('previewFrame');

  sections = signal<StoreSection[]>([]);
  private originalJson = signal('');

  expanded = signal<string | null>(null);
  viewport = signal<'desktop' | 'mobile'>('desktop');
  showAddPicker = signal(false);
  showPresets = signal(false);
  saving = signal(false);
  saved = signal(false);
  error = signal<string | null>(null);

  slug = computed(() => this.storeService.store()?.slug ?? null);
  previewHref = computed(() => (this.slug() ? `/store/${this.slug()}` : ''));
  previewUrl = computed<SafeResourceUrl | null>(() => {
    const s = this.slug();
    if (!s) return null;
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${base}/store/${s}`);
  });

  dirty = computed(() => JSON.stringify(this.sections()) !== this.originalJson());

  readonly allSectionTypes = (Object.keys(SECTION_TYPE_META) as SectionType[]).map((type) => ({
    type,
    meta: SECTION_TYPE_META[type]
  }));

  constructor() {
    // Seed from store signal (load if missing).
    effect(() => {
      const store = this.storeService.store();
      if (!store) return;
      if (this.originalJson()) return; // already seeded
      const initial = store.sections && store.sections.length > 0
        ? store.sections
        : buildDefaultSections({ name: store.name, description: store.description });
      this.sections.set(structuredClone(initial));
      this.originalJson.set(JSON.stringify(initial));
    });

    if (!this.storeService.store()) {
      void this.storeService.loadMyStore();
    }
  }

  label(type: SectionType): string { return SECTION_TYPE_META[type].label; }
  iconFor(type: SectionType): any { return ICON_MAP[SECTION_TYPE_META[type].icon]; }

  summary(s: StoreSection): string {
    const anyCfg = s.config as any;
    return anyCfg?.title || anyCfg?.text || '';
  }

  toggleExpand(id: string) {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  toggleVisibility(id: string) {
    this.sections.update(list => list.map(s => (s.id === id ? { ...s, visible: !s.visible } : s)));
  }

  updateSection(updated: StoreSection) {
    this.sections.update(list => list.map(s => (s.id === updated.id ? updated : s)));
  }

  remove(id: string) {
    this.sections.update(list => list.filter(s => s.id !== id));
    if (this.expanded() === id) this.expanded.set(null);
  }

  onDrop(event: CdkDragDrop<StoreSection[]>) {
    const list = [...this.sections()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.sections.set(list);
  }

  addSection(type: SectionType) {
    const section = createDefaultSection(type);
    this.sections.update(list => [...list, section]);
    this.expanded.set(section.id);
    this.showAddPicker.set(false);
  }

  applyPreset(preset: SectionPreset) {
    const sections = buildPresetSections(preset);
    this.sections.set(sections);
    this.expanded.set(null);
    this.showPresets.set(false);
  }

  reset() {
    const store = this.storeService.store();
    if (!store) return;
    const initial = store.sections && store.sections.length > 0
      ? store.sections
      : buildDefaultSections({ name: store.name, description: store.description });
    this.sections.set(structuredClone(initial));
    this.originalJson.set(JSON.stringify(initial));
    this.expanded.set(null);
  }

  async save() {
    this.error.set(null);
    this.saved.set(false);
    this.saving.set(true);
    try {
      const updated = await this.storeService.updateSections(this.sections());
      this.sections.set(structuredClone(updated));
      this.originalJson.set(JSON.stringify(updated));
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
      this.reloadPreview();
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to save.');
    } finally {
      this.saving.set(false);
    }
  }

  reloadPreview() {
    const frame = this.previewFrame()?.nativeElement;
    if (!frame) return;
    try {
      frame.contentWindow?.postMessage({ type: 'casstore:reload' }, window.location.origin);
    } catch {
      /* ignore */
    }
    // Fallback: force a hard reload of the iframe.
    const href = this.previewHref();
    if (!href) return;
    frame.src = 'about:blank';
    setTimeout(() => { frame.src = href; }, 30);
  }
}
