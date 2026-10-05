---
title: "Face Scout"
order: 17
status: in-progress
year: "2026"
stack: ["Python", "MediaPipe", "InsightFace", "scikit-learn", "OpenCV"]
summary: "A staged webcam CV system: multi-face tracking, 468-point mesh, ArcFace identity — plus a lip-reading v1 built on the same landmarks."
role: "clean seams, unproven on a real face"
featured: false
github: https://github.com/sutheimernico/face-scout
domain: ml
context: personal
reviewed: false
fieldNote: "74 tests are green and every one of them uses fakes or synthetic arrays. No test has ever run the real models on a real image, and the lip-reading accuracy quoted in the ADR is extrapolated from literature, not measured here. That gap is the project's headline, not a footnote."
---

## What it is

A local webcam computer-vision system in two stages. **Phase 1** detects every face in the frame,
follows each under a stable id across frames, draws MediaPipe's 468-point face mesh including the
dense lip contour, and labels enrolled people with a cosine confidence score against a local
gallery. **Phase 2 v1** is closed-vocabulary, single-speaker lip reading built on exactly those
lip landmarks: `record → train → eval → run`, with a push-to-talk live mode. **Phase 3**
(song/audio recognition) is deliberately parked.

Both phases are code-complete and gated. Neither has been verified in front of a real webcam.

## Architecture

Two responsibilities, two libraries, kept apart: **MediaPipe FaceLandmarker** owns geometry,
tracking substrate and lips; **InsightFace** (`buffalo_l`, ArcFace on ONNX Runtime, CPU) owns
identity. The pipeline is

`frame → landmarker → tracker (stable ids) → every Nth frame: embedder → gallery match → renderer`

- **Tracking** is greedy IoU association with aging, so an id survives a brief occlusion.
- **Identity is throttled** (default every 10th frame) because who you are does not change
  frame-to-frame, associated back to the right track by bounding-box IoU, and kept *sticky*
  between passes so labels do not flicker.
- **The lip pipeline is pure numpy**: per-frame normalisation (nose-tip translation, inter-ocular
  scaling), velocity-based trimming, resampling to a fixed length, then a RandomForest over the
  flattened sequence.
- Hardware sits behind `Protocol` seams (`FrameSource`, `Landmarker`, `Embedder`), which is why
  the logic core is testable with no camera and no heavy CV import.

## Why it's built this way

The staging is the design: Phase 1 exists to produce the substrate Phase 2 consumes, so no second
vision pipeline was needed. **ADR 0001 argues explicitly against the SOTA.** LipNet-style pixel
CNNs, AV-HuBERT and Auto-AVSR assume hundreds of hours of curated video and hundreds of GPU-hours;
with a few dozen self-recorded clips on a CPU, data efficiency dominates and a landmark-sequence
classifier wins. The evidence cuts both ways and the ADR says so: landmarks alone are documented
as insufficient for open-set multi-speaker lip reading — they only work here *because* the
vocabulary is closed, the speaker is one person and the camera never changes.

## Implementation

- **74 tests** plus ruff over roughly 1,300 lines; the camera and display paths stay thin on
  purpose because they cannot be unit-tested.
- Evaluation is **session-aware**: whole recording sessions are held out, so frames from one
  sitting cannot leak between train and validation and inflate the score.
- Biometric artefacts — the embedding gallery, lip recordings, the trained model — are local and
  git-ignored. Nothing biometric is ever committed.

## Trade-offs & what I considered

- **"Imports cleanly" is not "works", and the repo is explicit about it.** A written plan names
  the defining gap: no test instantiates the real MediaPipe or InsightFace models on a real image,
  no lip-reading clip has ever been recorded, and the `--video` path has never seen real footage.
  The fix — real-inference tests on fixture media and a *measured* accuracy report — is planned
  and not yet executed.
- **The accuracy number is borrowed, not earned.** The ~80–95 % expectation for a 10–30 word
  vocabulary comes from comparable landmark-only work in the ADR; this system has produced no
  accuracy figure of its own.
- **A temporal neural model was considered and deferred** to a RandomForest v1, because ~50+
  samples per class and a heavy dependency were not justified before any data existed.
- **CPU-first and local-only**, which caps throughput and keeps identity on a throttle — an
  accepted cost for a system handling biometric data.
