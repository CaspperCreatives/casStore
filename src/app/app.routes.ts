import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { LandingPage } from './pages/landing/landing.page';
import { AccountPage } from './pages/account/account.page';
import { AccountOrdersPage } from './pages/account/account-orders.page';
import { SignInPage } from './pages/auth/sign-in.page';
import { SignUpPage } from './pages/auth/sign-up.page';
import { ResetPasswordPage } from './pages/auth/reset-password.page';
import { AuthActionPage } from './pages/auth/auth-action.page';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { storeOwnerGuard } from './core/store-owner.guard';
import { tenantCustomerAuthGuard } from './core/tenant-customer-auth.guard';
import { AdminDashboardPage } from './pages/admin/admin-dashboard.page';
import { AdminShellComponent } from './pages/admin/admin-shell.component';
import { AdminSiteSettingsPage } from './pages/admin/admin-site-settings.page';
import { AdminProductsPage } from './pages/admin/admin-products.page';
import { AdminOrdersPage } from './pages/admin/admin-orders.page';
import { CreateStorePage } from './pages/create-store/create-store.page';
import { MyStoreShellComponent } from './pages/my-store/my-store-shell.component';
import { MyStoreDashboardPage } from './pages/my-store/my-store-dashboard.page';
import { MyStoreProductsPage } from './pages/my-store/my-store-products.page';
import { MyStoreOrdersPage } from './pages/my-store/my-store-orders.page';
import { MyStoreCustomersPage } from './pages/my-store/my-store-customers.page';
import { MyStoreSettingsPage } from './pages/my-store/my-store-settings.page';
import { MyStorePagesListPage } from './pages/my-store/my-store-pages-list.page';
import { MyStorePageEditorPage } from './pages/my-store/my-store-page-editor.page';
import { MyStoreNavEditorPage } from './pages/my-store/my-store-nav-editor.page';
import { MyStoreSubmissionsPage } from './pages/my-store/my-store-submissions.page';
import { StoreShellComponent } from './pages/store/store-shell.component';
import { StoreHomePage } from './pages/store/store-home.page';
import { StorePagePage } from './pages/store/store-page.page';
import { StoreProductsPage } from './pages/store/store-products.page';
import { StoreProductPage } from './pages/store/store-product.page';
import { StoreCartPage } from './pages/store/store-cart.page';
import { StoreCheckoutPage } from './pages/store/store-checkout.page';
import { StoreFavoritesPage } from './pages/store/store-favorites.page';
import { StoreOrderHistoryPage } from './pages/store/store-order-history.page';
import { StoreAccountPage } from './pages/store/store-account.page';
import { StoreAccountOrdersPage } from './pages/store/store-account-orders.page';
import { StoreAccountSignInPage } from './pages/store/store-account-sign-in.page';
import { StoreAccountSignUpPage } from './pages/store/store-account-sign-up.page';
import { OrderStatusPage } from './pages/order-status/order-status.page';
import { DemosIndexPage } from './pages/demos/demos-index.page';
import { DemoStorePage } from './pages/demos/demo-store.page';
import { detectTenantFromHost } from './core/host-routing';
import { MyStoreSubmissionDetailPage } from './pages/my-store/my-store-submission-detail.page';
import { StoresListPage } from './pages/stores-list/stores-list.page';

// Routes that exist in both subdomain and apex modes (admin panel + owner dashboard).
const platformRoutes: Routes = [
  // Internal listing; unauthenticated, not linked in navigation.
  { path: 'stores-list', component: StoresListPage },

  // ── Admin panel ────────────────────────────────────────────────────────────
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardPage },
      { path: 'settings', component: AdminSiteSettingsPage },
      { path: 'products', component: AdminProductsPage },
      { path: 'orders', component: AdminOrdersPage }
    ]
  },

  // ── Store owner dashboard ──────────────────────────────────────────────────
  {
    path: 'create-store',
    component: CreateStorePage,
    canActivate: [authGuard]
  },
  {
    path: 'my-store',
    component: MyStoreShellComponent,
    canActivate: [storeOwnerGuard],
    children: [
      { path: '', component: MyStoreDashboardPage },
      { path: 'products', component: MyStoreProductsPage },
      { path: 'orders', component: MyStoreOrdersPage },
      { path: 'customers', component: MyStoreCustomersPage },
      { path: 'submissions', component: MyStoreSubmissionsPage },
      { path: 'submissions/:submissionId', component: MyStoreSubmissionDetailPage },
      { path: 'storefront', component: MyStorePagesListPage },
      { path: 'storefront/nav', component: MyStoreNavEditorPage },
      { path: 'storefront/pages/:pageId', component: MyStorePageEditorPage },
      { path: 'settings', component: MyStoreSettingsPage }
    ]
  }
];

