# public/videos/

Self-hosted screencast assets — referenced by `src/data/videos.ts` and
rendered through `src/components/Screencast.astro`.

Layout:

```
public/videos/
├── loops/        — .webm and .mp4 pairs for loop-mode slots
└── posters/      — .png poster frames for both loop and walkthrough slots
```

Files are committed to the repo. Hard budgets enforced by
`npm run videos:check`:

- `loops/*.webm` and `loops/*.mp4` — each ≤ 800KB
- `posters/*.png` — ≤ 80KB (run `pngquant --quality=70-85`)

Walkthrough videos are **not** hosted here — they live on YouTube and
are referenced by `youtubeId` in the registry. Only their poster lives
in `posters/`.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the full recording
workflow and the exact ffmpeg commands.
