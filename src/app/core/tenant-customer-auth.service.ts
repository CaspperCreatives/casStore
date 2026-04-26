import { Injectable, computed, signal } from '@angular/core';
import { ApiClient } from './api-client';

export type TenantCustomer = {
  id: string;
  storeId: string;
  email: string;
  fullName: string;
  phone?: string;
  location?: string;
};

@Injectable({ providedIn: 'root' })
export class TenantCustomerAuthService {
  private readonly tokenPrefix = 'casstore:tenant-customer-token:';
  readonly customer = signal<TenantCustomer | null>(null);
  readonly ready = signal(false);
  readonly isSignedIn = computed(() => Boolean(this.customer()));

  constructor(private api: ApiClient) {}

  private tokenKey(storeId: string): string {
    return `${this.tokenPrefix}${storeId}`;
  }

  private readToken(storeId: string): string | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(this.tokenKey(storeId));
    return raw?.trim() || null;
  }

  private writeToken(storeId: string, token: string | null) {
    if (typeof window === 'undefined') return;
    if (!token) {
      window.localStorage.removeItem(this.tokenKey(storeId));
      return;
    }
    window.localStorage.setItem(this.tokenKey(storeId), token);
  }

  private authHeaders(storeId: string): Record<string, string> {
    const token = this.readToken(storeId);
    return token ? { 'X-Store-Customer-Session': token } : {};
  }

  hasSession(storeId: string): boolean {
    return Boolean(this.readToken(storeId));
  }

  async signUp(params: { storeId: string; email: string; password: string; fullName: string }) {
    const json = await this.api.post<{ ok: true; token: string; customer: TenantCustomer }>(
      'storeCustomerSignUp',
      params
    );
    this.writeToken(params.storeId, json.token);
    this.customer.set(json.customer);
    this.ready.set(true);
    return json.customer;
  }

  async signIn(params: { storeId: string; email: string; password: string }) {
    const json = await this.api.post<{ ok: true; token: string; customer: TenantCustomer }>(
      'storeCustomerSignIn',
      params
    );
    this.writeToken(params.storeId, json.token);
    this.customer.set(json.customer);
    this.ready.set(true);
    return json.customer;
  }

  async signOut(storeId: string) {
    const headers = this.authHeaders(storeId);
    try {
      if (headers['X-Store-Customer-Session']) {
        await this.api.post('storeCustomerSignOut', { storeId }, { headers });
      }
    } finally {
      this.writeToken(storeId, null);
      this.customer.set(null);
      this.ready.set(true);
    }
  }

  async loadMe(storeId: string): Promise<TenantCustomer | null> {
    this.ready.set(false);
    const headers = this.authHeaders(storeId);
    if (!headers['X-Store-Customer-Session']) {
      this.customer.set(null);
      this.ready.set(true);
      return null;
    }
    try {
      const json = await this.api.get<{ ok: true; customer: TenantCustomer }>(
        'storeCustomerMe',
        { storeId },
        { headers }
      );
      this.customer.set(json.customer);
      return json.customer;
    } catch {
      this.writeToken(storeId, null);
      this.customer.set(null);
      return null;
    } finally {
      this.ready.set(true);
    }
  }

  async updateProfile(storeId: string, patch: { fullName: string; phone?: string; location?: string }) {
    const headers = this.authHeaders(storeId);
    const json = await this.api.patch<{ ok: true; customer: TenantCustomer }>(
      'storeCustomerProfileUpdate',
      { storeId, ...patch },
      { headers }
    );
    this.customer.set(json.customer);
    return json.customer;
  }

  customerHeaders(storeId: string): Record<string, string> {
    return this.authHeaders(storeId);
  }
}
