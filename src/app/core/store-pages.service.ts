import { Injectable, inject, signal } from '@angular/core';
import { ApiClient } from './api-client';
import { StoreSection } from './store.service';

export type StorePage = {
  id: string;
  slug: string;
  title: string;
  sections: StoreSection[];
  isHome: boolean;
  visible: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type StorePageInput = {
  slug?: string;
  title?: string;
  sections?: StoreSection[];
  visible?: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

@Injectable({ providedIn: 'root' })
export class StorePagesService {
  private api = inject(ApiClient);

  /**
   * Public `home` page doc keyed by storeId. StoreShell fills this before the outlet
   * mounts; StoreHomePage reads it so the first paint matches the loaded config.
   */
  readonly publicHomePageByStoreId = signal<Record<string, StorePage | null>>({});

  /** Cached list of pages keyed by storeId, exposed as a signal for nav/menus. */
  readonly pagesByStore = signal<Record<string, StorePage[]>>({});

  /** Replace the cached list for a store. */
  private setCache(storeId: string, pages: StorePage[]) {
    this.pagesByStore.update(curr => ({ ...curr, [storeId]: pages }));
  }

  /** List pages for the given store (public). Owners receive all pages (incl. hidden). */
  async listPages(params: { storeId?: string; storeSlug?: string; auth?: boolean }): Promise<StorePage[]> {
    const query: Record<string, string> = {};
    if (params.storeId) query['storeId'] = params.storeId;
    if (params.storeSlug) query['storeSlug'] = params.storeSlug;
    const res = await this.api.get<{ ok: true; pages: StorePage[] }>('storePagesList', query, { auth: params.auth });
    const pages = res.pages ?? [];
    if (params.storeId) this.setCache(params.storeId, pages);
    return pages;
  }

  /** Get a single page by slug. Returns null if not found / hidden. */
  async getPageBySlug(params: { storeId?: string; storeSlug?: string; slug: string; auth?: boolean }): Promise<StorePage | null> {
    const query: Record<string, string> = { slug: params.slug };
    if (params.storeId) query['storeId'] = params.storeId;
    if (params.storeSlug) query['storeSlug'] = params.storeSlug;
    try {
      const res = await this.api.get<{ ok: true; page: StorePage }>('storePageGet', query, { auth: params.auth });
      return res.page;
    } catch {
      return null;
    }
  }

  async createPage(input: StorePageInput): Promise<StorePage> {
    const res = await this.api.post<{ ok: true; page: StorePage }>('storePagesCreate', input, { auth: true });
    return res.page;
  }

  async updatePage(pageId: string, patch: StorePageInput): Promise<StorePage> {
    const res = await this.api.patch<{ ok: true; page: StorePage }>(`storePagesUpdate?pageId=${encodeURIComponent(pageId)}`, patch, { auth: true });
    return res.page;
  }

  async deletePage(pageId: string): Promise<void> {
    await this.api.delete(`storePagesDelete`, { pageId }, { auth: true });
  }

  async setHomePage(pageId: string): Promise<void> {
    await this.api.post(`storePagesSetHome?pageId=${encodeURIComponent(pageId)}`, undefined, { auth: true });
  }

  setPublicHomePage(storeId: string, page: StorePage | null): void {
    this.publicHomePageByStoreId.update((m) => ({ ...m, [storeId]: page }));
  }
}
