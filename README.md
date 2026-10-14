# Seminar Notes

Study notes for the M1 seminar (Foundations of Computer Vision, visionbook.mit.edu).
Live: https://hengvichet123.github.io/seminar-notes/

## Add a new note

1. Create `src/notes/<section>-<short-name>.mdx`, for example `src/notes/40-4-homography.mdx`.
2. Start it with:

   ```mdx
   ---
   title: Homography
   section: 40.4
   chapter: 40 · Stereo vision
   date: 2026-10-20
   summary: One sentence shown in the list.
   ---
   ```

3. Write Markdown. Math uses `$...$` and `$$...$$` (KaTeX).
4. Push to `main`. GitHub Actions builds and publishes it. It appears in the list, sorted by section.

## Blocks you can use in any note (no import needed)

- `<Goal>` what this step is for
- `<KeyEq name="...">` a key equation
- `<SayIt>` a sentence to say to the professor
- `<Figure caption="...">` wraps a figure
- `<QAList>` + `<QA q="...">` tap-to-open questions
- Figures in `src/figures/` (add a new `.tsx` there and export it from `src/figures/index.ts`)

## Run locally

```sh
npm install
npm run dev
```
