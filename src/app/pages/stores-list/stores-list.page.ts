import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiClient, ApiClientError } from '../../core/api-client';
import { environment } from '../../../environments/environment';
import { ExternalLink, LucideAngularModule } from 'lucide-angular';

type OwnerInfo = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

type StoresListRow = {
  adminName: string;
  owner: OwnerInfo;
  store: Record<string, unknown> & { id?: string; slug?: string; name?: string; active?: boolean };
};

@Component({
  selector: 'app-stores-list-page',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-dvh bg-slate-50 px-4 py-8 text-slate-900 md:px-8">
      <div class="mx-auto max-w-6xl space-y-6">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Internal</p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight">All stores</h1>
            <p class="mt-1 text-sm text-slate-600">
              Owner display name or email, store name, live link, and full Firestore payload.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a
              routerLink="/admin"
              class="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Admin home
            </a>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              [disabled]="loading()"
              (click)="reload()"
            >
              Refresh
            </button>
          </div>
        </header>

        @if (error()) {
          <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {{ error() }}
          </div>
        }

        @if (loading() && rows().length === 0) {
          <div class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">Loading…</div>
        } @else if (!loading() && rows().length === 0) {
          <div class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">No stores found.</div>
        } @else {
          <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3">Owner (admin)</th>
                    <th class="px-4 py-3">Store</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Open</th>
                    <th class="px-4 py-3 w-28">Data</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (row of rows(); track row.store.id) {
                    <tr class="align-top hover:bg-slate-50/80">
                      <td class="px-4 py-3">
                        <div class="font-semibold text-slate-900">{{ row.adminName }}</div>
                        <div class="mt-0.5 text-xs text-slate-500">
                          @if (row.owner.email) {
                            {{ row.owner.email }}
                          } @else {
                            {{ row.owner.uid }}
                          }
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="font-semibold text-slate-900">{{ row.store.name ?? '—' }}</div>
                        <div class="mt-0.5 font-mono text-xs text-slate-600">{{ row.store.slug }}</div>
                        <div class="mt-0.5 font-mono text-[11px] text-slate-400">{{ row.store.id }}</div>
                      </td>
                      <td class="px-4 py-3">
                        @if (row.store.active !== false) {
                          <span class="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">Active</span>
                        } @else {
                          <span class="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">Inactive</span>
                        }
                      </td>
                      <td class="px-4 py-3">
                        <a
                          [href]="storefrontUrl(row.store.slug)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View
                          <lucide-angular [img]="ExternalLinkIcon" class="h-3.5 w-3.5" />
                        </a>
                      </td>
                      <td class="px-4 py-3">
                        <button
                          type="button"
                          class="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                          (click)="toggleRow(row.store.id)"
                        >
                          {{ expandedId() === row.store.id ? 'Hide' : 'JSON' }}
                        </button>
                      </td>
                    </tr>
                    @if (expandedId() === row.store.id) {
                      <tr class="bg-slate-50">
                        <td colspan="5" class="px-4 py-3">
                          <pre
                            class="max-h-[min(480px,50vh)] overflow-auto rounded-2xl border border-slate-200 bg-white p-3 font-mono text-[11px] leading-relaxed text-slate-800"
                            >{{ prettyJson(row.store) }}</pre
                          >
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
            <div class="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
              Showing up to {{ rows().length }} stores (newest first by <code class="font-mono">createdAt</code> when present).
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class StoresListPage {
  private api = inject(ApiClient);

  readonly ExternalLinkIcon = ExternalLink;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly rows = signal<StoresListRow[]>([]);
  readonly expandedId = signal<string | null>(null);

  private root = environment.rootDomain.replace(/^www\./, '');
  private apexHost = environment.rootDomain;

  constructor() {
    void this.reload();
  }

  storefrontUrl(slug: string | undefined): string {
    const s = String(slug ?? '').trim();
    if (!s) return '#';
    if (environment.subdomainsEnabled) {
      return `https://${s}.${this.root}/`;
    }
    return `https://${this.apexHost}/store/${s}/`;
  }

  prettyJson(store: Record<string, unknown>): string {
    try {
      return JSON.stringify(store, null, 2);
    } catch {
      return String(store);
    }
  }

  toggleRow(id: string | undefined) {
    if (!id) return;
    this.expandedId.update((cur) => (cur === id ? null : id));
  }

  async reload() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.api.get<{ ok: true; items: StoresListRow[] }>('adminStoresList', {});
      this.rows.set(res.items ?? []);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Request failed.';
      this.error.set(msg);
      this.rows.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
