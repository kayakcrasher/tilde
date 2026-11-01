# Tilde — to-do

Things to finish before a wider or commercial release, plus ideas in the queue.
Tick them off as they're done.

## Before any public / Play Store release

- [ ] **ABAIR (Irish audio & pronunciation).** Tilde uses ABAIR's open service
      (Phonetics and Speech Laboratory, Trinity College Dublin), which allows
      personal, educational and non-commercial use. Before a commercial launch:
      create a free ABAIR account and API key at <https://abair.ie>, and email
      **abair.tcd@gmail.com** to describe the app and confirm that shipping
      pre-recorded ABAIR audio inside the app is OK commercially.
- [ ] **Credit ABAIR** on the store listing and in an About screen
      ("Irish speech by ABAIR, Trinity College Dublin").
- [ ] **Fluent-speaker review of the Irish** — sentences, Foundations lessons and
      stories. Verb forms are checked against teanglann.ie and words against
      An Gramadóir, but phrasing still needs a native ear.
- [ ] **Permanent signing key for the APK.** Right now every build is
      debug-signed, so testers must uninstall before updating (and lose
      progress). The Play Store needs a release key anyway.

## Irish

- [ ] **Irish lens for all drill sentences** — a literal, Irish-order English line
      for each of the ~513 Play/Build sentences (lessons and stories have one).
- [ ] **Native recordings from teanglann.ie** (Foras na Gaeilge) — real speakers
      in all three dialects. Only with their permission, and played inside the
      app, never as a link out.
- [ ] **Speak tab for Irish** using ABAIR's speech recognition (needs an ABAIR
      API key).
- [ ] Bundle Munster and Ulster recordings too (currently streamed online;
      offline falls back to Connacht).

## Housekeeping

- [ ] Code-split the web bundle (it's over 500 kB because every language loads
      at once).
- [ ] Update the oldest browser test (`e2e`), written before multiple choice
      became the default.
