import { useCallback, useEffect, useRef, useState } from 'react';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { CameraController, cameraError } from './core/camera';
import { LandmarkerOwner } from './core/session';
import { startFrameLoop } from './core/frames';
import { SessionMetrics, type MetricsSnapshot } from './core/metrics';
import { drawOverlay } from './core/overlay';
import type { Delegate, InitializedLandmarker } from './core/landmarker';
import manifest from '../scripts/model-manifest.json';

type Status = 'Ready' | 'Requesting camera' | 'Loading landmarks' | 'Live' | 'Stopped' | 'Error';
interface MeasurementReport {
  schemaVersion: 1;
  recordedAt: string;
  userAgent: string;
  source: { width: number; height: number };
  delegate: string;
  computePreference: Delegate;
  initializationMs: number;
  startupMs: number;
  scheduler: string;
  model: typeof manifest;
  tasksVisionVersion: string;
  metrics: MetricsSnapshot;
  responsiveness: { longTasksSupported: boolean; longTaskCount: number; longTaskTotalMs: number };
  notes: string;
}
interface Runtime {
  generation: number;
  camera?: CameraController;
  owner?: LandmarkerOwner;
  stopFrames?: () => void;
  stopRender?: () => void;
  observer?: PerformanceObserver;
  timer?: ReturnType<typeof setInterval>;
  result?: HandLandmarkerResult;
  metrics?: SessionMetrics;
  info?: Omit<MeasurementReport, 'metrics' | 'recordedAt' | 'responsiveness'>;
  longTaskCount: number;
  longTaskTotalMs: number;
  longTasksSupported: boolean;
}

