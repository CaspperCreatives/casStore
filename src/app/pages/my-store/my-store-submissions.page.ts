import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Inbox, LucideAngularModule, Mail, RefreshCw } from 'lucide-angular';
import { FormSubmission, FormSubmissionSummary, StoreFormsService } from '../../core/store-forms.service';

@Component({
  selector: 'app-my-store-submissions-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Submissions</h1>
          <p class="mt-0.5 text-xs text-slate-500">Responses submitted through forms on your store pages</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          [disabled]="loading()"
          (click)="refresh()">
          <lucide-angular [img]="RefreshIcon" class="h-4 w-4" [class.animate-spin]="loading()" />
          Refresh
        </button>
      </div>

      @if (error(); as err) {
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ err }}</div>
      }

      @if (loading() && submissions().length === 0) {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track _) {
            <div class="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (submissions().length === 0 && !loading()) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <lucide-angular [img]="InboxIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <div class="mt-3 font-semibold text-slate-700">No submissions yet</div>
          <p class="mt-1 text-sm text-slate-500">
            Add a form section to any page on your storefront to start collecting responses.
          </p>
          <a routerLink="/my-store/storefront"
            class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Go to storefront
          </a>
        </div>
      } @else {
        <!-- Form summary cards -->
        @if (forms().length > 0) {
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            @for (form of forms(); track form.sectionId) {
              <button type="button"
                class="text-left rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:border-slate-300"
                [class.border-slate-900]="selectedSectionId() === form.sectionId"
                [class.border-slate-200]="selectedSectionId() !== form.sectionId"
                (click)="selectForm(form.sectionId)">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="truncate font-semibold text-slate-900">{{ form.formTitle }}</div>
                    <div class="truncate text-xs text-slate-500">
                      {{ form.pageTitle || form.pageSlug || 'Page' }}
                    </div>
                  </div>
                  @if (form.unread > 0) {
                    <span class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      {{ form.unread }} new
                    </span>
                  }
                </div>
                <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{{ form.total }} total</span>
                  @if (form.lastSubmittedAt) {
                    <span>Last: {{ fmtDate(form.lastSubmittedAt) }}</span>
                  }
                </div>
              </button>
            }
            @if (selectedSectionId()) {
              <button type="button"
                class="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                (click)="selectForm(null)">
                Show all forms
              </button>
            }
          </div>
        }

        <!-- Submission table -->
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
            {{ filteredLabel() }}
          </div>
          <ul class="divide-y divide-slate-100">
            @for (s of filteredSubmissions(); track s.id) {
              <li>
                <a [routerLink]="['/my-store/submissions', s.id]"
                  class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                  <span class="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <lucide-angular [img]="MailIcon" class="h-4 w-4 text-slate-500" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="truncate font-semibold"
                        [class.text-slate-900]="!s.read"
                        [class.text-slate-600]="s.read">
                        {{ summaryLine(s) }}
                      </span>
                      @if (!s.read) {
                        <span class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">New</span>
                      }
                    </div>
                    <div class="mt-0.5 truncate text-xs text-slate-500">
                      {{ s.formTitle }} · {{ s.pageTitle || s.pageSlug }} · {{ fmtDate(s.submittedAt) }}
                    </div>
                  </div>
                </a>
              </li>
            } @empty {
              <li class="px-4 py-8 text-center text-sm text-slate-500">No submissions match the selected form.</li>
            }
          </ul>
        </div>
      }
    </div>
  `
})
export class MyStoreSubmissionsPage {
  readonly InboxIcon = Inbox;
  readonly RefreshIcon = RefreshCw;
  readonly MailIcon = Mail;

  private forms_ = inject(StoreFormsService);
  private router = inject(Router);

  submissions = signal<FormSubmission[]>([]);
  forms = signal<FormSubmissionSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedSectionId = signal<string | null>(null);

  filteredSubmissions = computed(() => {
    const sel = this.selectedSectionId();
    if (!sel) return this.submissions();
    return this.submissions().filter((s) => s.sectionId === sel);
  });

  filteredLabel = computed(() => {
    const sel = this.selectedSectionId();
    if (!sel) return `${this.submissions().length} submission${this.submissions().length === 1 ? '' : 's'}`;
    const title = this.forms().find((f) => f.sectionId === sel)?.formTitle ?? 'Form';
    const count = this.filteredSubmissions().length;
    return `${title} — ${count} submission${count === 1 ? '' : 's'}`;
  });

  constructor() {
    void this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.forms_.list();
      this.submissions.set(res.submissions);
      this.forms.set(res.forms);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not load submissions.');
    } finally {
      this.loading.set(false);
    }
  }

  refresh() {
    void this.load();
  }

  selectForm(sectionId: string | null) {
    this.selectedSectionId.set(sectionId);
  }

  summaryLine(s: FormSubmission): string {
    const name = this.firstValue(s, ['name', 'fullName']);
    const email = this.firstValue(s, ['email']);
    if (name && email) return `${name} · ${email}`;
    if (name) return String(name);
    if (email) return String(email);
    const first = s.fields[0];
    if (first) {
      const v = s.payload[first.id];
      if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 80);
    }
    return 'New submission';
  }

  private firstValue(s: FormSubmission, labelTokens: string[]): string | null {
    for (const f of s.fields) {
      const label = String(f.label ?? '').toLowerCase();
      if (labelTokens.some((t) => label.includes(t))) {
        const v = s.payload[f.id];
        if (typeof v === 'string' && v.trim()) return v.trim();
      }
    }
    return null;
  }

  fmtDate(ms: number | null | undefined): string {
    if (!ms) return '';
    const d = new Date(ms);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
  }
}
