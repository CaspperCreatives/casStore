import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewsletterConfig } from '../../../core/store.service';
import { LucideAngularModule, Mail } from 'lucide-angular';

@Component({
  selector: 'app-newsletter-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-16">
      <div class="rounded-3xl bg-slate-900 px-8 py-12 text-center text-white md:px-16 md:py-16">
        <div class="mx-auto max-w-xl">
          <lucide-angular [img]="MailIcon" class="mx-auto h-10 w-10 text-white/60" />
          @if (cfg().title) {
            <h2 class="mt-4 text-2xl font-bold tracking-tight md:text-3xl">{{ cfg().title }}</h2>
          }
          @if (cfg().subtitle) {
            <p class="mt-2 text-white/70">{{ cfg().subtitle }}</p>
          }
          <form class="mt-6 flex flex-col gap-3 sm:flex-row" (submit)="submit($event)">
            <input type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com"
              class="w-full flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/50 focus:border-white/30" />
            <button type="submit"
              class="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100">
              {{ cfg().buttonLabel || 'Subscribe' }}
            </button>
          </form>
          @if (submitted()) {
            <p class="mt-3 text-sm text-emerald-300">Thanks for subscribing!</p>
          }
        </div>
      </div>
    </section>
  `
})
export class NewsletterSectionComponent {
  readonly MailIcon = Mail;
  cfg = input.required<NewsletterConfig>();
  email = '';
  submitted = signal(false);

  submit(e: Event) {
    e.preventDefault();
    if (!this.email) return;
    this.submitted.set(true);
    this.email = '';
    setTimeout(() => this.submitted.set(false), 4000);
  }
}
