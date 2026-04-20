import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { HomePage } from './pages/home/home.page';
import { ProductsPage } from './pages/products/products.page';
import { ProductPage } from './pages/product/product.page';
import { CartPage } from './pages/cart/cart.page';
import { CheckoutPage } from './pages/checkout/checkout.page';
import { AccountPage } from './pages/account/account.page';
import { AccountOrdersPage } from './pages/account/account-orders.page';
import { SignInPage } from './pages/auth/sign-in.page';
import { SignUpPage } from './pages/auth/sign-up.page';
import { ResetPasswordPage } from './pages/auth/reset-password.page';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { storeOwnerGuard } from './core/store-owner.guard';
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
import { MyStoreSettingsPage } from './pages/my-store/my-store-settings.page';
import { MyStorePagesListPage } from './pages/my-store/my-store-pages-list.page';
import { MyStorePageEditorPage } from './pages/my-store/my-store-page-editor.page';
import { MyStoreNavEditorPage } from './pages/my-store/my-store-nav-editor.page';
import { StoreShellComponent } from './pages/store/store-shell.component';
import { StoreHomePage } from './pages/store/store-home.page';
import { StorePagePage } from './pages/store/store-page.page';
import { StoreProductsPage } from './pages/store/store-products.page';
import { StoreProductPage } from './pages/store/store-product.page';
import { StoreCartPage } from './pages/store/store-cart.page';
import { StoreCheckoutPage } from './pages/store/store-checkout.page';

export const routes: Routes = [
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
      { path: 'storefront', component: MyStorePagesListPage },
      { path: 'storefront/nav', component: MyStoreNavEditorPage },
      { path: 'storefront/pages/:pageId', component: MyStorePageEditorPage },
      { path: 'settings', component: MyStoreSettingsPage }
    ]
  },

  // ── Public per-store storefront ────────────────────────────────────────────
  {
    path: 'store/:storeSlug',
    component: StoreShellComponent,
    children: [
      { path: '', component: StoreHomePage },
      { path: 'products', component: StoreProductsPage },
      { path: 'products/:productId', component: StoreProductPage },
      { path: 'p/:pageSlug', component: StorePagePage },
      { path: 'cart', component: StoreCartPage, canActivate: [authGuard] },
      { path: 'checkout', component: StoreCheckoutPage, canActivate: [authGuard] }
    ]
  },

  // ── Global storefront shell ────────────────────────────────────────────────
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: HomePage },
      { path: 'products/:id', component: ProductPage },
      { path: 'products', component: ProductsPage },
      { path: 'cart', component: CartPage, canActivate: [authGuard] },
      { path: 'checkout', component: CheckoutPage, canActivate: [authGuard] },
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
      { path: '**', redirectTo: '' }
    ]
  }
];
