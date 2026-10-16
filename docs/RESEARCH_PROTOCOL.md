# Research protocol — proposal, not implemented evaluation

## Questions and target

Can a later static-letter recognizer generalize to unseen signers and sessions?
How much do camera, background, lighting, handedness and proficiency alter error
and extraction coverage? Do calibrated abstention and explicit negatives reduce
wrong accepted predictions? These are questions, not results. Initial target is
24 static letters; J/Z motion, words, grammar and continuous language translation
are outside this study. Engage fluent/Deaf ASL collaborators in label review and
interpretation; no accessibility or communication-replacement claims.

## Independent units and splits

A sample is one prompted, independently re-formed production with immutable
signer/session/repetition/derived-family IDs. Video frames from the same hold,
all augmentations and duplicates share a group. Partition **by signer** before
feature extraction fitting, normalization, tuning or augmentation. Keep every
session of a signer in the same outer partition. A session-holdout study on seen
signers is a separate, explicitly weaker question.

For small participant counts use outer leave-one-signer-out (LOSO) CV. Select
hyperparameters, calibration and abstention thresholds only with grouped inner
validation among remaining signers. If inner groups are too few, pre-register
fixed choices or reduce claims; do not tune against the held-out signer. Lock an
independent final signer test cohort if feasible. Report each signer/fold and the
aggregate; bootstrap uncertainty over **signers**, not correlated frames. Small
N gives unstable estimates regardless of image volume. Keep a versioned split
manifest and audit identity/family overlap before training. No models are trained
in Phase 1A.

## Outcomes for a later approved study

- **Macro F1:** unweighted mean of per-class F1 over all predeclared classes;
  report missing support, counts, per-class precision/recall and fold-level macro
  F1. Publish raw-count and row-normalized confusion matrices. Report extraction
  failures explicitly and an end-to-end score including unusable inputs.
- **Calibration:** reliability diagram, negative log-likelihood/Brier where
  applicable and expected calibration error (ECE): sum over 15 predeclared
  equal-width confidence bins of bin mass × |accuracy − mean confidence|.
  Report bin counts and bin sensitivity; fit any calibration on validation only.
- **Selective prediction:** coverage = accepted / all eligible attempts; selective
  risk = error rate among accepted attempts. Plot risk–coverage over thresholds
  fixed/selected on validation, report AURC with its integration convention
  (step integral over increasing coverage), coverage at target risk, and errors
  rejected. State treatment of missing landmarks/zero coverage. Report open-set
  negatives separately; confidence is not evidence of an in-distribution input.
- **Negatives/open set:** empty scenes, non-sign hands, partial/occluded hands,
  everyday movements, objects, transitions and unsupported signs/letters, from
  unseen signers/environments. Reserve negative families in held-out data;
  evaluate false accepts per negative attempt and per minute of negative video,
  false reject rate on valid letters, and rates by negative category. A closed-set
  confusion matrix alone cannot support open-world claims.
- **End-to-end latency:** timestamp from independently annotated visible target
  formation through capture buffering, preprocessing, extraction, classification,
  abstention/decision logic and displayed output. Report p50/p95, misses, protocol
  and frame rate; include acquisition/initialization separately. Phase 1A's
  synchronous inference timing is only one component, not recognition latency.

## Collection and feasibility gates

Follow the consent, metadata, repeated-session, negative and deletion protocol in
[DATASET_RECON.md](DATASET_RECON.md). No real footage is currently available or
consented as a repeatable test artifact. The implementation never records it.

Provisional pilot gates, chosen for feasibility rather than statistical power:
8–12 consenting adults targeted; at least five complete independent signers for
exploratory LOSO; two dated sessions; at least 10 reviewed independent attempts per
static class per session. Audit all exclusions. Before model development, propose
and approve a landmark coverage criterion (initial candidate: ≥90% overall and
≥80% in each signer/class cell) and report disparities/missingness. A low-coverage
cell blocks a landmark-only study; never drop a signer to meet the threshold.
These numbers are **proposals**, not accepted benchmarks, observations or evidence
of adequacy for generalization. Run a pilot, estimate variance, revisit recruitment
and pre-register the finalized study before testing a hypothesis.

Required GO evidence: rights/consent; provenance/identity manifest; reviewer
agreement and adjudication; independent repetitions and negatives; extraction
coverage audit; clean split audit; feasible local storage/compute; privacy and
withdrawal procedures. Otherwise CONDITIONAL or NO-GO. No large dataset acquisition
is authorized by this protocol itself.

## Phase 1A capture measurements

Repeat synthetic checks with fixed generated fixture, browser version, asset hash
and dimensions. For real host runs: record browser/version, source resolution/FPS,
delegate, mirror mode, plugged/battery state and session duration. Warm up for
30 seconds; measure at least five minutes in the foreground, repeat three runs,
and include both 0/1/2-hand cases. Export metrics at defined intervals to observe
drift; this phase has bounded recent latency samples and whole-session FPS.
Track rAF gap p95 and Long Tasks where supported. These measure scheduling
responsiveness, not human interaction latency or compositor paint count.

macOS CPU/memory require host observation (Activity Monitor or Instruments); record
browser process tree, elapsed interval, units, thermal/power context and sampling
method. Unified memory is shared; don't substitute JS heap for host memory. No
host CPU/memory measurements have been collected here.
