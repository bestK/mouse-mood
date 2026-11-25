# Mood Recognition — Adaptive UI Lab

Interactive bilingual (中文 / English auto-detect) React showcase built with [Libraries.dev Mood Recognition (beta)](https://libraries.dev/mood-recognition).

## Local Development

The Libraries.dev React kit (`MoodRecognition-React-0.5.zip`) and on-device model (`MoodRecognition-0.4.zip`) are licensed under the **Libraries.dev Model License** and are intentionally excluded from this repository via `.gitignore`.

1. Download both files from [libraries.dev/mood-recognition](https://libraries.dev/mood-recognition) (Install tab, free account).
2. Unzip the React kit into `src/mood-recognition/` and place `MoodRecognition.json` beside it inside `src/mood-recognition/`.
3. Install and run:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Vite bundles `MoodRecognition.json` directly into the compiled application bundle (`dist/assets/index-*.js`) with sourcemaps disabled — no standalone model file is emitted.
