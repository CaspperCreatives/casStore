import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ApiClient } from './api-client';

export type CartLine = { productId: string; quantity: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  private auth = inject(AuthService);
  private api = inject(ApiClient);

  readonly lines = signal<CartLine[]>([]);
  readonly status = signal<'idle' | 'loading' | 'error'>('idle');
  readonly error = signal<string | null>(null);

  readonly uid = computed(() => this.auth.user()?.uid ?? null);

  async load() {
    const uid = this.uid();
    if (!uid) throw new Error('Not signed in');

    this.status.set('loading');
    this.error.set(null);
    try {
      const json = await this.api.get<{ ok: true; items: Array<{ productId: string; quantity: number }> }>('cartGet', undefined, {
        auth: true
      });
      const items = (json.items ?? []).filter((x) => Number.isFinite(Number(x.quantity)) && Number(x.quantity) > 0);
      this.lines.set(items.map((x) => ({ productId: String(x.productId), quantity: Number(x.quantity) })));
      this.status.set('idle');
    } catch (e: any) {
      this.status.set('error');
      this.error.set(e?.message ?? String(e));
      throw e;
    }
  }

  async setQuantity(productId: string, quantity: number) {
    const uid = this.uid();
    if (!uid) throw new Error('Not signed in');
    if (!productId) throw new Error('Missing productId');

    const q = Math.max(0, Math.floor(quantity));
    await this.api.post('cartSetItem', { productId, quantity: q }, { auth: true });
    await this.load();
  }

  async add(productId: string, quantity: number = 1) {
    const current = this.lines().find((l) => l.productId === productId)?.quantity ?? 0;
    await this.setQuantity(productId, current + quantity);
  }
}


