import { useCapture } from './useCapture';
const format = (value: number | null | undefined, digits = 1) => value == null ? '—' : value.toFixed(digits);

function CameraGlyph() {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="9" y="20" width="46" height="31" rx="7"/><path d="m21 20 4-7h14l4 7"/><circle cx="32" cy="35" r="9"/><path d="M8 8v6M5 11h6M53 7v6M50 10h6"/></svg>;
}

export default function App() {
  const capture = useCapture();
  const { metrics, modelInfo, status, busy, hands } = capture;
  return <div className="app-shell">
    <header className="site-header">
      <a className="brand" href="#workspace" aria-label="SIGNOVA home"><span className="brand-symbol">s<span>·</span></span>SIGNOVA<span className="brand-divider"/><span className="brand-caption">RESEARCH LAB</span></a>
      <div className="header-note"><span className="status-dot"/> Browser-based · Local processing</div>
      <a className="text-link" href="#field-notes">Field notes <span>↗</span></a>
    </header>
    <main id="workspace">
      <div className="eyebrow"><span>EXPERIMENT 001</span><span className="phase-pill">PHASE 1A · FOUNDATION</span></div>
      <div className="page-heading"><div><h1>Capture workspace</h1><p>A closer look at how hands move. Start with the landmarks.</p></div><span className="version">SIGNOVA / v0.1</span></div>
      <div className="workspace-grid">
        <section className="capture-card" aria-label="Camera preview">
          <div className="card-topline"><span><span className={`status-dot ${status === 'Live' ? 'active' : ''}`}/><strong data-testid="session-status">{status}</strong></span><span className="mono">CAM 01 <span className="muted">/</span> RGB INPUT</span></div>
          <div className={`video-stage ${status === 'Live' ? 'is-live' : ''}`}>
            <video ref={capture.videoRef} autoPlay playsInline muted className={capture.mirrored ? 'mirrored' : ''} aria-label="Live camera feed"/>
            <canvas ref={capture.canvasRef} aria-label="21-point hand landmark overlay"/>
            {!busy && <div className="empty-state"><div className="camera-glyph"><CameraGlyph/></div><h2>Your perspective starts here.</h2><p>Enable your camera to explore hand landmarks<br/>in real time. Nothing is recorded.</p><span className="empty-hint">LOCAL CAMERA · UP TO TWO HANDS</span></div>}
            {busy && status !== 'Live' && <div className="loading-state"><span className="loading-ring"/>{status === 'Requesting camera' ? 'Waiting for camera permission…' : 'Preparing the hand landmarker…'}</div>}
            <span className="stage-corner top-left"/><span className="stage-corner top-right"/><span className="stage-corner bottom-left"/><span className="stage-corner bottom-right"/>
            {status === 'Live' && <div className="stage-badge"><span className="status-dot active"/>{hands.length} {hands.length === 1 ? 'hand' : 'hands'} detected</div>}
          </div>
          <div className="preview-footer"><span><i className="legend-dot"/>21 landmarks per hand</span><span>{capture.mirrored ? 'Mirrored preview' : 'Unmirrored preview'} <span aria-hidden="true">↔</span></span></div>
        </section>
        <aside className="settings-card" aria-labelledby="session-title">
          <div className="section-kicker">01 / SETUP</div><h2 id="session-title">Capture session</h2><p className="settings-intro">A clean input is the first step<br className="desktop-break"/> toward a useful experiment.</p>
          <label className="field-label" htmlFor="camera">Camera source</label>
          <select id="camera" value={capture.deviceId} disabled={busy || !capture.supported} onChange={event => capture.setDeviceId(event.target.value)}><option value="">System default camera</option>{capture.devices.map((device, index) => <option key={device.deviceId || index} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>)}</select>
          <button className="refresh-button" onClick={() => void capture.refreshDevices()} disabled={busy || !capture.supported}>↻ Refresh cameras</button>
          <div className="mirror-setting"><div><label htmlFor="mirror">Mirror preview</label><p>Display only. Input stays original.</p></div><input id="mirror" type="checkbox" checked={capture.mirrored} onChange={event => capture.changeMirror(event.target.checked)}/></div>
          <div className="model-details"><div><span>Landmark engine</span><strong>MediaPipe Tasks Vision</strong></div><div><span>Compute delegate</span><strong>{modelInfo?.delegate ?? 'GPU → CPU fallback'}</strong></div><div><span>Maximum hands</span><strong>02</strong></div></div>
          <div className="session-actions"><button className="primary-button" onClick={() => void capture.start()} disabled={busy || !capture.supported}><span aria-hidden="true">◉</span> Start camera <span aria-hidden="true">↗</span></button><button className="secondary-button" onClick={() => capture.stop()} disabled={!busy}><span aria-hidden="true">□</span> Stop camera</button></div>
          <p className="privacy-note"><span aria-hidden="true">⌁</span> Frames stay on this device. No recording, no frame uploads. Same-origin network policy.</p>
        </aside>
      </div>
      {capture.error && <div className="error-banner" role="alert"><strong>Capture needs attention</strong><span>{capture.error}</span></div>}
      {capture.notice && <p className="notice" role="status">{capture.notice}</p>}
      {modelInfo?.fallbackReason && <p className="notice">GPU initialization failed; using CPU. {modelInfo.fallbackReason}</p>}
      <section className="telemetry" aria-labelledby="telemetry-title">
        <div className="telemetry-header"><h2 id="telemetry-title">Session telemetry <span>MEASURED IN YOUR BROWSER</span></h2><button className="export-button" onClick={capture.exportMetrics} disabled={!metrics}>Export metrics <span aria-hidden="true">↓</span></button></div>
        <div className="metric-grid">
          <div className="metric"><span className="metric-label">INFERENCE LATENCY <span>01</span></span><div>{format(metrics?.inference.latestMs)} <small>ms</small></div><p>p95 {format(metrics?.inference.p95Ms)} ms · latest {metrics?.inference.sampleCount ?? 0} samples</p></div>
          <div className="metric"><span className="metric-label">PROCESSED FRAMES <span>02</span></span><div>{format(metrics?.processedFps)} <small>fps</small></div><p><span data-testid="processed-frames">{metrics?.processedFrames ?? 0}</span> frames · session average</p></div>
          <div className="metric"><span className="metric-label">RENDER CALLBACKS <span>03</span></span><div>{format(metrics?.renderedFps)} <small>fps</small></div><p>rAF gap p95 {format(metrics?.renderGapP95Ms)} ms</p></div>
          <div className="metric"><span className="metric-label">INITIALIZATION <span>04</span></span><div>{format(modelInfo?.initializationMs, 0)} <small>ms</small></div><p>{modelInfo ? `${modelInfo.delegate} · model + runtime setup` : 'Measured when a session starts'}</p></div>
        </div>
      </section>
      <section className="field-notes" id="field-notes"><div><span className="section-kicker">02 / FIELD NOTES</span><h2>Observe first.<br/>Make claims later.</h2></div><div className="notes-grid"><article><span className="note-number">A</span><h3>Landmarks, not letters</h3><p>This phase visualizes hand geometry. It does not recognize fingerspelling or translate sign language.</p></article><article><span className="note-number">B</span><h3>Check both hands</h3><p>Left / Right labels are raw model outputs. Physical handedness must be checked with a participant in both mirror modes.</p></article><article><span className="note-number">C</span><h3>Keep the evidence</h3><p>Export aggregate session metrics. Test across lighting, backgrounds, and sustained sessions before drawing conclusions.</p></article></div></section>
      <details className="protocol-details"><summary>Physical Left / Right verification protocol <span>+</span></summary><ol><li>Use a consenting participant. Raise only their physical left hand; note the model label and overlay alignment.</li><li>Repeat with the physical right hand, then with both hands. Test palms and backs of hands at the center and edges.</li><li>Repeat with Mirror preview enabled and disabled, each available camera, and after resizing the window.</li><li>Record browser, model revision, observed labels and failures in docs/VERIFICATION_REPORT.md. Preview mirroring must never change the model label.</li></ol><p>No physical handedness verification has been completed by this application.</p></details>
    </main>
    <footer><span className="footer-brand">SIGNOVA</span><span>An independent exploration of ASL fingerspelling.</span><span className="mono">FOUNDATION BEFORE RECOGNITION <span>↗</span></span></footer>
  </div>;
}
