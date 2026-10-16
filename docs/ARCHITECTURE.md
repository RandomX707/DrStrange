# Architecture

## Responsibilities

- `src/App.tsx`: accessible capture controls, status, raw handedness labels,
  metrics and manual test instructions. Plain CSS; no icon/UI dependency.
- `src/useCapture.ts`: session orchestration, React lifecycle, visibility/device
  events, inference, canvas rendering, metrics export and error recovery.
- `src/core/camera.ts`: owns acquired tracks and video attachment. Generation
  tokens discard late grants; abortable metadata wait has a 15-second deadline.
  Switching/restarting releases the previous stream. Playback failure and track
  ending release resources. No audio is requested.
- `src/core/landmarker.ts`: VIDEO mode, `numHands: 2`, GPU initialization then CPU
  fallback; both failure messages remain visible. All confidence settings 0.5.
- `src/core/session.ts`: closes active or late-resolving landmark tasks after Stop.
- `src/core/frames.ts`: requestVideoFrameCallback preferred; rAF fallback checks
  video.currentTime. No duplicate decoded frames or overlapping synchronous calls.
- `src/core/geometry.ts`, `overlay.ts`: contain geometry, display transforms,
  all 21 joints and 21 anatomical connections per hand. Detection array order has
  no identity semantics. No custom filters or tracking are added.
- `src/core/metrics.ts`: aggregate counts and latest 1800 latency/gap samples.

Capture → unmodified video → HandLandmarker → normalized landmarks → display
projection → canvas. Results are transient. MediaPipe's built-in VIDEO tracking
is used as provided by the task; no separate identity tracker exists.

## Coordinates and handedness

Raw image x increases rightward; y increases downward; both normalize by input
width/height. z is wrist-relative, with smaller values closer to the camera. z is
not used for the 2D overlay. This follows the [official output definition](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js).

For source W×H in viewport Vw×Vh:
`s=min(Vw/W,Vh/H)`, `ox=(Vw-sW)/2`, `oy=(Vh-sH)/2`.
Draw x as `ox+sW*x` or, mirrored, `ox+sW*(1-x)`; y is `oy+sH*y`.
Video uses object-fit: contain and CSS scaleX(-1) only for mirrored display.
Canvas uses CSS pixels with a devicePixelRatio backing store. No cropping or input
pixel reflection occurs. Labels are drawn separately and remain readable.

Raw `Left`/`Right` model labels are not inferred from screen side and are never
silently swapped. Mirroring does not establish physical laterality. A real-person
protocol must verify the deployed Tasks/model/camera combination; see verification.
No legacy MediaPipe Hands mirroring convention is assumed for Tasks Vision.

## Timing and performance

`performance.now()` brackets each synchronous `detectForVideo` call. Initialization
includes runtime/model loading and any fallback. Startup additionally includes
camera acquisition/playback. Processed FPS = total inferences/session seconds;
render callback FPS = rAF callbacks/session seconds, **not proof of painted FPS**.
Percentiles use nearest rank on the latest 1800 samples, with sample count exported.
The session clock starts after initialization and stops at cleanup. UI updates at
2 Hz; inference is not throttled or smoothed. rAF gap p95 and supported Long Tasks
entries describe responsiveness during the live interval. No CPU/memory estimates.

Inference is currently on the main thread. The [official guide](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
warns it blocks the UI. Synthetic results show substantial blocking; a worker is a
possible separately authorized improvement, not a claim about current performance.

## Assets and privacy

`@mediapipe/tasks-vision` 1.1.1 (Apache-2.0 package) supplies local WASM. Official
[Hand Landmarker model](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker#models)
revision `hand_landmarker/float16/1` is pretrained only for hand localization.
The exact URL, byte count and observed SHA-256 are in
`scripts/model-manifest.json`; `npm run assets:prepare` fails on changed bytes.
No ASL weights were invented or trained. Model redistribution is deliberately
avoided; review upstream model terms before redistributing assets beyond local use.

[Google's notice](https://developers.google.com/edge/mediapipe/solutions/tasks#mediapipe_tasks_privacy_notice)
says inputs process on-device but API metrics may be sent. The app loads runtime
assets locally and sets CSP connect-src to self, disallowing external runtime
connections; the browser smoke asserts no external request was observed. This is
bounded evidence for that run, not a complete dependency security audit. Do not
relax CSP without revisiting consent. Dev-server HMR uses same-origin WebSocket.
Manual exports exclude camera IDs, frames and landmarks; user agent/timing remain.
