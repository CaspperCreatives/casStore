import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  Award,
  ChevronDown,
  ChevronUp,
  ClipboardList,
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
  Settings as SettingsIcon,
  Smartphone,
  Tablet,
  Sparkle,
  Sparkles,
  Trash2,
  Type,
  WandSparkles,
  X
} from 'lucide-angular';
import { NavItem, SectionType, StoreSection, StoreService } from '../../core/store.service';
import { StorePage, StorePagesService } from '../../core/store-pages.service';
import { SECTION_TYPE_META, createDefaultSection } from './sections-editor/section-defaults';
import { SectionEditorComponent } from './sections-editor/section-editors.component';
import {
  PRESET_CATEGORIES,
  PresetCategory,
  SECTION_PRESETS,
  SectionPreset,
  buildPresetSections
} from './sections-editor/section-presets';
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
  Type,
  ClipboardList
};

@Component({
  selector: 'app-my-store-page-editor-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
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
        <div class="min-w-0 flex items-center gap-3">
          <a routerLink="/my-store/storefront"
            class="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
            title="Back to pages">
            <lucide-angular [img]="ArrowLeftIcon" class="h-4 w-4" />
          </a>
          <div class="min-w-0">
            <div class="flex items-center gap-2 min-w-0">
              <h1 class="text-xl font-bold text-slate-900 truncate">
                {{ page()?.title || 'Page' }}
              </h1>
              @if (page()?.isHome) {
                <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">Home</span>
              }
            </div>
            <div class="text-xs text-slate-500 truncate">
              /{{ page()?.isHome ? '' : 'p/' }}{{ page()?.slug }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="hidden items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 md:flex">
            <button type="button"
              (click)="viewport.set('desktop')"
              title="Desktop"
              aria-label="Desktop preview"
              class="rounded-xl px-3 py-1.5 text-xs font-semibold"
              [class]="viewport() === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'">
              <lucide-angular [img]="MonitorIcon" class="h-4 w-4 inline" />
            </button>
            <button type="button"
              (click)="viewport.set('tablet')"
              title="Tablet"
              aria-label="Tablet preview"
              class="rounded-xl px-3 py-1.5 text-xs font-semibold"
              [class]="viewport() === 'tablet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'">
              <lucide-angular [img]="TabletIcon" class="h-4 w-4 inline" />
            </button>
            <button type="button"
              (click)="viewport.set('mobile')"
              title="Mobile"
              aria-label="Mobile preview"
              class="rounded-xl px-3 py-1.5 text-xs font-semibold"
              [class]="viewport() === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'">
              <lucide-angular [img]="SmartphoneIcon" class="h-4 w-4 inline" />
            </button>
          </div>
          <button type="button"
            class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            (click)="showSettings.set(true)">
            <lucide-angular [img]="SettingsIcon" class="h-4 w-4" />
            Page settings
          </button>
          <button type="button"
            class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            (click)="openPresets()">
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
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }
      @if (saved()) {
        <div class="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Page saved.</div>
      }

      @if (loading()) {
        <div class="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading page…</div>
      } @else if (!page()) {
        <div class="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <h2 class="text-lg font-bold text-slate-900">Page not found</h2>
          <p class="mt-1 text-sm text-slate-500">It may have been deleted.</p>
          <a routerLink="/my-store/storefront" class="mt-4 inline-block rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Back to pages</a>
        </div>
      } @else {
        <div class="grid gap-4 lg:grid-cols-[minmax(0,440px)_1fr]">
          <!-- LEFT: editor -->
          <div class="space-y-4">
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

            @if (previewHref()) {
              <a [href]="previewHref()" target="_blank" rel="noopener"
                class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <span>Open page in new tab</span>
                <lucide-angular [img]="ExternalLinkIcon" class="h-4 w-4" />
              </a>
            }
          </div>

          <!-- RIGHT: live preview -->
          <div class="rounded-3xl border border-slate-200 bg-slate-100 p-4 shadow-sm lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-1rem)] lg:overflow-auto">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <lucide-angular [img]="MonitorIcon" class="h-4 w-4" />
                Live preview
                <span class="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
                  {{ targetWidth() }} × {{ targetHeight() }}
                  @if (previewScale() < 1) {
                    · {{ previewScalePercent() }}%
                  }
                </span>
              </div>
              <button type="button"
                class="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                (click)="reloadPreview()">
                <lucide-angular [img]="RefreshIcon" class="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            <!-- Scalable preview stage: the iframe always renders at its target
                 (mobile 390 / desktop 1280), then CSS transform scales it down
                 to fit the available width. This makes the "desktop" preview
                 actually trigger desktop media queries inside the iframe. -->
            <div #previewPanel class="mx-auto overflow-hidden">
              @if (previewUrl()) {
                <div
                  class="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner"
                  [style.width.px]="displayWidth()"
                  [style.height.px]="displayHeight()"
                >
                  <iframe
                    #previewFrame
                    [src]="previewUrl()"
                    class="block border-0"
                    [style.width.px]="targetWidth()"
                    [style.height.px]="targetHeight()"
                    [style.transform]="'scale(' + previewScale() + ')'"
                    [style.transformOrigin]="'top left'"
                    title="Page preview"
                  ></iframe>
                </div>
              } @else {
                <div class="flex items-center justify-center py-24 text-sm text-slate-400">
                  Save the page to preview it.
                </div>
              }
            </div>
          </div>
        </div>
      }
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

          <!-- Category tabs: each tab maps to a page type so users can
               assemble a full website one page at a time. -->
          <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
            @for (cat of presetCategories; track cat.id) {
              <button type="button"
                [class]="'rounded-full border px-3 py-1.5 text-xs font-semibold transition ' + (activePresetCategory() === cat.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50')"
                [title]="cat.description"
                (click)="activePresetCategory.set(cat.id)">
                {{ cat.label }}
                <span [class]="'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ' + (activePresetCategory() === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')">
                  {{ presetCountFor(cat.id) }}
                </span>
              </button>
            }
          </div>

          <div class="px-5 pb-2 pt-4">
            <p class="text-[11px] text-slate-500">{{ activePresetCategoryMeta().description }}</p>
          </div>

          <div class="grid gap-3 px-4 pb-4 sm:grid-cols-2">
            @for (p of visiblePresets(); track p.id) {
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
                  @for (spec of p.sections; track $index) {
                    <div>
                      <app-section-thumbnail [type]="spec.type" />
                      <div class="mt-1 truncate text-center text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                        {{ label(spec.type) }}
                      </div>
                    </div>
                  }
                </div>
              </button>
            }
            @if (visiblePresets().length === 0) {
              <div class="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                No presets in this category yet.
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Page settings modal -->
    @if (showSettings() && page()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
        (click)="showSettings.set(false)">
        <div class="my-8 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl"
          (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 class="text-base font-bold text-slate-900">Page settings</h3>
            <button type="button" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100" (click)="showSettings.set(false)">
              <lucide-angular [img]="XIcon" class="h-5 w-5" />
            </button>
          </div>
          <form class="space-y-4 p-5" (submit)="$event.preventDefault(); saveSettings()">
            <div>
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Title</label>
              <input type="text" [(ngModel)]="settingsForm.title" name="title" required
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
            </div>
            <div>
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">URL slug</label>
              <div class="flex items-center rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-slate-900 focus-within:bg-white"
                [class.opacity-60]="page()!.isHome">
                <span class="pl-4 pr-1 text-sm text-slate-400">/{{ page()!.isHome ? '' : 'p/' }}</span>
                <p class="text-slate-700 flex-1 rounded-r-2xl bg-transparent px-2 py-2.5 text-sm outline-none disabled:cursor-not-allowed" [(ngModel)]="settingsForm.slug" name="slug" required
                  [disabled]="page()!.isHome">{{ settingsForm.slug }}</p>
              </div>
              @if (page()!.isHome) {
                <p class="mt-1 text-[11px] text-slate-400">The home page slug cannot be changed.</p>
              }
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">Published</div>
                <div class="text-[11px] text-slate-500">Hidden pages are only visible to you.</div>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" class="peer sr-only" [(ngModel)]="settingsForm.visible" name="visible"
                  [disabled]="page()!.isHome" />
                <div class="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-slate-900 peer-disabled:opacity-60 transition"></div>
                <div class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"></div>
              </label>
            </div>
            @if (!page()!.isHome) {
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div class="mb-2">
                  <div class="text-sm font-semibold text-slate-900">Menu placement</div>
                  <div class="text-[11px] text-slate-500">Show a link to this page in the header menu, footer, or both.</div>
                </div>
                <div class="space-y-2">
                  <label class="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                    <span class="text-sm text-slate-700">Show in header menu</span>
                    <span class="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" class="peer sr-only" [(ngModel)]="settingsForm.inHeader" name="inHeader" />
                      <div class="h-5 w-9 rounded-full bg-slate-300 peer-checked:bg-slate-900 transition"></div>
                      <div class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4"></div>
                    </span>
                  </label>
                  <label class="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                    <span class="text-sm text-slate-700">Show in footer menu</span>
                    <span class="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" class="peer sr-only" [(ngModel)]="settingsForm.inFooter" name="inFooter" />
                      <div class="h-5 w-9 rounded-full bg-slate-300 peer-checked:bg-slate-900 transition"></div>
                      <div class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4"></div>
                    </span>
                  </label>
                </div>
              </div>
            }
            <div>
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">SEO title (optional)</label>
              <input type="text" [(ngModel)]="settingsForm.seoTitle" name="seoTitle"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
            </div>
            <div>
              <label class="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">SEO description (optional)</label>
              <textarea rows="3" [(ngModel)]="settingsForm.seoDescription" name="seoDescription"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"></textarea>
            </div>
            @if (settingsError()) {
              <div class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ settingsError() }}</div>
            }
            <button type="submit"
              class="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              [disabled]="savingSettings()">
              {{ savingSettings() ? 'Saving…' : 'Save settings' }}
            </button>
          </form>
        </div>
      </div>
    }
  `
})
export class MyStorePageEditorPage {
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
  readonly TabletIcon = Tablet;
  readonly XIcon = X;
  readonly WandIcon = WandSparkles;
  readonly SettingsIcon = SettingsIcon;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly GalleryIcon = GalleryHorizontalEnd;

  readonly presets = SECTION_PRESETS;
  readonly presetCategories = PRESET_CATEGORIES;
  activePresetCategory = signal<PresetCategory>('home');

  visiblePresets = computed(() =>
    SECTION_PRESETS.filter((p) => p.category === this.activePresetCategory())
  );

  activePresetCategoryMeta = computed(
    () =>
      PRESET_CATEGORIES.find((c) => c.id === this.activePresetCategory()) ??
      PRESET_CATEGORIES[0]
  );

  presetCountFor(category: PresetCategory): number {
    return SECTION_PRESETS.reduce((n, p) => (p.category === category ? n + 1 : n), 0);
  }

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storeService = inject(StoreService);
  private pagesService = inject(StorePagesService);
  private sanitizer = inject(DomSanitizer);
  private previewFrame = viewChild<ElementRef<HTMLIFrameElement>>('previewFrame');
  private previewPanel = viewChild<ElementRef<HTMLDivElement>>('previewPanel');

  /** Width of the outer preview panel in px (observed). */
  private previewPanelWidth = signal(0);
  /** Visible window height in px. Updated on resize. */
  private viewportHeight = signal(typeof window !== 'undefined' ? window.innerHeight : 900);
  private previewResizeObserver: ResizeObserver | null = null;
  private observedPanel: HTMLElement | null = null;

  pageId = signal<string>('');
  page = signal<StorePage | null>(null);
  sections = signal<StoreSection[]>([]);
  private originalJson = signal('');

  loading = signal(true);
  expanded = signal<string | null>(null);
  viewport = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  showAddPicker = signal(false);
  showPresets = signal(false);
  showSettings = signal(false);
  saving = signal(false);
  saved = signal(false);
  error = signal<string | null>(null);

  settingsForm = { title: '', slug: '', visible: true, seoTitle: '', seoDescription: '', inHeader: false, inFooter: false };
  savingSettings = signal(false);
  settingsError = signal<string | null>(null);

  slug = computed(() => this.storeService.store()?.slug ?? null);
  previewHref = computed(() => {
    const s = this.slug();
    const p = this.page();
    if (!s || !p) return '';
    return p.isHome ? `/store/${s}` : `/store/${s}/p/${p.slug}`;
  });
  previewUrl = computed<SafeResourceUrl | null>(() => {
    const href = this.previewHref();
    if (!href) return null;
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${base}${href}`);
  });

  /** The internal viewport the iframe is rendered at. */
  targetWidth = computed(() => {
    switch (this.viewport()) {
      case 'mobile':  return 390;
      case 'tablet':  return 834;
      default:        return 1280;
    }
  });
  targetHeight = computed(() => {
    switch (this.viewport()) {
      case 'mobile':  return 780;
      case 'tablet':  return 1112;
      default:        return 820;
    }
  });

  /**
   * Max visible height for the preview stage, based on the current viewport.
   * Reserves ~240px for the app header, the preview toolbar, and outer padding
   * so the full preview (including borders) fits on screen without scrolling
   * the outer page.
   */
  maxPreviewHeight = computed(() => Math.max(360, this.viewportHeight() - 240));

  /** Fit-to-both-axes scale factor, capped at 1. */
  previewScale = computed(() => {
    const availW = this.previewPanelWidth();
    const availH = this.maxPreviewHeight();
    const targetW = this.targetWidth();
    const targetH = this.targetHeight();
    if (!targetW || !targetH) return 1;
    const wRatio = availW > 0 ? availW / targetW : 1;
    const hRatio = availH > 0 ? availH / targetH : 1;
    return Math.min(1, wRatio, hRatio);
  });
  previewScalePercent = computed(() => Math.round(this.previewScale() * 100));

  /** The visual (scaled) size shown on screen. */
  displayWidth = computed(() => Math.round(this.targetWidth() * this.previewScale()));
  displayHeight = computed(() => Math.round(this.targetHeight() * this.previewScale()));

  @HostListener('window:resize')
  onWindowResize() {
    if (typeof window !== 'undefined') {
      this.viewportHeight.set(window.innerHeight);
    }
  }

  dirty = computed(() => JSON.stringify(this.sections()) !== this.originalJson());

  readonly allSectionTypes = (Object.keys(SECTION_TYPE_META) as SectionType[]).map((type) => ({
    type,
    meta: SECTION_TYPE_META[type]
  }));

  constructor() {
    this.pageId.set(this.route.snapshot.paramMap.get('pageId') ?? '');
    this.route.paramMap.subscribe((p) => this.pageId.set(p.get('pageId') ?? ''));

    if (!this.storeService.store()) void this.storeService.loadMyStore();

    effect(() => {
      const id = this.pageId();
      const store = this.storeService.store();
      if (!id || !store) return;
      void this.load(id);
    });

    // Observe the preview panel's width so we can scale the iframe to fit.
    effect(() => {
      const el = this.previewPanel()?.nativeElement ?? null;
      if (el === this.observedPanel) return;
      this.previewResizeObserver?.disconnect();
      this.observedPanel = el;
      if (!el || typeof ResizeObserver === 'undefined') return;
      this.previewPanelWidth.set(el.clientWidth);
      this.previewResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = Math.floor(entry.contentRect.width);
          if (w > 0) this.previewPanelWidth.set(w);
        }
      });
      this.previewResizeObserver.observe(el);
    });
  }

  ngOnDestroy() {
    this.previewResizeObserver?.disconnect();
    this.previewResizeObserver = null;
  }

  private async load(pageId: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      // Resolve page doc via list (authenticated owner gets all pages).
      const storeId = this.storeService.store()?.id;
      if (!storeId) throw new Error('store_not_found');
      const pages = await this.pagesService.listPages({ storeId, auth: true });
      const found = pages.find(p => p.id === pageId) ?? null;
      this.page.set(found);
      if (!found) {
        this.sections.set([]);
        this.originalJson.set('');
        return;
      }
      this.sections.set(structuredClone(found.sections ?? []));
      this.originalJson.set(JSON.stringify(found.sections ?? []));
      const navItems = this.storeService.store()?.navItems ?? [];
      const navItem = navItems.find(
        (n) => n.kind === 'page' && n.pageSlug === found.slug
      );
      const placement = navItem?.placement ?? (navItem ? 'both' : 'both');
      const hasNav = Boolean(navItem);
      this.settingsForm = {
        title: found.title,
        slug: found.slug,
        visible: found.visible,
        seoTitle: found.seoTitle ?? '',
        seoDescription: found.seoDescription ?? '',
        inHeader: hasNav && (placement === 'header' || placement === 'both'),
        inFooter: hasNav && (placement === 'footer' || placement === 'both')
      };
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load page.');
    } finally {
      this.loading.set(false);
    }
  }

  label(type: SectionType): string { return SECTION_TYPE_META[type].label; }
  iconFor(type: SectionType): any { return ICON_MAP[SECTION_TYPE_META[type].icon]; }

  summary(s: StoreSection): string {
    const anyCfg = s.config as any;
    return anyCfg?.title || anyCfg?.text || '';
  }

  toggleExpand(id: string) { this.expanded.set(this.expanded() === id ? null : id); }

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
    this.sections.set(buildPresetSections(preset));
    this.expanded.set(null);
    this.showPresets.set(false);
  }

  openPresets() {
    this.activePresetCategory.set(this.guessPresetCategory());
    this.showPresets.set(true);
  }

  /**
   * Pick a sensible preset category based on the page we are editing so the
   * picker opens on the most useful tab. Home pages default to "home",
   * and custom pages are matched by slug / title keywords.
   */
  private guessPresetCategory(): PresetCategory {
    const p = this.page();
    if (!p) return 'home';
    if (p.isHome) return 'home';
    const needle = `${p.slug} ${p.title}`.toLowerCase();
    const rules: Array<[RegExp, PresetCategory]> = [
      [/\b(about|story|team|mission|our-)/, 'about'],
      [/\b(contact|reach|get-in-touch|support)\b/, 'contact'],
      [/\b(faq|help|question|policy|policies|shipping|returns?)\b/, 'faq'],
      [/\b(shop|store|catalog|catalogue|products|collection|sale)\b/, 'shop'],
      [/\b(launch|campaign|coming-soon|landing|promo)\b/, 'landing']
    ];
    for (const [re, cat] of rules) {
      if (re.test(needle)) return cat;
    }
    return 'home';
  }

  reset() {
    const raw = this.originalJson();
    this.sections.set(raw ? JSON.parse(raw) : []);
    this.expanded.set(null);
  }

  async save() {
    const p = this.page();
    if (!p) return;
    this.error.set(null);
    this.saved.set(false);
    this.saving.set(true);
    try {
      const updated = await this.pagesService.updatePage(p.id, { sections: this.sections() });
      this.page.set(updated);
      this.sections.set(structuredClone(updated.sections ?? []));
      this.originalJson.set(JSON.stringify(updated.sections ?? []));
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
      this.reloadPreview();
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to save.');
    } finally {
      this.saving.set(false);
    }
  }

  async saveSettings() {
    const p = this.page();
    if (!p) return;
    this.savingSettings.set(true);
    this.settingsError.set(null);
    try {
      const patch: any = {
        title: this.settingsForm.title.trim(),
        seoTitle: this.settingsForm.seoTitle.trim(),
        seoDescription: this.settingsForm.seoDescription.trim()
      };
      if (!p.isHome) {
        patch.slug = this.settingsForm.slug.trim();
        patch.visible = this.settingsForm.visible;
      }
      const updated = await this.pagesService.updatePage(p.id, patch);
      this.page.set(updated);

      if (!p.isHome) {
        await this.syncNavPlacement(updated.slug, updated.title, this.settingsForm.inHeader, this.settingsForm.inFooter);
      }

      this.showSettings.set(false);
      this.reloadPreview();
    } catch (e: any) {
      this.settingsError.set(e?.message ?? 'Could not save.');
    } finally {
      this.savingSettings.set(false);
    }
  }

  private async syncNavPlacement(pageSlug: string, pageTitle: string, inHeader: boolean, inFooter: boolean) {
    const store = this.storeService.store();
    if (!store) return;
    const items: NavItem[] = structuredClone(store.navItems ?? []) as NavItem[];
    const idx = items.findIndex((n) => n.kind === 'page' && n.pageSlug === pageSlug);

    if (!inHeader && !inFooter) {
      if (idx === -1) return;
      items.splice(idx, 1);
      await this.storeService.updateNav(items);
      return;
    }

    const placement = inHeader && inFooter ? 'both' : inHeader ? 'header' : 'footer';
    if (idx === -1) {
      items.push({
        id: `nav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        kind: 'page',
        label: pageTitle || pageSlug,
        pageSlug,
        placement
      });
    } else {
      const existing = items[idx];
      if (existing.kind !== 'page') return;
      items[idx] = { ...existing, placement };
    }
    await this.storeService.updateNav(items);
  }

  reloadPreview() {
    const frame = this.previewFrame()?.nativeElement;
    if (!frame) return;
    try {
      frame.contentWindow?.postMessage({ type: 'casstore:reload' }, window.location.origin);
    } catch { /* ignore */ }
    const href = this.previewHref();
    if (!href) return;
    frame.src = 'about:blank';
    setTimeout(() => { frame.src = href; }, 30);
  }
}
