# SIGNOVA Phase 1A design

The user requests an original local browser research foundation on macOS, not a
recognition system. The detailed supplied brief is the scope authority; its
instruction to begin implementation selects inline execution without extra gates.
Repository destination remains RandomX707/DrStrange; package name is
signova-asl-fingerspelling.

Use Vite/React/TypeScript and plain CSS. A media controller owns stream replacement,
cancellation and cleanup; a MediaPipe adapter owns GPU initialization with CPU
fallback. A video-frame loop runs synchronous inference once per decoded frame,
draws all 21 points and connections, and records bounded session metrics. Start is
explicit; Stop, page hiding, unmount and failures release owned resources. No
frames or landmarks are uploaded or persisted. Only aggregate metrics can be
exported manually. Pinned WASM is served locally; official versioned hand-landmarker
weights are downloaded explicitly by a setup script with hash verification.

Alternative considered: worker inference would isolate main-thread blocking but
adds frame-transfer complexity; first measure responsiveness. CDN-only runtime
assets are simpler but undermine repeatability and offline tests. Choose local
assets and main-thread instrumentation, documenting its limitation.

Render the raw camera via object-fit: contain; map normalized landmarks into the
same contain rectangle. Mirror display x only, never input pixels or model labels.
Label handedness as raw model output, not verified physical laterality. A manual
Left/Right protocol is an acceptance gate; no undocumented label swap.

Tests cover stream races, denial, hotplug failure, cleanup, transform math, GPU
fallback, frame scheduling and metrics. Playwright uses synthetic Y4M frames with
real MediaPipe for a repeatable no-hand browser smoke; it proves no human hand
accuracy. Real webcam/physical handedness and sustained host performance remain
explicitly open if consent or host access is unavailable.

Dataset reconnaissance uses primary dataset cards and papers without bulk data.
Signer-independent feasibility depends on rights, stable signer/session IDs,
independent repetitions, canonical labels, negatives and a fluent ASL reviewer.
No random frame split is acceptable evidence of signer generalization.
