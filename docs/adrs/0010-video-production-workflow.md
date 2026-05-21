# ADR-0010 · Video production: tiny self-hosted loops, facade-loaded YouTube walkthroughs

**Status:** Accepted
**Date:** 2026-05-21
**Related:** ADR-0009 (the why)

## Context

ADR-0009 commits us to two video forms (`loop` and `walkthrough`). This ADR pins down the boring-but-load-bearing production details: where files live, how they're encoded, what a contributor actually types to record one, and what `npm run videos:check` enforces.

## Decision

### Loops — self-hosted, dual-source `<video>`

Encoded twice. The `<video>` element lists both sources; the browser picks.

- **Primary:** WebM / VP9, 720p, ≤ 600KB target, ≤ 800KB hard limit.
- **Fallback:** MP4 / H.264 (yuv420p, `+faststart`), 720p, ≤ 800KB.
- **Duration:** 4–10 seconds. Loops seamlessly (last frame matches first frame; verify visually before commit).
- **No audio track.** Strip with `-an`.
- **Poster:** PNG, ≤ 80KB, same aspect ratio. Shown until the video starts and on reduced-motion.

Canonical encoding commands (also embedded in `CONTRIBUTING.md`):

```bash
# Source: anything QuickTime / OBS produces, typically 1080p .mov
SRC=raw.mov
NAME=chat-loop

# WebM (VP9, two-pass for quality at low bitrate)
ffmpeg -y -i "$SRC" -an -vf "scale=-2:720" \
  -c:v libvpx-vp9 -b:v 700k -minrate 400k -maxrate 900k \
  -pass 1 -f null /dev/null
ffmpeg -y -i "$SRC" -an -vf "scale=-2:720" \
  -c:v libvpx-vp9 -b:v 700k -minrate 400k -maxrate 900k \
  -pass 2 "public/videos/loops/${NAME}.webm"

# MP4 (H.264 baseline, +faststart for streaming)
ffmpeg -y -i "$SRC" -an -vf "scale=-2:720" \
  -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p \
  -movflags +faststart "public/videos/loops/${NAME}.mp4"

# Poster (last "interesting" frame, ~2s in)
ffmpeg -y -ss 2 -i "$SRC" -frames:v 1 -vf "scale=-2:720" \
  "public/videos/posters/${NAME}.png"
pngquant --quality=70-85 --ext .png --force "public/videos/posters/${NAME}.png"
```

### Walkthroughs — YouTube facade

- **Host:** YouTube (unlisted is fine). Avoids us paying for storage + transcoding for content that can be 100+ MB.
- **Embed:** Facade pattern. The page renders a `<button>` with the poster as `<img>`. On click, the button is replaced with an `<iframe>` pointed at `youtube-nocookie.com/embed/<id>?autoplay=1`. No YouTube JS, cookies, or iframe load until that click.
- **Captions:** Required. Uploaded as a YouTube CC track (auto-captions are NOT acceptable — must be edited).
- **Transcript:** Required. Lives in the registry next to the slot (plain text). Renders in a `<details>` below the player.
- **Duration:** 60–180s. Longer than 180s → split into chapters or re-scope.

### Registry shape

```ts
// src/data/videos.ts
export interface VideoSlot {
  id: string;             // "chat-loop"
  mode: "loop" | "walkthrough";
  status: "missing" | "present";
  lesson: string;         // lesson slug, or "home" for hero-reel slots
  posterAlt: string;      // required: aria-label / alt text for any poster
  // loop-only
  webm?: string;
  mp4?: string;
  poster?: string;
  aspect?: string;        // CSS aspect-ratio, e.g. "16 / 9"
  // walkthrough-only
  youtubeId?: string;
  transcript?: string;
  captionsVerified?: boolean;
  // both
  recordedAt?: string;    // ISO date; flagged stale after 12mo
}
```

A slot with `status: "missing"` renders nothing. Sites with zero recorded video still build, test, and ship.

### `npm run videos:check`

Runs in CI. Hard-fails when:

- A `mode: "loop"` slot is `present` but its `.webm` or `.mp4` is missing or > 800KB.
- A `mode: "loop"` slot has a poster > 80KB.
- A `mode: "walkthrough"` slot is `present` with `captionsVerified !== true`.
- A `mode: "walkthrough"` slot is `present` without `transcript`.
- Any `recordedAt` > 12 months old (warning, not error — surfaces in the check output).

## Rationale

- **Self-hosting loops costs ~5MB total** at 5 categories × ~800KB. Trivial compared to the page-load benefit of skipping a third-party player for tiny content.
- **YouTube facade for walkthroughs** avoids us paying for CDN, transcoding, and adaptive bitrate. The user already pays the iframe cost only if they want the video.
- **`npm run videos:check`** treats video assets as first-class — same enforcement as `npm run check` (types) or `npm run lint`. No "the video shipped but the transcript was forgotten" failures.
- **The "missing" state ships.** Infrastructure lands before any recording. We don't block PR #1 on a recording session.

## Consequences

- We commit to keeping the encoding commands in `CONTRIBUTING.md` working. If `ffmpeg` defaults change, we update the commands and re-encode existing loops if budget regresses.
- YouTube as a single point of failure for walkthroughs. Acceptable — if YouTube is down, our walkthroughs being unwatchable is the least of anyone's problems that day.
- `pngquant` is a new tool contributors need locally. Documented as `brew install pngquant` (macOS) and equivalent in `CONTRIBUTING.md`.

## Files of note

- `CONTRIBUTING.md` (video section, sourced from this ADR)
- `scripts/verify-videos.mjs`
- `src/data/videos.ts`
- `package.json` — adds `"videos:check": "node --disable-warning=ExperimentalWarning scripts/verify-videos.mjs"` to scripts (the flag silences Node's type-stripping notice; safe to drop once Node ships it unflagged)
