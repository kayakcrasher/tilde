# Tilde

Spanish cloze practice focused on conjugation.

A sentence is missing one verb form. Type it for more points, or open choices for fewer. Easy is the present, medium is the past, and hard is the future, the conditional, and the subjunctive.

```bash
npm install
npm run dev
```

## Play in the browser

Tilde runs entirely on the device (progress is saved in the browser), so it also ships as a static site:

```bash
npm run build:web      # outputs dist-web/
npm run preview:web    # serves it on http://localhost:4173
```

Every push to the default branch deploys `dist-web/` to GitHub Pages (Settings → Pages → Source: **GitHub Actions**).

## Android APK

The Android app is a [Capacitor](https://capacitorjs.com) wrapper around the same web build (`android/`).

```bash
npm run build:apk      # needs JDK 21 + Android SDK; outputs android/app/build/outputs/apk/debug/app-debug.apk
```

Every push builds the APK in GitHub Actions (downloadable from the run's artifacts); on the default branch it is also attached as `tilde.apk` to the **latest** release.
