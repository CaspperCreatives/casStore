export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyDqwLs2C0qZ49liojxpi8t7Hm2WIqnaGTc',
    authDomain: 'casstore-e3189.firebaseapp.com',
    projectId: 'casstore-e3189',
    appId: '1:637083132540:web:60b8cb39d377bee2c4dff9',
    messagingSenderId: '637083132540',
    storageBucket: 'casstore-e3189.firebasestorage.app',
    measurementId: 'G-H7DGWMX0Y4'
  },
  functionsRegion: 'us-central1',
  /**
   * Host users see in the address bar. Classic Firebase Hosting currently
   * serves the app at `www.casstore.store` (apex `casstore.store` is still
   * being wired up), so every UI preview uses this value.
   */
  rootDomain: 'www.casstore.store',
  /**
   * Master switch for wildcard-subdomain store URLs. When `false`, the app
   * hides every subdomain preview/link and serves stores via path URLs
   * (`casstore.store/store/<slug>/...`) exclusively. Flip to `true` once
   * `*.<rootDomain>` is actually live with a valid wildcard cert.
   */
  subdomainsEnabled: false
};


