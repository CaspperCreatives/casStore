import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, Check, LucideAngularModule, Mail, MailOpen, Trash2 } from 'lucide-angular';
import { FormSubmission, StoreFormsService } from '../../core/store-forms.service';

@Component({
  selector: 'app-my-store-submission-detail-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <a routerLink="/my-store/submissions"
          class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <lucide-angular [img]="ArrowLeftIcon" class="h-4 w-4" />
          Back
        </a>
      </div>

      @if (loading()) {
        <div class="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white"></div>
      } @else if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      } @else {
        @if (submission(); as s) {
          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {{ s.formTitle }}
                </div>
                <h1 class="mt-0.5 truncate text-xl font-semibold text-slate-900">
                  {{ fmtDate(s.submittedAt) }}
                </h1>
                <div class="mt-1 truncate text-xs text-slate-500">
                  From {{ s.pageTitle || s.pageSlug || 'page' }}
                  @if (s.ip) { · {{ s.ip }} }
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button"
                  class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  [disabled]="updating()"
                  (click)="toggleRead(s)">
                  <lucide-angular [img]="s.read ? MailIcon : MailOpenIcon" class="h-4 w-4" />
                  {{ s.read ? 'Mark as unread' : 'Mark as read' }}
                </button>
                <button type="button"
                  class="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  [disabled]="updating()"
                  (click)="remove(s)">
                  <lucide-angular [img]="TrashIcon" class="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            <dl class="mt-6 divide-y divide-slate-100 border-t border-slate-100">
              @for (row of rows(); track row.id) {
                <div class="grid grid-cols-1 gap-1 py-3 md:grid-cols-[200px_1fr] md:gap-4">
                  <dt class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {{ row.label }}
                  </dt>
                  <dd class="whitespace-pre-wrap break-words text-sm text-slate-900">
                    {{ row.display }}
                  </dd>
                </div>
              } @empty {
                <div class="py-6 text-center text-sm text-slate-500">Empty submission.</div>
              }
            </dl>
          </div>

          @if (deleted()) {
            <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <lucide-angular [img]="CheckIcon" class="mr-1 inline h-4 w-4" />
              Submission deleted.
            </div>
          }
        } @else {
          <div class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div class="font-semibold text-slate-700">Submission not found</div>
            <p class="mt-1 text-sm text-slate-500">It may have been deleted.</p>
          </div>
        }
      }
    </div>
  `
})
export class MyStoreSubmissionDetailPage {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly TrashIcon = Trash2;
  readonly MailIcon = Mail;
  readonly MailOpenIcon = MailOpen;
  readonly CheckIcon = Check;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formsService = inject(StoreFormsService);

  submissionId = signal<string>('');
  submission = signal<FormSubmission | null>(null);
  loading = signal(true);
  updating = signal(false);
  deleted = signal(false);
  error = signal<string | null>(null);

  rows = computed<Array<{ id: string; label: string; display: string }>>(() => {
    const s = this.submission();
    if (!s) return [];
    return s.fields.map((f) => {
      const raw = s.payload[f.id];
      let display: string;
      if (f.type === 'checkbox') {
        display = raw ? 'Yes' : 'No';
      } else if (typeof raw === 'string') {
        display = raw || '—';
      } else if (raw == null) {
        display = '—';
      } else {
        display = String(raw);
      }
      return { id: f.id, label: f.label, display };
    });
  });

  constructor() {
    this.submissionId.set(this.route.snapshot.paramMap.get('submissionId') ?? '');
    this.route.paramMap.subscribe((p) => {
      this.submissionId.set(p.get('submissionId') ?? '');
    });

    effect(() => {
      const id = this.submissionId();
      if (!id) return;
      void this.load(id);
    });
  }

  private async load(id: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.formsService.list({ limit: 500 });
      const found = res.submissions.find((s) => s.id === id) ?? null;
      this.submission.set(found);
      if (found && !found.read) {
        void this.formsService.markRead(found.id, true).catch(() => {});
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not load submission.');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleRead(s: FormSubmission) {
    this.updating.set(true);
    try {
      const next = !s.read;
      await this.formsService.markRead(s.id, next);
      this.submission.set({ ...s, read: next });
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not update.');
    } finally {
      this.updating.set(false);
    }
  }

  async remove(s: FormSubmission) {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    this.updating.set(true);
    try {
      await this.formsService.delete(s.id);
      this.deleted.set(true);
      setTimeout(() => this.router.navigateByUrl('/my-store/submissions'), 400);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not delete.');
    } finally {
      this.updating.set(false);
    }
  }

  fmtDate(ms: number | null | undefined): string {
    if (!ms) return '';
    return new Date(ms).toLocaleString();
  }
}
