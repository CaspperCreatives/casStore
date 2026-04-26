import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../core/store.service';
import { StoreProduct, StoreProductsService } from '../../core/store-products.service';
import { UploadService } from '../../core/upload.service';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, Package, Pencil, Plus, Trash2, TriangleAlert, X } from 'lucide-angular';

type ProductForm = {
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number;
  currency: string;
  stock: number;
  active: boolean;
  category: string;
};

const emptyForm = (): ProductForm => ({
  name: '', description: '', imageUrl: '', priceCents: 0,
  currency: 'USD', stock: 0, active: true, category: ''
});

const CURRENCY_OPTIONS = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD',
  'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD',
  'EGP', 'MAD', 'TND', 'DZD', 'LYD', 'IQD', 'SYP', 'YER',
  'LBP', 'SDG', 'SOS', 'MRO', 'DJF', 'KMF'
] as const;

@Component({
  selector: 'app-my-store-products-page',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-slate-900">Products</h1>
          <p class="mt-0.5 text-xs text-slate-500">Manage your store's product catalogue</p>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
          (click)="openCreate()"
        >
          <lucide-angular [img]="PlusIcon" class="h-4 w-4" />
          Add product
        </button>
      </div>

      @if (!firebaseConfigured()) {
        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Configure Firebase to manage products.
        </div>
      } @else if (status() === 'loading' && products().length === 0) {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track _) {
            <div class="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <lucide-angular [img]="PackageIcon" class="mx-auto h-12 w-12 text-slate-300" />
          <div class="mt-3 font-semibold text-slate-700">No products yet</div>
          <p class="mt-1 text-sm text-slate-500">Add your first product to start selling.</p>
          <button type="button" class="mt-4 rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800" (click)="openCreate()">
            Add product
          </button>
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
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      @if (p.imageUrl) {
                        <img [src]="p.imageUrl" alt="" class="h-10 w-10 rounded-xl object-cover border border-slate-200" (error)="$any($event.target).style.display='none'" />
                      } @else {
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                          <lucide-angular [img]="PackageIcon" class="h-5 w-5 text-slate-400" />
                        </div>
                      }
                      <div>
                        <div class="font-semibold text-slate-900">{{ p.name }}</div>
                        @if (p.category) {
                          <div class="text-xs text-slate-500">{{ p.category }}</div>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="hidden px-4 py-3 text-right font-semibold text-slate-900 sm:table-cell">
                    {{ fmtPrice(p.priceCents, p.currency) }}
                  </td>
                  <td class="hidden px-4 py-3 text-right md:table-cell"
                    [class.text-red-600]="p.stock < 5"
                    [class.font-semibold]="p.stock < 5"
                    [class.text-slate-700]="p.stock >= 5">
                    {{ p.stock }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      [class.bg-emerald-100]="p.active" [class.text-emerald-800]="p.active"
                      [class.bg-slate-100]="!p.active" [class.text-slate-600]="!p.active">
                      {{ p.active ? 'Active' : 'Hidden' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
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

    <!-- Product modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeModal()">
        <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-slate-900">{{ editingId() ? 'Edit product' : 'New product' }}</h2>
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
                <input type="number" [(ngModel)]="form.priceCents" name="priceCents" min="0" required
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                <p class="mt-0.5 text-[11px] text-slate-400">e.g. 1999 = $19.99</p>
              </div>
              <div>
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Stock *</label>
                <input type="number" [(ngModel)]="form.stock" name="stock" min="0" required
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
              </div>
              <div>
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Category</label>
                <input type="text" [(ngModel)]="form.category" name="category"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
              </div>
              <div>
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
                  placeholder="https://example.com/image.jpg"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                <label class="text-center mt-2 block cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Or Choose image file
                  <input type="file" accept="image/*" class="hidden" (change)="onImageFile($event)" />
                </label>
                @if (imageFileName()) {
                  <p class="mt-1 text-xs text-slate-500">Selected file: {{ imageFileName() }}</p>
                }
              </div>
              <div class="col-span-2">
                <label class="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-slate-600">Description *</label>
                <textarea [(ngModel)]="form.description" name="description" rows="3" required
                  class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"></textarea>
              </div>
              <div class="col-span-2 flex items-center gap-3">
                <input type="checkbox" [(ngModel)]="form.active" name="active" id="active" class="h-4 w-4 rounded" />
                <label for="active" class="text-sm text-slate-700">Active (visible to customers)</label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" (click)="closeModal()">Cancel</button>
              <button type="submit"
                class="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                [disabled]="saveStatus() === 'loading'">
                {{ saveStatus() === 'loading' ? 'Saving...' : editingId() ? 'Save changes' : 'Create product' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class MyStoreProductsPage {
  readonly PackageIcon = Package;
  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;
  readonly XIcon = X;
  readonly TriangleAlertIcon = TriangleAlert;
  readonly currencyOptions = CURRENCY_OPTIONS;

  private storeService = inject(StoreService);
  private productsService = inject(StoreProductsService);
  private uploader = inject(UploadService);

  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
  products = this.productsService.products;
  status = this.productsService.status;
  saveStatus = signal<'idle' | 'loading'>('idle');
  saveError = signal<string | null>(null);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  imageFile = signal<File | null>(null);
  imageFileName = signal('');
  form: ProductForm = emptyForm();

  constructor() {
    if (this.firebaseConfigured()) void this.load();
  }

  private async load() {
    const storeId = this.storeService.storeId();
    if (!storeId) return;
    await this.productsService.loadOwnerProducts(storeId).catch(() => {});
  }

  openCreate() {
    this.form = emptyForm();
    this.editingId.set(null);
    this.clearImageSelection();
    this.saveError.set(null);
    this.showModal.set(true);
  }

  openEdit(p: StoreProduct) {
    this.form = {
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl ?? '',
      priceCents: p.priceCents,
      currency: p.currency,
      stock: p.stock,
      active: p.active,
      category: p.category ?? ''
    };
    this.editingId.set(p.id);
    this.clearImageSelection();
    this.saveError.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
    this.clearImageSelection();
    this.saveError.set(null);
  }

  async saveProduct() {
    const storeId = this.storeService.storeId();
    if (!storeId) return;
    this.saveStatus.set('loading');
    this.saveError.set(null);
    try {
      let imageUrl = this.form.imageUrl || null;
      const selectedImage = this.imageFile();
      if (selectedImage) {
        const uploaded = await this.uploader.upload(selectedImage, 'products');
        imageUrl = uploaded.publicUrl;
      }
      const data = {
        ...this.form,
        imageUrl,
        priceCents: Number(this.form.priceCents),
        stock: Number(this.form.stock)
      };
      const id = this.editingId();
      if (id) {
        await this.productsService.update(storeId, id, data);
      } else {
        await this.productsService.create(storeId, data);
      }
      if (imageUrl) this.form.imageUrl = imageUrl;
      this.closeModal();
    } catch (e: any) {
      this.saveError.set(e?.message ?? String(e));
    } finally {
      this.saveStatus.set('idle');
    }
  }

  onImageFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.imageFile.set(file);
    this.imageFileName.set(file?.name ?? '');
    input.value = '';
  }

  private clearImageSelection() {
    this.imageFile.set(null);
    this.imageFileName.set('');
  }

  async deleteProduct(p: StoreProduct) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const storeId = this.storeService.storeId();
    if (!storeId) return;
    try {
      await this.productsService.remove(storeId, p.id);
    } catch (e: any) {
      this.saveError.set(e?.message ?? String(e));
    }
  }

  fmtPrice(cents: number, currency: string) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(cents / 100);
    } catch {
      return `$${(cents / 100).toFixed(2)}`;
    }
  }
}
