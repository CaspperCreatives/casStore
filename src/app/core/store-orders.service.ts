import { Injectable, inject, signal } from '@angular/core';
import { ApiClient } from './api-client';
import { AuthService } from './auth.service';
import { TenantCustomerAuthService } from './tenant-customer-auth.service';

/**
 * Store order `status` values accepted by the API (`storeOrdersUpdateStatus`).
 * Keep in sync with `api/functions/src/http/storeOrdersHandlers.ts` ALLOWED_STATUSES.
 */
export const STORE_ORDER_ALLOWED_STATUSES: readonly string[] = [
  'PENDING_APPROVAL',
  'CONFIRMED',
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
];

/** First entry is empty string = no filter (e.g. owner order list). */
export const STORE_ORDER_STATUS_FILTER_OPTIONS: readonly string[] = ['', ...STORE_ORDER_ALLOWED_STATUSES];

export const STORE_ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'Pending approval',
  CONFIRMED: 'Confirmed',
  PENDING_PAYMENT: 'Pending payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded'
};

export function storeOrderStatusLabel(status: string): string {
  return STORE_ORDER_STATUS_LABELS[status] ?? status;
}

export function storeOrderStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-emerald-100 text-emerald-800',
    PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-slate-100 text-slate-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-orange-100 text-orange-800'
  };
  return map[status] ?? 'bg-slate-100 text-slate-600';
}

export type PaymentMethod = 'CASH_ON_DELIVERY';

export type StoreOrder = {
  id: string;
  userId: string | null;
  storeId: string;
  status: string;
  currency: string;
  totalCents: number;
  shippingAddress?: any;
  notes?: string;
  paymentMethod?: PaymentMethod | string;
  buyerEmail?: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  buyerLocation?: string | null;
  createdAt?: any;
  updatedAt?: any;
};

export type StoreOrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export type StoreCartItem = {
  productId: string;
  quantity: number;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
};

export type StoreCustomer = {
  id: string;
  type: 'registered' | 'guest';
  uid: string | null;
  email: string;
  fullName: string;
  phone: string;
  location: string;
  ordersCount: number;
  totalSpentCents: number;
  lastOrderId?: string | null;
  lastOrderAt?: any;
  updatedAt?: any;
  createdAt?: any;
};

@Injectable({ providedIn: 'root' })
export class StoreOrdersService {
  private api = inject(ApiClient);
  private auth = inject(AuthService);
  private tenantCustomerAuth = inject(TenantCustomerAuthService);
  private readonly guestTokenStorageKey = 'casstore:guest-token';

  readonly orders = signal<StoreOrder[]>([]);
  readonly customers = signal<StoreCustomer[]>([]);
  readonly cartItems = signal<StoreCartItem[]>([]);
  readonly status = signal<'idle' | 'loading' | 'error'>('idle');
  readonly error = signal<string | null>(null);

  getGuestToken(): string {
    if (typeof window === 'undefined') return 'server-side-token';
    const existing = window.localStorage.getItem(this.guestTokenStorageKey)?.trim();
    if (existing && /^[a-zA-Z0-9_-]{12,128}$/.test(existing)) return existing;
    const generated = this.generateGuestToken();
    window.localStorage.setItem(this.guestTokenStorageKey, generated);
    return generated;
  }