export function useCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mirroredRef = useRef(true);
  const runtime = useRef<Runtime>({ generation: 0, longTaskCount: 0, longTaskTotalMs: 0, longTasksSupported: false });
  const reportRef = useRef<MeasurementReport | null>(null);
  const [status, setStatus] = useState<Status>('Ready');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [supported, setSupported] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [computePreference, setComputePreference] = useState<Delegate>('GPU');
  const [mirrored, setMirrored] = useState(true);
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [modelInfo, setModelInfo] = useState<Omit<InitializedLandmarker, 'detector'> | null>(null);
  const [hands, setHands] = useState<string[]>([]);

  const snapshot = useCallback(() => {
    const active = runtime.current;
    if (!active.metrics || !active.info) return null;
    const current = active.metrics.snapshot(performance.now());
    reportRef.current = {
      ...active.info, metrics: current, recordedAt: new Date().toISOString(),
      responsiveness: { longTasksSupported: active.longTasksSupported, longTaskCount: active.longTaskCount, longTaskTotalMs: active.longTaskTotalMs },
    };
    return current;
  }, []);

  const release = useCallback(() => {
    const active = runtime.current;
    active.generation++;
    const finalMetrics = snapshot();
    active.stopFrames?.(); active.stopFrames = undefined;
    active.stopRender?.(); active.stopRender = undefined;
    clearInterval(active.timer); active.timer = undefined;
    active.observer?.disconnect(); active.observer = undefined;
    active.camera?.stop();
    active.owner?.stop();
    active.result = undefined;
    active.metrics = undefined;
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    return finalMetrics;
  }, [snapshot]);

  const stop = useCallback((message = '') => {
    const finalMetrics = release();
    if (finalMetrics) setMetrics(finalMetrics);
    setStatus('Stopped'); setHands([]); setNotice(message);
  }, [release]);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter(device => device.kind === 'videoinput'));
    } catch {
      setNotice('The browser could not list cameras. Default camera capture may still be available.');
    }
  }, []);

  useEffect(() => {
    const media = navigator.mediaDevices;
    if (!media?.getUserMedia || !window.isSecureContext) {
      setSupported(false);
      setError('Camera capture is unavailable. Use a supported browser on localhost or HTTPS.');
      return;
    }
    const video = videoRef.current!;
    runtime.current.camera = new CameraController(video, media, () => {
      stop(); setError('The camera disconnected or capture permission was revoked. Reconnect it and try again.'); setStatus('Error');
    });
    runtime.current.owner = new LandmarkerOwner();
    void refreshDevices();
    const hidden = () => { if (document.hidden) stop('Capture stopped because this tab became hidden.'); };
    const leaving = () => release();
    media.addEventListener?.('devicechange', refreshDevices);
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', leaving);
    return () => {
      release();
      media.removeEventListener?.('devicechange', refreshDevices);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', leaving);
    };
  }, [refreshDevices, release, stop]);

  const start = async () => {
    release();
    const active = runtime.current;
    const generation = active.generation;
    const started = performance.now();
    setError(''); setNotice(''); setMetrics(null); setModelInfo(null); setHands([]);
    reportRef.current = null;
    setStatus('Requesting camera');
    try {
      if (!active.camera || !active.owner) throw new Error('Camera capture is unavailable.');
      if (!await active.camera.start(deviceId || undefined) || generation !== active.generation) return;
      void refreshDevices();
      setStatus('Loading landmarks');
      const initialized = await active.owner.start(computePreference);
      if (!initialized || generation !== active.generation) return;
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('This browser could not create a canvas overlay.');
      setModelInfo({ delegate: initialized.delegate, initializationMs: initialized.initializationMs, fallbackReason: initialized.fallbackReason });
      active.metrics = new SessionMetrics(performance.now());
      active.longTaskCount = 0; active.longTaskTotalMs = 0;
      active.longTasksSupported = typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes.includes('longtask');
      if (active.longTasksSupported) {
        active.observer = new PerformanceObserver(list => list.getEntries().forEach(entry => {
          active.longTaskCount++; active.longTaskTotalMs += entry.duration;
        }));
        active.observer.observe({ type: 'longtask', buffered: false });
      }
      active.info = {
        schemaVersion: 1, userAgent: navigator.userAgent,
        source: { width: video.videoWidth, height: video.videoHeight },
        delegate: initialized.delegate, initializationMs: initialized.initializationMs,
        computePreference,
        startupMs: performance.now() - started,
        scheduler: typeof video.requestVideoFrameCallback === 'function' ? 'requestVideoFrameCallback' : 'requestAnimationFrame',
        model: manifest, tasksVisionVersion: '1.1.1',
        notes: 'Aggregate local session metrics. FPS is session-average callbacks/processed frames; rAF does not guarantee painted frames. Latencies use the latest 1800 inferences. No camera frames or landmarks included.',
      };
      const fail = (reason: unknown) => {
        if (generation !== active.generation) return;
        stop(); setStatus('Error'); setError(cameraError(reason));
      };
      active.stopFrames = startFrameLoop(video, timestamp => {
        try {
          const before = performance.now();
          active.result = initialized.detector.detectForVideo(video, timestamp);
          active.metrics?.processed(performance.now() - before);
          const rect = canvas.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const dpr = window.devicePixelRatio || 1;
            const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
            if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawOverlay(context, active.result, { width: video.videoWidth, height: video.videoHeight }, rect, mirroredRef.current);
          }
        } catch (reason) { fail(reason); }
      });
      let renderHandle = 0;
      const render = (timestamp: number) => {
        if (generation !== active.generation) return;
        active.metrics?.rendered(timestamp);
        renderHandle = requestAnimationFrame(render);
      };
      renderHandle = requestAnimationFrame(render);
      active.stopRender = () => cancelAnimationFrame(renderHandle);
      active.timer = setInterval(() => {
        setMetrics(snapshot());
        setHands(active.result?.handedness.map(categories => categories[0]?.categoryName ?? 'unknown') ?? []);
      }, 500);
      setStatus('Live');
    } catch (reason) {
      if (generation !== active.generation) return;
      release(); setStatus('Error'); setError(cameraError(reason));
    }
  };

  const exportMetrics = () => {
    if (runtime.current.metrics) snapshot();
    if (!reportRef.current) return;
    const blob = new Blob([JSON.stringify(reportRef.current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'signova-session-metrics.json';
    anchor.click(); URL.revokeObjectURL(url);
  };
  const changeMirror = (value: boolean) => { mirroredRef.current = value; setMirrored(value); };
  const busy = ['Requesting camera', 'Loading landmarks', 'Live'].includes(status);
  return { videoRef, canvasRef, status, error, notice, supported, devices, deviceId, setDeviceId, computePreference, setComputePreference, mirrored, changeMirror, metrics, modelInfo, hands, start, stop, busy, refreshDevices, exportMetrics };
}
