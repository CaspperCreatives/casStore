import { inject, InjectionToken } from '@angular/core';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';
import { environment } from '../../environments/environment';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE');
export const FUNCTIONS = new InjectionToken<Functions>('FUNCTIONS');

export function provideFirebase() {
  if (!environment.firebase?.apiKey) return [];

  return [
    {
      provide: FIREBASE_APP,
      useFactory: () => (getApps().length ? getApp() : initializeApp(environment.firebase))
    },
    {
      provide: FIREBASE_AUTH,
      deps: [FIREBASE_APP],
      useFactory: (app: FirebaseApp) => getAuth(app)
    },
    {
      provide: FIRESTORE,
      deps: [FIREBASE_APP],
      useFactory: (app: FirebaseApp) => getFirestore(app)
    },
    {
      provide: FUNCTIONS,
      deps: [FIREBASE_APP],
      useFactory: (app: FirebaseApp) => getFunctions(app, environment.functionsRegion ?? 'us-central1')
    }
  ];
}

export function injectAuth(): Auth | null {
  return inject(FIREBASE_AUTH, { optional: true });
}

export function injectFirestore(): Firestore | null {
  return inject(FIRESTORE, { optional: true });
}

export function injectFunctions(): Functions | null {
  return inject(FUNCTIONS, { optional: true });
}