  private generateGuestToken(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID().replace(/-/g, '');
    }
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }

  private async authContext(storeId?: string): Promise<{ auth: boolean; guestToken?: string; headers?: Record<string, string> }> {
    await this.auth.whenReady();
    if (this.auth.user()) return { auth: true };
    if (storeId && this.tenantCustomerAuth.hasSession(storeId)) {
      return { auth: false, headers: this.tenantCustomerAuth.customerHeaders(storeId) };
    }
    return { auth: false, guestToken: this.getGuestToken() };
  }

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

  /** Load customers for store owner (includes registered and guests). */
  async loadStoreCustomers(storeId: string, q?: string) {
    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; customers: StoreCustomer[] }>(
        'storeCustomersList',
        { storeId, q: q?.trim() || undefined, limit: 200 },
        { auth: true }
      );
      this.customers.set(json.customers ?? []);
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      throw e;
    }
  }

  /** Ensures a signed-in store visitor is represented as a registered customer. */
  async touchStoreCustomer(storeId: string, input?: { fullName?: string; phone?: string; location?: string }) {
    await this.api.post(
      'storeCustomerTouch',
      { storeId, fullName: input?.fullName, phone: input?.phone, location: input?.location },
      { auth: true }
    );
  }

  /** Load the current customer's orders, optionally scoped to a single store. */
  async loadMyOrders(storeId?: string) {
    this.status.set('loading');
    this.error.set(null);
    try {
      const useCustomerSession = Boolean(storeId && this.tenantCustomerAuth.hasSession(storeId));
      const json = await this.api.get<{ ok: true; orders: StoreOrder[] }>('storeMyOrdersList', storeId ? { storeId } : undefined, useCustomerSession
        ? { auth: false, headers: this.tenantCustomerAuth.customerHeaders(storeId!) }
        : { auth: true });
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
      const ctx = await this.authContext(storeId);
      const json = await this.api.get<{ ok: true; items: StoreCartItem[] }>(
        'storeCartGet',
        { storeId, guestToken: ctx.guestToken },
        { auth: ctx.auth, headers: ctx.headers }
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
    const ctx = await this.authContext(storeId);
    await this.api.post(
      'storeCartSetItem',
      { storeId, productId, quantity: Math.max(0, Math.floor(quantity)), guestToken: ctx.guestToken },
      { auth: ctx.auth, headers: ctx.headers }
    );
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
    /** Required — used for buyer order emails. */
    buyerEmail: string;
    buyerName: string;
    buyerPhone: string;
    buyerLocation: string;
    currency?: string;
    shippingAddress?: any;
    notes?: string;
    paymentMethod?: PaymentMethod;
  }): Promise<{ orderId: string; orderViewToken: string }> {
    const ctx = await this.authContext(params.storeId);
    const json = await this.api.post<{ ok: true; orderId: string; orderViewToken: string }>(
      'storeCheckout',
      { currency: 'USD', paymentMethod: 'CASH_ON_DELIVERY', guestToken: ctx.guestToken, ...params },
      { auth: ctx.auth, headers: ctx.headers }
    );
    return { orderId: json.orderId, orderViewToken: json.orderViewToken };
  }

  /** Order status for the magic link in confirmation emails (no login). */
  async getPublicOrder(storeSlug: string, orderId: string, viewToken: string): Promise<{
    store: { name: string; slug: string };
    order: {
      id: string;
      status: string;
      currency: string;
      totalCents: number;
      paymentMethod?: string | null;
      shippingAddress?: any;
      notes?: string | null;
      createdAt: string | null;
      updatedAt: string | null;
    };
    items: StoreOrderItem[];
  }> {
    const json = await this.api.get<{
      ok: true;
      store: { name: string; slug: string };
      order: {
        id: string;
        status: string;
        currency: string;
        totalCents: number;
        paymentMethod?: string | null;
        shippingAddress?: any;
        notes?: string | null;
        createdAt: string | null;
        updatedAt: string | null;
      };
      items: StoreOrderItem[];
    }>('storeOrderPublicGet', { storeSlug, orderId, t: viewToken }, { auth: false });
    return { store: json.store, order: json.order, items: json.items ?? [] };
  }

  /** Load a single order with its line items (owner only). */
  async getOrder(storeId: string, orderId: string): Promise<{ order: StoreOrder; items: StoreOrderItem[] }> {
    const json = await this.api.get<{ ok: true; order: StoreOrder; items: StoreOrderItem[] }>(
      'storeOrderGet',
      { storeId, orderId },
      { auth: true }
    );
    return { order: json.order, items: json.items ?? [] };
  }
}