// Storefront children (shared across both routing modes via StoreShellComponent).
const storefrontChildren: Routes = [
  { path: '', component: StoreHomePage },
  { path: 'products', component: StoreProductsPage },
  { path: 'products/:productId', component: StoreProductPage },
  { path: 'p/:pageSlug', component: StorePagePage },
  { path: 'cart', component: StoreCartPage },
  { path: 'checkout', component: StoreCheckoutPage },
  { path: 'favorites', component: StoreFavoritesPage, canActivate: [tenantCustomerAuthGuard] },
  { path: 'history', component: StoreOrderHistoryPage, canActivate: [tenantCustomerAuthGuard] }
];

// Tenant mode: serve the storefront at the root, no `/store/:slug` prefix.
function tenantRoutes(): Routes {
  return [
    // Magic-link tracking — outside StoreShellComponent so no store nav / “Create your store” chrome.
    { path: 'order-status/:storeSlug/:orderId', component: OrderStatusPage },
    {
      path: '',
      component: StoreShellComponent,
      children: [
        ...storefrontChildren,
          { path: 'sign-in', component: StoreAccountSignInPage },
          { path: 'sign-up', component: StoreAccountSignUpPage },
          { path: 'reset-password', component: ResetPasswordPage },
          { path: 'auth/action', component: AuthActionPage },
          { path: 'account/sign-in', component: StoreAccountSignInPage },
          { path: 'account/sign-up', component: StoreAccountSignUpPage },
          {
            path: 'account',
            canActivate: [tenantCustomerAuthGuard],
            children: [
              { path: '', component: StoreAccountPage },
              { path: 'orders', component: StoreAccountOrdersPage }
            ]
          },
          { path: '**', redirectTo: '' }
      ]
    }
  ];
}

// Apex mode (casstore.store): platform marketing landing at `/`, with
// per-store storefronts still reachable under `/store/:storeSlug/...`.
function apexRoutes(): Routes {
  return [
    // ── Platform marketing landing ───────────────────────────────────────────
    { path: '', component: LandingPage, pathMatch: 'full' },

    // ── Demo stores (marketing showcases built from real sections) ──────────
    { path: 'demos', component: DemosIndexPage, pathMatch: 'full' },
    { path: 'demos/:demoId', component: DemoStorePage },

    // Buyer order tracking from email magic links — no platform shell / owner chrome.
    { path: 'order-status/:storeSlug/:orderId', component: OrderStatusPage },

    // ── Public per-store storefront ──────────────────────────────────────────
    {
      path: 'store/:storeSlug',
      component: StoreShellComponent,
      children: [
        ...storefrontChildren,
        { path: 'account/sign-in', component: StoreAccountSignInPage },
        { path: 'account/sign-up', component: StoreAccountSignUpPage },
        {
          path: 'account',
          canActivate: [tenantCustomerAuthGuard],
          children: [
            { path: '', component: StoreAccountPage },
            { path: 'orders', component: StoreAccountOrdersPage }
          ]
        }
      ]
    },

    // ── Auth + account pages (wrapped in the global shell) ───────────────────
    {
      path: '',
      component: ShellComponent,
      children: [
        {
          path: 'account',
          canActivate: [authGuard],
          children: [
            { path: '', component: AccountPage },
            { path: 'orders', component: AccountOrdersPage }
          ]
        },
        { path: 'sign-in', component: SignInPage },
        { path: 'sign-up', component: SignUpPage },
        { path: 'reset-password', component: ResetPasswordPage },
        { path: 'auth/action', component: AuthActionPage },
        { path: '**', redirectTo: '' }
      ]
    }
  ];
}

const tenant = detectTenantFromHost();

export const routes: Routes = [
  ...platformRoutes,
  ...(tenant ? tenantRoutes() : apexRoutes())
];
