import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Eager-init AuthService so Firebase auth restoration starts immediately on app load.
  // (Otherwise, it may not initialize until a guarded route or API call happens.)
  private _auth = inject(AuthService);
  title = 'casStore';
}
