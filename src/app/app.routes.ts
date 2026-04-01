import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { HomePage } from './pages/home/home.page';
import { ProductsPage } from './pages/products/products.page';
import { ProductPage } from './pages/product/product.page';
import { CartPage } from './pages/cart/cart.page';
import { CheckoutPage } from './pages/checkout/checkout.page';
import { AccountPage } from './pages/account/account.page';
import { SignInPage } from './pages/auth/sign-in.page';
import { SignUpPage } from './pages/auth/sign-up.page';
import { ResetPasswordPage } from './pages/auth/reset-password.page';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { AdminDashboardPage } from './pages/admin/admin-dashboard.page';
import { AdminShellComponent } from './pages/admin/admin-shell.component';
import { AdminSiteSettingsPage } from './pages/admin/admin-site-settings.page';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardPage },
      { path: 'settings', component: AdminSiteSettingsPage }
    ]
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: HomePage },
      { path: 'products/:id', component: ProductPage },
      { path: 'products', component: ProductsPage },
      { path: 'cart', component: CartPage, canActivate: [authGuard] },
      { path: 'checkout', component: CheckoutPage, canActivate: [authGuard] },
      { path: 'account', component: AccountPage, canActivate: [authGuard] },
      { path: 'sign-in', component: SignInPage },
      { path: 'sign-up', component: SignUpPage },
      { path: 'reset-password', component: ResetPasswordPage },
      { path: '**', redirectTo: '' }
    ]
  }
];
