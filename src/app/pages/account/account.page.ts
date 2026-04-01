import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">Account</h1>
      <p class="text-sm text-slate-600">Profile and addresses will live here.</p>
    </div>

    @if (!firebaseConfigured()) {
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Configure Firebase to enable sign-in and account features.
      </div>
    } @else {
      <div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <div class="font-semibold">Coming next</div>
        <ul class="mt-2 list-disc pl-5 text-slate-600">
          <li>Firebase Auth sign-in/sign-up</li>
          <li>Profile edit (name/phone)</li>
          <li>Shipping & billing addresses</li>
        </ul>
        <div class="mt-4 flex gap-3">
          <a routerLink="/sign-in" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Sign in
          </a>
          <a routerLink="/sign-up" class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Create account
          </a>
        </div>
      </div>
    }
  `
})
export class AccountPage {
  firebaseConfigured = computed(() => Boolean(environment.firebase?.apiKey));
}



