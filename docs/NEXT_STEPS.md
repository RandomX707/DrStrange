# Next steps

**Stop at Phase 1A. Phase 1B is not authorized or implemented.**

Close the remaining Phase 1A acceptance gates first:

1. Run on the actual target Mac/browser with webcam permission. Validate live
   video, 21 aligned joints, zero/one/two hands, permission revoke, disconnection,
   start/stop/restart, camera changes and cleanup (camera indicator turns off).
2. Execute physical Left/Right protocol in both mirror modes with a consenting
   participant, palms/backs, both hands, edges, resized/portrait view and browser
   zoom/DPR changes. Record raw labels and failures without an assumed label swap.
3. Verify naturally occurring GPU-failure recovery in a supported GUI browser and
   measure foreground responsiveness. Real CPU inference after an injected GPU
   failure passed; this does not establish GPU/CPU numerical parity or all failure modes.
4. Run three ≥5-minute real capture sessions after warm-up. Export intervals,
   characterize 0/1/2 hands, repeat in target Safari/Chromium, and collect host CPU/
   memory with Activity Monitor/Instruments. Headless synthetic performance is not
   target-device hand performance. Main-thread blocking is a known current risk.
5. Obtain permission for a small dataset audit or consented pilot recruitment.
   Resolve dataset licensing, independent sample counts and canonical labels.
   Do not download large archives or implement recording automatically.

Only after evidence supports acceptance and the user authorizes another phase:
consider whether inference should move off the main thread, and decide a data
collection/research scope. Neither requires or justifies a recognition interface
now. The present CONDITIONAL data recommendation precludes a defensible
signer-independent recognition claim yet.
