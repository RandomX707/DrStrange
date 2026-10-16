# Dataset reconnaissance

Reviewed 2026-10-16. **CONDITIONAL** for a signer-independent study. The current
public-data evidence is insufficient for an unconditional GO. Camera foundation
work proceeds independently. No dataset archive was downloaded; source cards and
primary papers were inspected. Counts below are publisher reports, not audited
local file counts. “Independent” means a separate elicitation, not an adjacent
frame or augmented copy.

## Candidates and verified evidence

| Candidate / primary source | Provenance, rights and data | Signer-independent suitability and MediaPipe assessment |
| --- | --- | --- |
| [ASL Alphabet — Akash / grassknoted](https://www.kaggle.com/grassknoted/asl-alphabet/data) | Card reports 87,000 200×200 training images, 29 classes (A–Z, SPACE/DELETE/NOTHING) and 29 test images. Lists GPL 2. File count does not establish independent repetitions; per-class independent counts, signer count/IDs and recording sessions are not verified. Preserve terms and resolve image rights before reuse/redistribution. | **NO-GO as sole evidence.** Signer-disjoint partition cannot be established from the card. SPACE/DELETE are application gestures, not letters. Static J/Z cannot demonstrate motion. Background/marking conditions and canonical correctness require an authorized image audit and ASL reviewer. RGB is technically ingestible by Tasks Vision; detection yield is unmeasured. |
| [Sign Language MNIST — tecperson/datamunge](https://www.kaggle.com/datamunge/sign-language-mnist/home) | Card lists CC0, 24 static classes excluding J/Z, 27,455 train / 7,172 test grayscale 28×28 cases. It describes augmentation of 1,704 color source images into many variants. Source-level rights, identities and derivative grouping still require audit. No independently verified per-class repetition counts or signer IDs. | **NO-GO for signer-independent landmark study.** Augmentations are not independent observations; provided splits do not establish signer separation. Low resolution and hand cropping make landmark extraction questionable; upscaling cannot recover lost detail. That is a risk assessment, not a measured extraction failure. Canonical correctness and hand markings remain unverified. |
| [Pugeault/Bowden ASL Fingerspelling A and B](https://empslocal.ex.ac.uk/people/staff/np331/index.php?section=FingerSpellingDataset) | Maintainer page organizes by subject. A: five users, 24 static letters, RGB+depth, five sessions with similar lighting/background. B: nine users, depth only, two environments. No explicit reusable license was found on that page; ask maintainers for terms and access. | A is the strongest **CONDITIONAL** public RGB candidate for LOSO, subject to archive/label/rights audit. B is **NO-GO for this RGB Tasks pipeline**: depth maps are not equivalent RGB inputs. Counts of independent repetitions per class, session nesting, participant proficiency and markings are not verified. Author page demonstrates subject-holdout intent, not contemporary browser compatibility. |
| [MU HandImages ASL — original Massey paper](https://mro.massey.ac.nz/server/api/core/bitstreams/09187662-5ebe-4563-8515-3d7e5e1d2a33/content) | Paper reports 2,425 images / five people and 36 letter/digit classes. Filenames encode volunteer, gesture, illumination, repetition (usually 1–5). Green backgrounds/wrist covers support segmentation; released crops use black backgrounds. J/Z movement is replaced by rotated poses. Section 7 permits credited use/distribution/research, prohibits selling images and requires its notice on redistribution. | **CONDITIONAL for a limited static subset**, excluding J/Z motion claims and digits; artificial segmentation/cropping threatens webcam applicability. Person IDs permit a potential LOSO split after release verification. Per-class independent totals and separate session counts are not audited; MediaPipe yield on crops is unknown. No claim of natural canonical J/Z is justified. |
| [Google ASL Fingerspelling competition](https://www.kaggle.com/competitions/asl-fingerspelling/data) | Card lists participant_id and sequence_id; normalized MediaPipe landmarks, not a static RGB image collection. It lists CC BY 4.0 and competition-rule access. Around 189 GB on the viewed listing; no download attempted. Exact distinct participant count and independent letter totals not verified. | **NO-GO for current static extraction study.** Unaligned character sequences require temporal alignment; frames are not independent letter samples. Existing landmarks cannot validate this Tasks version's RGB extraction. Potential later sequence research only after separate authorization, rights/consent review and sequence-level audit. |

The [original Pugeault/Bowden paper](https://personalpages.surrey.ac.uk/r.bowden/publications/2011/ICCV/WS/PugeaultBowden2011b.pdf)
contains conflicting descriptions: its text describes four non-native participants
and 48,000 samples, while its figure shows five users and a different sample-count
description. Do not merge those numbers with the maintainer release. Holding a
pose across frames does not establish independent repetitions. Archive manifests
and elicitation records must resolve this before quantitative study claims.

[ASL University / Bill Vicars](https://www.lifeprint.com/asl101/pages-layout/fingerspelling.htm)
explains that J and Z require movement and that orientation distinguishes several
shared handshapes. A still-image label is insufficient evidence of full ASL
fingerspelling competence. No candidate received a full fluent-signer annotation
audit in this phase. Colored hand markings were not verified in the inspected
metadata; do not assert either their presence or absence. Dataset descriptions
alone cannot establish canonical form or participant consent for a new use.

## Required authorized small audit

Before any large download: retain exact release/license/consent scope and hashes;
list subject/session/elicitation IDs and original-vs-derivative groups; inspect a
stratified, licensed sample per class with a fluent ASL reviewer. Count independent
repetitions per signer/class/session, detect near-duplicate families, and keep
families in one split. Measure Tasks extraction yield and failures on **all**
attempts by signer, class and lighting; do not silently discard missing landmarks.
Check wrist visibility, resolution, margins, occlusions, annotations/backgrounds
and left/right conventions. No such extraction experiment has yet been run.

## Consented multi-participant collection

Feasible as a small voluntary pilot **if** participants and a fluent ASL reviewer
can be recruited; neither recruitment nor budget is currently established. Proposed
pilot: 8–12 adults, two separately dated sessions, 10 independently re-formed
repetitions for each of 24 static letters per session. Rest the hand between
repetitions; do not call many frames from one hold many samples. This yields
480 intended elicitation units per signer before exclusions, not 480 independent
signers or a guaranteed adequately powered study. Take breaks and allow withdrawal.

Use plain-language, accessible informed consent with separate opt-ins for raw
video, derived landmarks, restricted research sharing and public artifacts. Record
pseudonymous signer ID, dominant/used hand, ASL proficiency/learning history,
session and repetition IDs; collect optional coarse demographic metadata only
when justified and consented. A fluent reviewer checks handshape and orientation;
uncertain productions are flagged, not relabeled by the model.

Randomize prompts and record each new attempt, neutral/rest intervals and natural
transitions separately. Include no person, empty frame, non-sign hand movements,
objects, partially visible hands and two-hand distractions. Balance ordinary
backgrounds, illumination direction and distances across signers and sessions;
never make one background identify a class. Capture RGB at a practical resolution
(e.g. 1280×720 target), preserving wrist margins. No marks/gloves for convenience.
The present app intentionally does not record; a collection tool requires approval.

Store raw consent/contact records separately from pseudonymous data, on encrypted
restricted storage with named custodians. Avoid faces, audio, names and identifying
backgrounds. Explain that hands/landmarks can still be identifying. Agree a
retention period before collection (proposal: pilot raw data 90 days), deletion
contact, response window and backup-expiry schedule. Withdrawn IDs must be purged
from raw/derived records and future releases; explain limits of recalling already
public data before any release. No public raw videos by default.

## Decision gates

**GO** only after documented lawful use/consent, stable signer/session/elicitation
IDs, fluent review, adequate valid repetitions in every planned class/signer fold,
and measured acceptable extraction coverage without excluding difficult people.
Provisional feasibility criteria are in RESEARCH_PROTOCOL.md; they are proposed
engineering gates, not observed results or a power calculation.

**CONDITIONAL** now: audit A/Massey rights and archive provenance, or recruit a
consented pilot with clear limits. **NO-GO** for claims based on random frame/image
splits, unknown signer identities, inflated augmented counts, depth-as-RGB,
static J/Z completeness, or unconsented footage. Five known signers support only
a small exploratory LOSO study, not population-wide generalization.
