import type { ComponentType } from 'react'

// Every file in src/notes/*.mdx becomes a note. Add a file, and it shows up
// in the list automatically, grouped by chapter and sorted by section number.
export interface NoteMeta {
  title: string
  section: string // book section, e.g. "40.3.2.1"
  chapter: string // e.g. "40 · Stereo vision"
  date: string // YYYY-MM-DD, when the note was written
  summary: string
}

export interface Note extends NoteMeta {
  slug: string
  Body: ComponentType
}

const modules = import.meta.glob<{ default: ComponentType; meta: NoteMeta }>('./notes/*.mdx', {
  eager: true,
})

const bySection = (a: string, b: string) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? -1) - (pb[i] ?? -1)
    if (d !== 0) return d
  }
  return 0
}

export const notes: Note[] = Object.entries(modules)
  .map(([path, mod]) => ({
    ...mod.meta,
    slug: path.replace('./notes/', '').replace('.mdx', ''),
    Body: mod.default,
  }))
  .sort((a, b) => bySection(a.section, b.section))

export const chapters: { chapter: string; notes: Note[] }[] = []
for (const note of notes) {
  const group = chapters.find((c) => c.chapter === note.chapter)
  if (group) group.notes.push(note)
  else chapters.push({ chapter: note.chapter, notes: [note] })
}
