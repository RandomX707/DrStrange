# SIGNOVA

An original ASL fingerspelling research foundation. **Phase 1A only:** local camera
capture, up to two hands, 21-point landmarks and honest session instrumentation.
No letter recognition, training, sign translation or recording is implemented.

The package is `signova-asl-fingerspelling`; the user-selected Git remote is
[RandomX707/DrStrange](https://github.com/RandomX707/DrStrange).

## Run locally

Requires Node 22.12+ and npm. Verified here with Node 22.23.3 / npm 10.9.9.

```sh
npm ci
npm run assets:prepare
npm run dev
```

Open http://127.0.0.1:5173. Click **Start camera** and grant browser/macOS access.
Choose a camera before starting; stop before changing it. The list refreshes after
permission and device changes. Mirroring changes display only. Hiding the tab
stops capture. Restart explicitly when returning.

The asset step downloads Google's official ~7.8 MB landmark detector, checks a
committed SHA-256, and copies the pinned npm WASM runtime into `public/`. These
ignored runtime files are included in `dist/` by Vite. It does **not** download an
ASL dataset or classifier. See [asset provenance](docs/ARCHITECTURE.md).

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run fixture:generate
PLAYWRIGHT_BROWSERS_PATH=.playwright npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=.playwright npm run test:e2e
```

Synthetic browser tests use an original generated Y4M video, actual getUserMedia,
real MediaPipe/WASM and the official model. Permission denial is browser-enforced.
Unit tests replace hardware and initialization boundaries. Neither proves physical
handedness or landmark accuracy on people. A real host-camera attempt was blocked;
Phase 1A acceptance is **open**. See [verification](docs/VERIFICATION_REPORT.md).

## Research record

- [Architecture and coordinate conventions](docs/ARCHITECTURE.md)
- [Dataset reconnaissance](docs/DATASET_RECON.md)
- [Research and participant capture protocol](docs/RESEARCH_PROTOCOL.md)
- [Verification commands, measurements and limits](docs/VERIFICATION_REPORT.md)
- [Next steps and acceptance gates](docs/NEXT_STEPS.md)

No frames or landmarks are saved or uploaded by application code. Manual JSON
exports contain aggregate metrics and browser information, not images/device IDs.
A same-origin CSP restricts runtime network access. Google's library has its own
[metrics privacy notice](https://developers.google.com/edge/mediapipe/solutions/tasks#mediapipe_tasks_privacy_notice);
review it before participant work. No cloud services, database, Docker or styling
framework are used. External libraries and pretrained landmark assets retain
their upstream rights; project source was independently written.
