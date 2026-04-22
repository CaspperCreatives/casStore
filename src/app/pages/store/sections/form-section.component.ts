import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, FormSectionConfig, Store } from '../../../core/store.service';
import { StoreFormsService } from '../../../core/store-forms.service';

type FieldState = {
  field: FormField;
  value: string;
  checked: boolean;
};

/**
 * Public storefront renderer for a `form` section.
 *
 * Visitors see the configured fields and submit them to the public
 * `formSubmissionsCreate` function. On success, the form is replaced
 * with the success message (or a default).
 */
@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        @if (status() !== 'success') {
          @if (cfg().title) {
            <h2 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{{ cfg().title }}</h2>
          }
          @if (cfg().description) {
            <p class="mt-2 text-sm text-slate-600 md:text-base">{{ cfg().description }}</p>
          }

          <form class="mt-6 space-y-4" (submit)="onSubmit($event)" novalidate>
            @for (state of fieldStates(); track state.field.id) {
              <div>
                @if (state.field.type !== 'checkbox') {
                  <label class="mb-1.5 block text-sm font-semibold text-slate-700" [attr.for]="fieldInputId(state.field.id)">
                    {{ state.field.label }}
                    @if (state.field.required) {
                      <span class="text-red-500">*</span>
                    }
                  </label>
                }

                @switch (state.field.type) {
                  @case ('textarea') {
                    <textarea
                      [id]="fieldInputId(state.field.id)"
                      rows="5"
                      [placeholder]="state.field.placeholder || ''"
                      [required]="state.field.required"
                      [(ngModel)]="state.value"
                      [name]="state.field.id"
                      class="${''}w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
                    ></textarea>
                  }
                  @case ('select') {
                    <select
                      [id]="fieldInputId(state.field.id)"
                      [required]="state.field.required"
                      [(ngModel)]="state.value"
                      [name]="state.field.id"
                      class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
                    >
                      <option value="" disabled>
                        {{ state.field.placeholder || 'Select an option' }}
                      </option>
                      @for (opt of state.field.options; track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  }
                  @case ('checkbox') {
                    <label class="flex items-start gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        [id]="fieldInputId(state.field.id)"
                        [required]="state.field.required"
                        [(ngModel)]="state.checked"
                        [name]="state.field.id"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>
                        {{ state.field.label }}
                        @if (state.field.required) {
                          <span class="text-red-500">*</span>
                        }
                      </span>
                    </label>
                  }
                  @default {
                    <input
                      [id]="fieldInputId(state.field.id)"
                      [type]="htmlInputType(state.field.type)"
                      [placeholder]="state.field.placeholder || ''"
                      [required]="state.field.required"
                      [(ngModel)]="state.value"
                      [name]="state.field.id"
                      class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:bg-white"
                    />
                  }
                }
              </div>
            }

            @if (errorMessage(); as err) {
              <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {{ err }}
              </div>
            }

            <button
              type="submit"
              [disabled]="status() === 'submitting'"
              class="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              @if (status() === 'submitting') {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                Sending…
              } @else {
                {{ cfg().submitLabel || 'Send' }}
              }
            </button>
          </form>
        } @else {
          <div class="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
            <div class="text-2xl font-bold">Thank you</div>
            <p class="mt-2 text-sm">{{ cfg().successMessage || 'Thanks! We\\'ll be in touch soon.' }}</p>
            <button
              type="button"
              class="mt-4 text-xs font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-900"
              (click)="reset()"
            >
              Submit another response
            </button>
          </div>
        }
      </div>
    </section>
  `
})
export class FormSectionComponent {
  private forms = inject(StoreFormsService);

  cfg = input.required<FormSectionConfig>();
  store = input.required<Store>();
  pageId = input<string>('');
  sectionId = input.required<string>();

  status = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  errorMessage = signal<string | null>(null);

  /**
   * Local per-field state. Rebuilt when the configured fields change so the
   * visitor doesn't lose typing when an unrelated edit happens in preview.
   */
  fieldStates = computed<FieldState[]>(() => {
    return (this.cfg().fields ?? []).map((f) => ({ field: f, value: '', checked: false }));
  });

  htmlInputType(t: string): string {
    switch (t) {
      case 'email': return 'email';
      case 'tel':   return 'tel';
      default:      return 'text';
    }
  }

  fieldInputId(fieldId: string): string {
    return `form-${this.sectionId()}-${fieldId}`;
  }

  reset() {
    this.status.set('idle');
    this.errorMessage.set(null);
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    if (this.status() === 'submitting') return;

    const payload: Record<string, unknown> = {};
    for (const state of this.fieldStates()) {
      if (state.field.type === 'checkbox') {
        payload[state.field.id] = state.checked;
        if (state.field.required && !state.checked) {
          this.errorMessage.set(`Please check "${state.field.label}" to continue.`);
          return;
        }
      } else {
        const v = (state.value ?? '').trim();
        if (state.field.required && !v) {
          this.errorMessage.set(`Please fill in "${state.field.label}".`);
          return;
        }
        if (state.field.type === 'email' && v && !/.+@.+\..+/.test(v)) {
          this.errorMessage.set(`Please enter a valid email for "${state.field.label}".`);
          return;
        }
        payload[state.field.id] = v;
      }
    }

    this.status.set('submitting');
    this.errorMessage.set(null);
    try {
      await this.forms.submit({
        storeId: this.store().id,
        pageId: this.pageId() || '',
        sectionId: this.sectionId(),
        payload
      });
      this.status.set('success');
    } catch (err: any) {
      this.status.set('error');
      const message = err?.message ?? 'Could not send your message. Please try again.';
      this.errorMessage.set(String(message));
    }
  }
}
