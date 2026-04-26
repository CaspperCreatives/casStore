import { Injectable, inject } from '@angular/core';
import { ApiClient, ApiClientError } from './api-client';

export type UploadResult = { storagePath: string; publicUrl: string };
type UploadPhase = 'prepare' | 'upload';

export class UploadServiceError extends Error {
  constructor(
    message: string,
    readonly phase: UploadPhase,
    readonly status?: number,
    readonly code?: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'UploadServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private api = inject(ApiClient);

  /** Uploads a file via a signed URL and returns its public URL. */
  async upload(file: File, folder: 'products' | 'logos' | 'storefront' = 'storefront'): Promise<UploadResult> {
    let meta: { ok: true; uploadUrl: string; storagePath: string; publicUrl: string };
    try {
      meta = await this.api.post<{ ok: true; uploadUrl: string; storagePath: string; publicUrl: string }>(
        'getUploadUrl',
        { folder, fileName: file.name, contentType: file.type, fileSize: file.size },
        { auth: true }
      );
    } catch (e: any) {
      if (e instanceof ApiClientError) {
        throw new UploadServiceError(
          `Upload setup failed: ${e.message}`,
          'prepare',
          e.status,
          e.code,
          e.details
        );
      }
      throw new UploadServiceError(`Upload setup failed: ${e?.message ?? String(e)}`, 'prepare');
    }

    const putRes = await fetch(meta.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });
    if (!putRes.ok) {
      const details = await this.readUploadFailure(putRes);
      throw new UploadServiceError(
        `Upload failed (${putRes.status})${details.code ? ` ${details.code}` : ''}: ${details.message}`,
        'upload',
        putRes.status,
        details.code,
        details.raw
      );
    }
    return { storagePath: meta.storagePath, publicUrl: meta.publicUrl };
  }

  private async readUploadFailure(res: Response): Promise<{ message: string; code?: string; raw?: string }> {
    const raw = await res.text().catch(() => '');
    if (!raw) return { message: res.statusText || 'Storage upload rejected.' };

    // GCS XML error shape: <Code>AccessDenied</Code><Message>Access denied.</Message>
    const code = raw.match(/<Code>([^<]+)<\/Code>/i)?.[1]?.trim();
    const message = raw.match(/<Message>([^<]+)<\/Message>/i)?.[1]?.trim();
    if (code || message) {
      return { code, message: message || 'Storage upload rejected.', raw };
    }
    return { message: raw.slice(0, 300), raw };
  }
}
