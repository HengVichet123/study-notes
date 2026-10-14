# Study Notes

My documentation of classes and materials, explained step by step.
Live: https://hengvichet123.github.io/study-notes/

## Add a new note

1. Create `src/notes/<short-name>.mdx`, for example `src/notes/seminar-40-4-homography.mdx`.
2. Start it with:

   ```mdx
   ---
   title: Homography
   course: M1 Seminar · Computer Vision
   section: 40.4
   chapter: 40 · Stereo vision
   date: 2026-10-20
   summary: One sentence shown in the list.
   ---
   ```

   `course` groups notes in the list (use the exact same text for every note of one class).
   `section` sorts them inside the course (`40.4`, `Lecture 3`, ...). `chapter` is optional.
3. Write Markdown. Math uses `$...$` and `$$...$$` (KaTeX).
4. Push to `main`. GitHub Actions builds and publishes it.

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
