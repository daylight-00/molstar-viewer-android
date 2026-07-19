# Project identity and upstream hosting

## Current identity

```text
UPSTREAM_NAMING_STATUS=approved
PROJECT_TITLE=Mol* Viewer for Android
STABLE_APPLICATION_LABEL=Mol* Viewer
CANDIDATE_APPLICATION_LABEL=Mol* Viewer Candidate
REPOSITORY=https://github.com/molstar/molstar-viewer-android
MAINTAINER=David Hyunyoo Jang
HOSTING=Mol* GitHub organization
```

## Decision record

The Android host, its implementation boundary, the project title **Mol* Viewer for Android**, the installed application name **Mol* Viewer**, attribution, and visual-branding questions were presented to the Mol* maintainers in [Discussion #1883](https://github.com/molstar/molstar/discussions/1883).

A Mol* maintainer responded that the proposal was generally acceptable and requested that the repository be hosted in the [`molstar` GitHub organization](https://github.com/molstar), with the original maintainer retaining administrator access and full control of the repository. The permanent maintainer response is recorded in [discussion comment 17665978](https://github.com/molstar/molstar/discussions/1883#discussioncomment-17665978).

The repository was subsequently transferred to `molstar/molstar-viewer-android`, and David Hyunyoo Jang retains administrator access. The project and application names remain as listed above. The repository location and this decision record state the project relationship directly.

The application icon remains an independent Android project asset unless a separately reviewed change adopts shared Mol* visual branding.

## Implementation boundary

The bundled upstream runtime comes from the `molstar` npm package. The complete prebuilt `build/viewer` runtime is vendored and distributed as a unit without patches to Mol* JavaScript, CSS, DOM structure, molecular formats, rendering, state management, or normal Viewer UI.

The Android host supplies file intents, the Android file picker, lifecycle and renderer recovery, system insets, system-theme signals, and a stable bridge to public Viewer APIs. The only active Viewer option is:

```js
layoutShowLog: false
```

## Stable-release gate

Project identity and upstream hosting are recorded and approved. A stable GitHub Release still requires:

1. verification of the permanent signing identity;
2. installation and approval of the exact release commit on a real Android device.

`UPSTREAM_NAMING_STATUS=approved` remains a machine-readable invariant so stable publication fails if the recorded decision is accidentally regressed.
