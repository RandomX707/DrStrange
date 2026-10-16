# Phase 1A verification report

Date: 2026-10-16 (Asia/Kolkata). **Acceptance remains OPEN.** Implemented scope is
Phase 1A only. No recognition, training, filtering, custom identities, enhancement,
translation UI, dataset download or participant recording was performed.

## Environment and observed evidence

Node 22.23.3, npm 10.9.9; darwin/arm64, Darwin 25.6.0. Node OS APIs reported
Apple M5 and 17,179,869,184 total memory bytes (16 GiB). This is hardware metadata,
not measured application CPU or memory consumption. Browser: Playwright Chromium
156.0.8078.4, headless. A WebGL capability probe reported **ANGLE / Vulkan /
SwiftShader software rendering**. Selecting MediaPipe's GPU delegate here does
not imply use of the M5 GPU. macOS GUI browsers have not been verified.

All 7 unit files / 19 tests pass. TypeScript, ESLint and production build pass.
Browser tests cover real synthetic capture/model inference, export/restart/stop,
mobile viewport/capability error, late model close, browser-generated permission
denial and real CPU inference after an explicitly injected GPU-creation failure.
Final complete browser suite: **5 passed in 23.8 seconds**, exit 0.

## Exact executed commands and results

| Command | Observed result |
| --- | --- |
| `npm view @mediapipe/tasks-vision version` and equivalent queries for vite, react, vitest, @playwright/test, typescript, eslint, typescript-eslint, @vitejs/plugin-react, @types/react, @types/react-dom, @types/node@22 | npm registry queries succeeded; exact chosen versions are in package.json and package-lock.json. TypeScript deliberately pinned to 5.9.3. |
| `npm install` | 140 packages installed; audit reported 0 vulnerabilities at installation. Not a security guarantee. |
| `npm test` (initial test-first run) | 16 failures against unimplemented behavior. Subsequent session/overlay test-first run: 3 added failures; all 19 now pass. |
| `curl --fail --location --output /tmp/signova-hand-landmarker.task https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task` then `shasum -a 256 /tmp/signova-hand-landmarker.task` | Downloaded 7,819,105 bytes. SHA-256 matches committed manifest. |
| `npm run assets:prepare` | Local WASM copied; official version-1 model downloaded and checksum verified. |
| `npm run fixture:generate` | Generated original 640×480, 30 FPS, 60-frame looping Y4M bars; no people or hand footage. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright npx playwright install chromium` | Installed pinned Chromium, headless shell and Playwright FFmpeg into ignored workspace directory. |
| `npm run typecheck` | Exit 0. Earlier test fixture shape errors (missing visibility and legacy handednesses fields) corrected against installed library types. |
| `npm run lint` | Exit 0. Earlier failures: downloaded browser internals scanned; missing error cause; missing script callback browser globals. Scope/config and error propagation corrected. |
| `npm run build` | Exit 0. Vite production build; 27 modules, JS 397.77 kB / gzip 121.87 kB, CSS 12.81 kB / gzip 3.75 kB. Runtime WASM/model assets add separate weight. |
| `npm test` (final core run) | Exit 0; 7 test files, 19 tests passed. Reviewer independently observed the same result. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright npm run test:e2e` (initial) | Sandbox bind error EPERM on localhost:5173; approved execution used afterward. Initial approved run: 3 passed, 1 permission-test setup failure. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright SIGNOVA_BENCHMARK_SECONDS=120 npm run test:e2e` | Synthetic capture experiment passed, three browser tests passed; permission test failed because headless normal permission path returned NotSupportedError. Performance export retained separately. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright npm run test:e2e -- --project=chromium-denied --project=chromium-cpu` | Denial passed with Chromium fake UI deny; initial CPU flag experiment failed to force fallback. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright npm run test:e2e -- --project=chromium-cpu` (corrected integration test) | Exit 0; real CPU model initialized and processed synthetic frames after injected GPU initialization rejection. XNNPACK CPU delegate logged. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright npm run test:e2e` (final complete run) | Exit 0; all 5 browser tests passed in 23.8 s, including strengthened real late-model close verification. |
| `PLAYWRIGHT_BROWSERS_PATH=.playwright npm run verify:host` with localhost server running | Exit 2; real webcam attempt blocked: `NotSupportedError: Not supported`. No frames/recordings saved; browser closed. Evidence: `docs/evidence/host-camera-attempt.json`. |

Other read-only probes used Node `os.platform()`, `os.arch()`, `os.release()`,
`os.totalmem()`, `os.cpus()[0].model`. Playwright `page.evaluate` probed ordinary
canvas and OffscreenCanvas WebGL2 with no flag, `--disable-webgl`, and
`--disable-3d-apis`. The flags disabled ordinary canvas but **not** OffscreenCanvas
in this browser. Therefore they were removed from the fallback test rather than
claiming actual GPU unavailability. Fallback integration now explicitly replaces
only GPU task creation; the CPU library, WASM, asset and inference remain real.

## Sustained synthetic measurements

Raw export: [synthetic-127s.json](evidence/synthetic-127s.json). A 120-second
observation wait plus actual initial processing/stop overhead produced:

