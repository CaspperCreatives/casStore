import { Injectable, computed, signal } from '@angular/core';
import {
  User,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { injectAuth, injectFirestore } from './firebase';
import { canAccessAdmin, isValidRoleId, ROLES, RoleId } from './roles';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = injectAuth();
  private db = injectFirestore();

  readonly user = signal<User | null>(null);
  readonly ready = signal(false);
  readonly rolesReady = signal(false);
  /** True when the current user has verified their email. False when signed out. */
  readonly emailVerified = computed(() => Boolean(this.user()?.emailVerified));
  private readyWaiters: Array<() => void> = [];
  private persistenceReady: Promise<void> | null = null;
  /**
   * Roles: 1=admin, 2=manager, 3=user
   * This is sourced from custom claims only.
   */
  readonly roleId = signal<RoleId>(ROLES.USER);
  readonly isAdmin = signal(false);
  readonly isManager = signal(false);
  readonly canAccessAdmin = signal(false);

  constructor() {
    if (!this.auth) {
      this.finishAuthTransition();
      return;
    }

    // Ensure auth state can persist across reloads.
    this.persistenceReady = setPersistence(this.auth, browserLocalPersistence).catch((e) => {
      console.warn('Firebase Auth persistence unavailable; auth may reset on reload.', e);
    });

    // One-way data flow: use onIdTokenChanged to handle user AND roles.
    onIdTokenChanged(this.auth, async (u) => {
      this.user.set(u);

      if (!u) {
        this.roleId.set(ROLES.USER);
        this.isAdmin.set(false);
        this.isManager.set(false);
        this.canAccessAdmin.set(false);
        this.finishAuthTransition();
        return;
      }

      try {
        const token = await u.getIdTokenResult();
        const roleId = (token?.claims as any)?.['roleId'];
        const isLegacyAdmin = token?.claims?.['admin'] === true;

        if (isValidRoleId(roleId)) {
          this.roleId.set(Number(roleId) as RoleId);
        } else if (isLegacyAdmin) {
          this.roleId.set(ROLES.ADMIN);
        } else {
          this.roleId.set(ROLES.USER);
        }

        const rid = this.roleId();
        this.isAdmin.set(rid === ROLES.ADMIN);
        this.isManager.set(rid === ROLES.MANAGER);
        this.canAccessAdmin.set(canAccessAdmin(rid));
      } catch (e) {
        console.error('Error fetching custom claims', e);
        this.roleId.set(ROLES.USER);
        this.isAdmin.set(false);
        this.isManager.set(false);
        this.canAccessAdmin.set(false);
      } finally {
        this.finishAuthTransition();
        void this.ensureUserProfile(u);
      }
    });
  }

  async signUp(email: string, password: string) {
    if (!this.auth) throw new Error('Firebase Auth not configured');
    await this.persistenceReady;
    this.beginAuthTransition();
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.ensureUserProfile(cred.user);
      // Fire-and-forget verification email via Postmark. We deliberately don't
      // await so a transient Functions error can't block the signup flow.
      void this.sendVerificationEmail().catch((e) => {
        console.warn('Unable to send verification email immediately.', e);
      });
      return cred;
    } catch (e) {
      this.finishAuthTransition();
      throw e;
    }
  }

  async signIn(email: string, password: string) {
    if (!this.auth) throw new Error('Firebase Auth not configured');
    await this.persistenceReady;
    this.beginAuthTransition();
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      await this.ensureUserProfile(cred.user);
      return cred;
    } catch (e) {
      this.finishAuthTransition();
      throw e;
    }
  }

  async signOut() {
    if (!this.auth) return;
    this.beginAuthTransition();
    try {
      return await signOut(this.auth);
    } catch (e) {
      this.finishAuthTransition();
      throw e;
    }
  }

  async signInWithGoogle() {
    if (!this.auth) throw new Error('Firebase Auth not configured');
    await this.persistenceReady;
    this.beginAuthTransition();
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this.auth, provider);
      await this.ensureUserProfile(cred.user);
      return cred;
    } catch (e) {
      this.finishAuthTransition();
      throw e;
    }
  }

  async updateDisplayName(displayName: string) {
    if (!this.auth?.currentUser) throw new Error('Not signed in');
    await updateProfile(this.auth.currentUser, { displayName });
    await this.ensureUserProfile(this.auth.currentUser);
    this.user.set({ ...this.auth.currentUser });
  }

  /**
   * Triggers a password-reset email via our backend (Postmark).
   *
   * The backend always responds 200 (no account-enumeration), so this call
   * resolves even if the address has no account — UI should always show the
   * same "if an account exists, we sent a link" confirmation.
   */
  async sendPasswordReset(email: string) {
    const addr = email.trim().toLowerCase();
    if (!addr) throw new Error('Please enter your email address.');
    const res = await fetch(this.functionUrl('sendPasswordResetEmail'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addr })
    });
    if (res.status === 429) {
      throw new Error('Too many attempts. Please wait and try again.');
    }
    // 400 is the only other failure mode we surface (bad email); 200 is always
    // the success signal regardless of whether an account exists.
    if (!res.ok) {
      const body = await res.json().catch(() => null as any);
      throw new Error(body?.error?.message || 'Unable to send reset email right now.');
    }
  }

  /**
   * Triggers an email-verification message for the currently-signed-in user.
   * Safe to call repeatedly — the backend enforces a 60s per-user rate limit
   * and returns `{ alreadyVerified: true }` once the user has verified.
   */
  async sendVerificationEmail(): Promise<{ ok: true; alreadyVerified?: boolean }> {
    const token = await this.getIdToken();
    if (!token) throw new Error('You must be signed in to request a verification email.');
    const res = await fetch(this.functionUrl('sendVerificationEmail'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.status === 429) {
      const body = await res.json().catch(() => null as any);
      throw new Error(body?.error?.message || 'Please wait a minute before requesting another verification email.');
    }
    if (!res.ok) {
      const body = await res.json().catch(() => null as any);
      throw new Error(body?.error?.message || 'Unable to send verification email right now.');
    }
    return (await res.json()) as { ok: true; alreadyVerified?: boolean };
  }

  private functionUrl(fn: string): string {
    const projectId = environment.firebase?.projectId;
    const region = environment.functionsRegion ?? 'us-central1';
    if (!projectId) throw new Error('Firebase projectId not configured');
    return `https://${region}-${projectId}.cloudfunctions.net/${fn}`;
  }

  async refreshUser() {
    if (this.auth?.currentUser) {
      await this.auth.currentUser.getIdToken(true);
    }
  }

  async whenReady() {
    if (this.ready() && this.rolesReady()) return;
    await new Promise<void>((resolve) => {
      if (this.ready() && this.rolesReady()) {
        resolve();
        return;
      }
      this.readyWaiters.push(resolve);
    });
  }

  /**
   * Waits for the signed-in user to be reflected in local signals.
   * This avoids immediate post-login redirects reading stale auth state.
   */
  async waitForSignedInUser(uid: string, timeoutMs = 5000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await this.whenReady();
      if (this.user()?.uid === uid) return true;
      await new Promise((r) => setTimeout(r, 25));
    }
    return false;
  }

  async getIdToken(): Promise<string | null> {
    await this.whenReady();
    const u = this.user();
    if (!u) return null;
    return await u.getIdToken();
  }

  /**
   * Ensures `users/{uid}` exists.
   * This is a client-side safety net; the backend trigger also creates this doc.
   */
  private async ensureUserProfile(u: User) {
    if (!this.db) return;
    const ref = doc(this.db, 'users', u.uid);
    const snap = await getDoc(ref);

    const base = {
      uid: u.uid,
      email: u.email ?? null,
      displayName: u.displayName ?? null,
      photoURL: u.photoURL ?? null,
      providerIds: u.providerData?.map((p) => p.providerId) ?? [],
      updatedAt: serverTimestamp()
    };

    if (!snap.exists()) {
      // Only set a default role on first creation; never overwrite an existing roleId.
      await setDoc(ref, { ...base, roleId: ROLES.USER, createdAt: serverTimestamp() }, { merge: true });
    } else {
      await setDoc(ref, base, { merge: true });
    }
  }

  private async readRoleIdFromProfile(uid: string): Promise<RoleId> {
    try {
      if (!this.db) return ROLES.USER;
      const ref = doc(this.db, 'users', uid);
      const snap = await getDoc(ref);
      const roleId = (snap.data() as any)?.roleId;
      return isValidRoleId(roleId) ? (Number(roleId) as RoleId) : ROLES.USER;
    } catch {
      return ROLES.USER;
    }
  }

  private beginAuthTransition() {
    this.ready.set(false);
    this.rolesReady.set(false);
  }

  private finishAuthTransition() {
    this.ready.set(true);
    this.rolesReady.set(true);
    if (this.readyWaiters.length === 0) return;
    const waiters = this.readyWaiters;
    this.readyWaiters = [];
    for (const resolve of waiters) resolve();
  }
}


