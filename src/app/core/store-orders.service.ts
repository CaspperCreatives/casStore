import { Injectable, inject, signal } from '@angular/core';
import { ApiClient } from './api-client';

export type StoreOrder = {
  id: string;
  userId: string;
  storeId: string;
  status: string;
  currency: string;
  totalCents: number;
  shippingAddress?: any;
  notes?: string;
  createdAt?: any;
};

export type StoreCartItem = {
  productId: string;
  quantity: number;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
};

@Injectable({ providedIn: 'root' })
export class StoreOrdersService {
  private api = inject(ApiClient);

  readonly orders = signal<StoreOrder[]>([]);
  readonly cartItems = signal<StoreCartItem[]>([]);
  readonly status = signal<'idle' | 'loading' | 'error'>('idle');
  readonly error = signal<string | null>(null);

  /** Load orders for the store owner */
  async loadStoreOrders(storeId: string, statusFilter?: string) {
    this.status.set('loading');
    this.error.set(null);
    try {
      const params: any = { storeId };
      if (statusFilter) params.status = statusFilter;
      const json = await this.api.get<{ ok: true; orders: StoreOrder[] }>(
        'storeOrdersList',
        params,
        { auth: true }
      );
      this.orders.set(json.orders ?? []);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      throw e;
    }
  }

  /** Load the current customer's orders across all stores */
  async loadMyOrders() {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; orders: StoreOrder[] }>(
        'storeMyOrdersList',
        undefined,
        { auth: true }
      );
      this.orders.set(json.orders ?? []);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      throw e;
    }
  }

  /** Update order status (owner only) */
  async updateStatus(storeId: string, orderId: string, status: string) {
    await this.api.patch('storeOrdersUpdateStatus', { storeId, orderId, status }, { auth: true });
    await this.loadStoreOrders(storeId);
  }

  /** Load the cart for a specific store */
  async loadCart(storeId: string) {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; items: StoreCartItem[] }>(
        'storeCartGet',
        { storeId },
        { auth: true }
      );
      this.cartItems.set(json.items ?? []);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      throw e;
    }
  }

  /** Set item quantity in a store cart */
  async setCartItem(storeId: string, productId: string, quantity: number) {
    await this.api.post('storeCartSetItem', { storeId, productId, quantity: Math.max(0, Math.floor(quantity)) }, { auth: true });
    await this.loadCart(storeId);
  }

  /** Add to cart */
  async addToCart(storeId: string, productId: string, qty = 1) {
    const current = this.cartItems().find((i) => i.productId === productId)?.quantity ?? 0;
    await this.setCartItem(storeId, productId, current + qty);
  }

  /** Place order for a store */
  async checkout(params: {
    storeId: string;
    currency?: string;
    shippingAddress?: any;
    notes?: string;
  }): Promise<string> {
    const json = await this.api.post<{ ok: true; orderId: string }>(
      'storeCheckout',
      { currency: 'USD', ...params },
      { auth: true }
    );
    return json.orderId;
  }
}
