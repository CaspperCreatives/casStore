import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

type ApiError = {
  ok: false;
  error?: { code?: string; message?: string; details?: unknown };
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  get isAuthError() {
    return this.status === 401 || this.code === 'unauthenticated';
  }

  get isForbidden() {
    return this.status === 403 || this.code === 'forbidden';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private auth = inject(AuthService);

  private baseUrl() {
    const projectId = environment.firebase?.projectId;
    const region = environment.functionsRegion ?? 'us-central1';
    if (!projectId) throw new Error('Firebase projectId not configured');
    return `https://${region}-${projectId}.cloudfunctions.net`;
  }

  private async headers(opts?: { auth?: boolean }) {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (opts?.auth) {
      const token = await this.auth.getIdToken();
      if (!token) throw new Error('Not signed in');
      h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  }

  async get<T>(fn: string, params?: Record<string, string | number | boolean | null | undefined>, opts?: { auth?: boolean }): Promise<T> {
    const url = new URL(`${this.baseUrl()}/${fn}`);
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
    const res = await fetch(url.toString(), { method: 'GET', headers: await this.headers(opts) });
    const json = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || json?.ok === false) throw this.toError(json, res.status);
    return json as T;
  }

  async post<T>(fn: string, body?: unknown, opts?: { auth?: boolean }): Promise<T> {
    const res = await fetch(`${this.baseUrl()}/${fn}`, {
      method: 'POST',
      headers: await this.headers(opts),
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const json = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || json?.ok === false) throw this.toError(json, res.status);
    return json as T;
  }

  private toError(json: ApiError | any, status: number) {
    const msg = json?.error?.message;
    const code = json?.error?.code;
    const details = json?.error?.details;
    const message = msg ? `${msg}${code ? ` (${code})` : ''}` : `Request failed (${status})`;
    return new ApiClientError(message, status, code, details);
  }
}