| Measurement | Observed |
| --- | ---: |
| Session duration | 127.3971 s |
| Source | Synthetic bars, 640×480 / nominal 30 FPS |
| Requested initialized delegate | GPU (headless SwiftShader environment) |
| Initialization (model/runtime) | 151.70 ms |
| Camera + initialization startup | 215.80 ms |
| Processed frames | 1,378 |
| Processed FPS (whole session) | 10.8166 |
| rAF callbacks / FPS | 1,902 / 14.9297 |
| Inference mean / p50 / p95 | 85.72 / 78.20 / 114.30 ms |
| Inference samples | 1,378 (below 1,800-sample bound) |
| rAF gap p95 | 116.70 ms |
| Long tasks / cumulative duration | 1,378 / 117,966 ms |

No warm-up exclusion or replicated trials were used in this automated experiment.
It measures the no-hand path in a software-rendered browser, not hand landmark
accuracy, real-camera buffering, end-to-end recognition latency, native M5 GPU
performance, or a target-device benchmark. Main-thread blocking is substantial;
the evidence does not support claiming smooth real-time behavior. FPS is measured,
not the nominal 30 FPS fixture rate. rAF callbacks do not prove painted FPS.
CPU usage and browser memory were **not measured**.

The upstream library logged OpenGL checking/projection warnings during synthetic
runs; CPU execution also logged feedback-tensor warnings. These are retained as
observed upstream warnings; no human-hand correctness inference is drawn from a
successful synthetic run. The desktop/mobile synthetic screenshots are local
ignored artifacts, not participant images.

## Requirement evidence and remaining acceptance

| Area | Evidence / status |
| --- | --- |
| Start/Stop, permission errors, camera selection | Implemented; unit and synthetic browser lifecycle checked. Actual multi-camera switching/hotplug remains manual. |
| Model setup, GPU→CPU fallback, two hands | GPU attempt/CPU fallback unit tests; real CPU synthetic inference after injected GPU failure. Actual GPU failure and physical two-hand detection remain unverified. |
| 21 joints, full skeleton, contain alignment/mirroring | Unit test checks all 21 points/edges and mirrored coordinates, landscape/portrait contain geometry; actual visible hand alignment/resize/zoom requires human host check. |
| Physical Left/Right | **NOT RUN.** Protocol below and in UI. Labels remain raw model output; no guessed swap. |
| Instrumentation | Synthetic export above; bounded samples and metrics unit-tested. Real hand sessions, cross-browser and host resource measurements open. |
| Frame scheduling | rVFC used in synthetic browser. rAF dedup/cancellation unit-tested; real fallback browser integration open. |
| Cleanup | Camera denial, play failure, stop, restart, late grant, metadata cancellation, track end and model-close unit coverage. Browser verifies detach/restart and late model close. Visibility/unmount paths implemented; real OS camera indicator must be checked. |
| Network/privacy | Synthetic GPU browser test observed zero external runtime requests. Same-origin CSP blocks external connects; not a complete library/privacy audit. |
| Research readiness | Dataset CONDITIONAL. No audited dataset/consented footage or participant enrollment. |

## Host verification commands

```sh
cd /Users/yashaswiram/scalehealth/portfolio/DrStrange
npm ci
npm run assets:prepare
npm run dev -- --port 5173 --strictPort
```

In another terminal:

```sh
cd /Users/yashaswiram/scalehealth/portfolio/DrStrange
npm run fixture:generate
PLAYWRIGHT_BROWSERS_PATH=.playwright npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=.playwright npm run test:e2e
PLAYWRIGHT_BROWSERS_PATH=.playwright npm run verify:host
```

For actual GUI capture, open http://127.0.0.1:5173 in Safari and Chromium. Grant
camera access using normal browser/macOS prompts; do not alter security settings
to bypass denials. Start/stop; verify the camera indicator turns off; refresh
cameras; stop and select each available device; test disconnect/reconnect and
permission revoke/recovery. Verify hiding the tab stops capture and restart works.

With a consenting participant, use **physical left only**, then **physical right
only**, then both. Repeat mirror on/off, palms/backs, center/edges, portrait/landscape,
window resize, browser zoom and DPR changes. Check wrist/joint alignment, every
finger chain and raw label stability. Record browser/version/camera/mode/observed
labels and failures here; do not treat screen position as ground truth. No real
recording is authorized or required for these visual checks.

Warm up 30 seconds, run ≥5 minutes in foreground, export at fixed intervals and
repeat three times for 0/1/2 hands. For a repeatable synthetic sustained rerun:

```sh
PLAYWRIGHT_BROWSERS_PATH=.playwright SIGNOVA_BENCHMARK_SECONDS=120 npm run test:e2e
```

For host CPU/memory open Activity Monitor (`open -a 'Activity Monitor'`), choose the
browser and helper processes, record CPU%, Memory and memory pressure over the
same interval; use Instruments Time Profiler/Allocations if needed. Report sampling
method, process aggregation and power/thermal conditions. Do not equate JS heap
or whole-system free memory with app memory. No such values are reported here.

## Review

Independent review found no critical/important runtime defects. Its minor browser
late-initialization test gap was addressed by spying on the real task close method,
waiting for actual close, then checking stopped state and detached video. No test
hook was added to product code. This strengthens cleanup evidence without claiming
physical camera verification. Phase 1B remains unimplemented and unauthorized.
