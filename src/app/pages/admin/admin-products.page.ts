import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ApiClient } from '../../core/api-client';
import { LucideAngularModule, Package, Pencil, Plus, Trash2, X } from 'lucide-angular';

type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  active: boolean;
};

type ProductForm = Omit<Product, 'id'> & { imageUrl: string };

const emptyForm = (): ProductForm => ({
  name: '', description: '', imageUrl: '', priceCents: 0,
  currency: 'USD', stock: 0, active: true
});

const CURRENCY_OPTIONS = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD',
  'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD',
  'EGP', 'MAD', 'TND', 'DZD', 'LYD', 'IQD', 'SYP', 'YER',
  'LBP', 'SDG', 'SOS', 'MRO', 'DJF', 'KMF'
] as const;

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-lg font-semibold text-slate-900">Platform Products</h1>
          <p class="text-xs text-slate-500">Manage global product catalog (legacy/platform-level)</p>
        </div>
        <button type="button" class="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800" (click)="openCreate()">
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add product
        </button>
      </div>

      @if (!firebaseConfigured()) {
        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Configure Firebase.</div>
      } @else if (status() === 'loading' && products().length === 0) {
        <div class="space-y-3">@for (_ of [1,2,3]; track _) { <div class="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white"></div> }</div>
      } @else if (products().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <lucide-angular [img]="PackageIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <p class="mt-3 text-sm text-slate-500">No products yet.</p>
        </div>
      } @else {
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table class="w-full text-sm">
            <thead class="border-b border-slate-200 bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
                <th class="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">Price</th>
                <th class="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">Stock</th>
                <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (p of products(); track p.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 font-semibold text-slate-900">{{ p.name }}</td>
                  <td class="hidden px-4 py-3 text-right text-slate-700 sm:table-cell">{{ fmtPrice(p.priceCents, p.currency) }}</td>
                  <td class="hidden px-4 py-3 text-right md:table-cell" [class.text-red-600]="p.stock < 5" [class.font-semibold]="p.stock < 5">{{ p.stock }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      [class.bg-emerald-100]="p.active" [class.text-emerald-800]="p.active"
                      [class.bg-slate-100]="!p.active" [class.text-slate-600]="!p.active">
                      {{ p.active ? 'Active' : 'Hidden' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-2">
                      <button type="button" class="rounded-xl border border-slate-200 bg-white p-1.5 hover:bg-slate-50" (click)="openEdit(p)">
                        <lucide-angular [img]="PencilIcon" class="h-4 w-4 text-slate-600" />
                      </button>
                      <button type="button" class="rounded-xl border border-red-200 bg-white p-1.5 hover:bg-red-50" (click)="deleteProduct(p)">
                        <lucide-angular [img]="Trash2Icon" class="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (saveError()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{{ saveError() }}</div>
      }
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeModal()">
        <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-slate-900">{{ editingId() ? 'Edit product' : 'New product' }}</h2>
            <button type="button" class="rounded-xl p-1.5 hover:bg-slate-100" (click)="closeModal()">
              <lucide-angular [img]="XIcon" class="h-5 w-5 text-slate-500" />
            </button>
          </div>
          <form class="mt-5 space-y-4" (submit)="$event.preventDefault(); saveProduct()">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Name *</label>
                <input type="text" [(ngModel)]="form.name" name="name" required
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
              </div>
              <div>
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Price (cents) *</label>
                <input type="number" [(ngModel)]="form.priceCents" name="priceCents" min="0"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
              </div>
              <div>
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Stock *</label>
                <input type="number" [(ngModel)]="form.stock" name="stock" min="0"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
              </div>
              <div class="col-span-2">
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Currency</label>
                <select [(ngModel)]="form.currency" name="currency"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white">
                  @for (cur of currencyOptions; track cur) {
                    <option [value]="cur">{{ cur }}</option>
                  }
                </select>
              </div>
              <div class="col-span-2">
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Image URL</label>
                <input type="url" [(ngModel)]="form.imageUrl" name="imageUrl"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
              </div>
              <div class="col-span-2">
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Description *</label>
                <textarea [(ngModel)]="form.description" name="description" rows="3" required
                  class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"></textarea>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="form.active" name="active" id="prod-active" class="h-4 w-4 rounded" />
                <label for="prod-active" class="text-sm text-slate-700">Active</label>
              </div>
            </div>
            <div class="flex justify-end gap-3">
              <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" (click)="closeModal()">Cancel</button>
              <button type="submit" class="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50" [disabled]="saveStatus() === 'loading'">
                {{ saveStatus() === 'loading' ? 'Saving...' : editingId() ? 'Save' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class AdminProductsPage {
  readonly PackageIcon = Package;
  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;
  readonly XIcon = X;
  readonly currencyOptions = CURRENCY_OPTIONS;

  private api = inject(ApiClient);
  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));

  products = signal<Product[]>([]);
  status = signal<'idle' | 'loading' | 'error'>('idle');
  saveStatus = signal<'idle' | 'loading'>('idle');
  saveError = signal<string | null>(null);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  form: ProductForm = emptyForm();

  constructor() {
    if (this.firebaseConfigured()) void this.load();
  }

  private async load() {
    this.status.set('loading');
    try {
      const json = await this.api.get<{ ok: true; products: Product[] }>('adminProductsList', undefined, { auth: true });
      this.products.set(json.products ?? []);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
    }
  }

  openCreate() { this.form = emptyForm(); this.editingId.set(null); this.saveError.set(null); this.showModal.set(true); }
  openEdit(p: Product) {
    this.form = { name: p.name, description: p.description, imageUrl: p.imageUrl ?? '', priceCents: p.priceCents, currency: p.currency, stock: p.stock, active: p.active };
    this.editingId.set(p.id); this.saveError.set(null); this.showModal.set(true);
  }
  closeModal() { this.showModal.set(false); this.editingId.set(null); }

  async saveProduct() {
    this.saveStatus.set('loading');
    this.saveError.set(null);
    try {
      const data = { ...this.form, imageUrl: this.form.imageUrl || null, priceCents: Number(this.form.priceCents), stock: Number(this.form.stock) };
      const id = this.editingId();
      if (id) {
        await this.api.patch(`adminProductsUpdate?id=${id}`, data, { auth: true });
      } else {
        await this.api.post('adminProductsCreate', data, { auth: true });
      }
      this.closeModal();
      await this.load();
    } catch (e: any) {
      this.saveError.set(e?.message ?? String(e));
    } finally {
      this.saveStatus.set('idle');
    }
  }

  async deleteProduct(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await this.api.delete('adminProductsDelete', { id: p.id }, { auth: true });
      await this.load();
    } catch (e: any) {
      this.saveError.set(e?.message ?? String(e));
    }
  }

  fmtPrice(cents: number, currency: string) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100); }
    catch { return `$${(cents / 100).toFixed(2)}`; }
  }
}
