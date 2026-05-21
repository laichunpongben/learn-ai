# Contributing to Learn AI

This file covers the parts of the workflow that aren't obvious from `README.md` —
recording screencasts and the editorial guardrails around them. For day-to-day
code conventions, read `CLAUDE.md` (in the repo root) and the ADRs under
`docs/adrs/`.

## Recording screencasts

Two forms, one component (`src/components/Screencast.astro`). The why is in
[ADR-0009](docs/adrs/0009-screencast-strategy.md); the production
details are in [ADR-0010](docs/adrs/0010-video-production-workflow.md).

| Form | Goal | Format | Slot |
|------|------|--------|------|
| **loop** | 5–10s silent loop of a real product in motion. Anchors a capability lesson to "this is what it actually looks like." | self-hosted MP4 + WebM | one per capability lesson + one per home `HeroReel` moment |
| **walkthrough** | 60–180s end-to-end demo of an outcome. Lives on `build-*` lessons. | YouTube facade (lazy iframe) | one per `build-*` lesson |

Pick from the registry (`src/data/videos.ts`). Every anticipated slot already
exists with `status: "missing"` — your job is to flip one to `"present"` after
recording.

### Tools you need

- `ffmpeg` — `brew install ffmpeg` (macOS) / `apt install ffmpeg` (Linux)
- `pngquant` — `brew install pngquant` / `apt install pngquant`
- A screen recorder — QuickTime Player on macOS (`Cmd+Shift+5` → Record), or [OBS](https://obsproject.com/) on any OS
- A YouTube account (only needed for walkthroughs)

### Recording a loop

1. Record source at **1080p, ≥30fps**. Trim to a **4–10 second** seamless loop —
   last frame must visually match the first or the loop pops.
2. Encode twice (WebM/VP9 primary, MP4/H.264 fallback) and pull a poster frame:

   ```bash
   SRC=raw.mov                       # your recording
   NAME=chat-loop                    # matches the registry slot id

   # WebM (VP9, two-pass)
   ffmpeg -y -i "$SRC" -an -vf "scale=-2:720" \
     -c:v libvpx-vp9 -b:v 700k -minrate 400k -maxrate 900k \
     -pass 1 -f null /dev/null
   ffmpeg -y -i "$SRC" -an -vf "scale=-2:720" \
     -c:v libvpx-vp9 -b:v 700k -minrate 400k -maxrate 900k \
     -pass 2 "public/videos/loops/${NAME}.webm"

   # MP4 (H.264, +faststart for streaming)
   ffmpeg -y -i "$SRC" -an -vf "scale=-2:720" \
     -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p \
     -movflags +faststart "public/videos/loops/${NAME}.mp4"

   # Poster — pick a frame about 2s in
   ffmpeg -y -ss 2 -i "$SRC" -frames:v 1 -vf "scale=-2:720" \
     "public/videos/posters/${NAME}.png"
   pngquant --quality=70-85 --ext .png --force "public/videos/posters/${NAME}.png"
   ```

3. Verify sizes: webm + mp4 each ≤ 800KB, poster ≤ 80KB. Re-encode tighter if not.
4. Flip the registry entry (in `src/data/videos.ts`):

   ```ts
   {
     id: "chat-loop",
     mode: "loop",
     status: "present",                   // was "missing"
     lesson: "chat-first",
     posterAlt: "Real chat assistant streaming a reply",
     webm:   "/videos/loops/chat-loop.webm",
     mp4:    "/videos/loops/chat-loop.mp4",
     poster: "/videos/posters/chat-loop.png",
     aspect: "16 / 9",
     recordedAt: "2026-05-21",            // today, ISO format
   }
   ```

5. `npm run videos:check` must pass. If a budget is busted the script tells you which.
6. `npm run dev` — confirm the loop plays where expected and the simulator
   below it is unaffected. Reduced-motion users (`Settings → Accessibility →
   Display → Reduce motion`) should see only the poster.

### Recording a walkthrough

1. Plan the arc — the goal is one outcome, 60–180s. Longer than 180s → split or rescope.
2. Record. Upload to YouTube. Mark **Unlisted** if you don't want it in your channel feed.
3. Open YouTube Studio → Subtitles → Edit auto-generated captions until they're
   correct. **Auto-captions alone are not acceptable.**
4. Pull the video id from the URL (`https://youtu.be/<ID>` — the 11-char `[A-Za-z0-9_-]` string).
5. Create a poster frame (use the same ffmpeg command as for a loop, against
   your local source file).
6. Flip the registry entry:

   ```ts
   {
     id: "build-webpage-walkthrough",
     mode: "walkthrough",
     status: "present",
     lesson: "build-webpage",
     posterAlt: "From prompt to a shipped webpage — walkthrough",
     youtubeId: "abc123XYZ_-",
     transcript: `Today we'll build…\n\n(plain text, paragraph per line)`,
     captionsVerified: true,              // you actually edited the captions
     poster: "/videos/posters/build-webpage-walkthrough.png",
     aspect: "16 / 9",
     recordedAt: "2026-05-21",
   }
   ```

7. `npm run videos:check` must pass. The script enforces `captionsVerified: true`,
   non-empty `transcript`, and a valid 11-char `youtubeId`. (Skipping any of those
   is a WCAG 1.2.2 / 1.2.3 failure for a walkthrough that audibly carries info.)
8. `npm run dev` — open the lesson, confirm the poster shows, click it,
   confirm the YouTube iframe loads and autoplays. Confirm the transcript renders
   below the player in a `<details>` block.

### When a video gets stale

`recordedAt` older than 12 months → `npm run videos:check` warns (does not fail).
Re-record when:

- The real product's UI shifted noticeably (button positions, copy, panel layout)
- A new dominant product joined the category and the loop should show it instead
- The voiceover references a deprecated feature

Re-recording is a flat replace: same slot id, new files, bumped `recordedAt`.

### Things to never do

- Don't upload auto-generated captions without editing them — they will be wrong, and
  shipping them is a worse accessibility experience than no captions.
- Don't ship a loop with audio. The component renders `muted`, but a loop with audio
  defeats the design choice in ADR-0009 (silent loops sit comfortably alongside prose).
- Don't host walkthroughs on TikTok / X / Bluesky / arbitrary CDNs. The facade pattern
  is specific to YouTube (and youtube-nocookie); other hosts need a different
  embed contract.
- Don't `git add public/videos/posters/*.psd` or other working files — only ship the
  optimised `.webm`, `.mp4`, and quantised `.png`.
