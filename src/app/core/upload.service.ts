import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';

export type UploadResult = { storagePath: string; publicUrl: string };

@Injectable({ providedIn: 'root' })
export class UploadService {
  private api = inject(ApiClient);

  /** Uploads a file via a signed URL and returns its public URL. */
  async upload(file: File, folder: 'products' | 'logos' | 'storefront' = 'storefront'): Promise<UploadResult> {
    const meta = await this.api.post<{ ok: true; uploadUrl: string; storagePath: string; publicUrl: string }>(
      'getUploadUrl',
      { folder, fileName: file.name, contentType: file.type, fileSize: file.size },
      { auth: true }
    );
    const putRes = await fetch(meta.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });
    if (!putRes.ok) {
      throw new Error(`upload_failed_${putRes.status}`);
    }
    return { storagePath: meta.storagePath, publicUrl: meta.publicUrl };
  }
}
