import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';

/**
 * A single submission saved to `stores/{storeId}/formSubmissions/{id}`.
 * `payload` is a flat map of fieldId -> value, matching the `FormSectionConfig.fields`
 * that was live when the visitor submitted.
 */
export type FormSubmission = {
  id: string;
  storeId: string;
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  sectionId: string;
  formTitle: string;
  /** Snapshot of field metadata (id/type/label) at the time of submission. */
  fields: Array<{ id: string; type: string; label: string }>;
  /** fieldId -> value (string | boolean). */
  payload: Record<string, unknown>;
  read: boolean;
  submittedAt: number;
  ip?: string;
  userAgent?: string;
};

export type FormSubmissionSummary = {
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  sectionId: string;
  formTitle: string;
  total: number;
  unread: number;
  lastSubmittedAt: number | null;
};

@Injectable({ providedIn: 'root' })
export class StoreFormsService {
  private api = inject(ApiClient);

  /** Public (anonymous) submission — no auth required. */
  async submit(input: {
    storeId: string;
    pageId: string;
    sectionId: string;
    payload: Record<string, unknown>;
  }): Promise<{ ok: true; submissionId: string }> {
    return this.api.post<{ ok: true; submissionId: string }>('formSubmissionsCreate', input);
  }

  /** Owner: list submissions, optionally filtered by sectionId. */
  async list(params: { sectionId?: string; limit?: number } = {}): Promise<{
    submissions: FormSubmission[];
    forms: FormSubmissionSummary[];
  }> {
    const query: Record<string, string | number> = {};
    if (params.sectionId) query['sectionId'] = params.sectionId;
    if (params.limit) query['limit'] = params.limit;
    const res = await this.api.get<{ ok: true; submissions: FormSubmission[]; forms: FormSubmissionSummary[] }>(
      'formSubmissionsList', query as any, { auth: true }
    );
    return { submissions: res.submissions ?? [], forms: res.forms ?? [] };
  }

  async markRead(submissionId: string, read: boolean): Promise<void> {
    await this.api.patch(
      `formSubmissionsUpdate?submissionId=${encodeURIComponent(submissionId)}`,
      { read },
      { auth: true }
    );
  }

  async delete(submissionId: string): Promise<void> {
    await this.api.delete('formSubmissionsDelete', { submissionId }, { auth: true });
  }
}
