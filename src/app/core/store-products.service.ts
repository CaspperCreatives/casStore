import { Injectable, inject, signal } from '@angular/core';
import { ApiClient } from './api-client';

export type StoreProduct = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  active: boolean;
  category?: string;
};

export type StoreProductInput = Omit<StoreProduct, 'id'>;

@Injectable({ providedIn: 'root' })
export class StoreProductsService {
  private api = inject(ApiClient);

  readonly products = signal<StoreProduct[]>([]);
  readonly status = signal<'idle' | 'loading' | 'error'>('idle');
  readonly error = signal<string | null>(null);

  /** List all products (including inactive) for the store owner */
  async loadOwnerProducts(storeId: string) {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; products: StoreProduct[] }>(
        'storeOwnerProductsList',
        { storeId },
        { auth: true }
      );
      this.products.set(json.products ?? []);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      throw e;
    }
  }

  /** List public/active products for a store (no auth) */
  async loadPublicProducts(storeId: string): Promise<StoreProduct[]> {
    try {
      const json = await this.api.get<{ ok: true; products: StoreProduct[] }>(
        'storeProductsList',
        { storeId }
      );
      return json.products ?? [];
    } catch {
      return [];
    }
  }

  /** Load a single public product */
  async getProduct(storeId: string, productId: string): Promise<StoreProduct | null> {
    try {
      const json = await this.api.get<{ ok: true; product: StoreProduct }>(
        'storeProductGet',
        { storeId, productId }
      );
      return json.product;
    } catch {
      return null;
    }
  }

  async create(storeId: string, data: StoreProductInput): Promise<string> {
    const json = await this.api.post<{ ok: true; productId: string }>(
      'storeProductsCreate',
      { ...data, storeId },
      { auth: true }
    );
    await this.loadOwnerProducts(storeId);
    return json.productId;
  }

  async update(storeId: string, productId: string, patch: Partial<StoreProductInput>) {
    await this.api.patch(
      `storeProductsUpdate?storeId=${storeId}&productId=${productId}`,
      patch,
      { auth: true }
    );
    await this.loadOwnerProducts(storeId);
  }

  async remove(storeId: string, productId: string) {
    await this.api.delete(
      `storeProductsDelete`,
      { storeId, productId },
      { auth: true }
    );
    await this.loadOwnerProducts(storeId);
  }
}
