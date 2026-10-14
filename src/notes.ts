import type { ComponentType } from 'react'

// Every file in src/notes/*.mdx becomes a note. Add a file and it shows up
// in the list automatically, grouped by course and sorted by section.
export interface NoteMeta {
  title: string
  course: string // e.g. "M1 Seminar · Computer Vision"
  section: string // book section or lecture, e.g. "40.3.2.1" or "Lecture 3"
  chapter?: string // optional, e.g. "40 · Stereo vision"
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

// Compare "40.3.2.1" vs "40.4" or "Lecture 2" vs "Lecture 10" by their numbers.
const bySection = (a: Note, b: Note) => {
  const pa = a.section.match(/\d+/g)?.map(Number) ?? []
  const pb = b.section.match(/\d+/g)?.map(Number) ?? []
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? -1) - (pb[i] ?? -1)
    if (d !== 0) return d
  }
  return a.date.localeCompare(b.date)
}

export const notes: Note[] = Object.entries(modules)
  .map(([path, mod]) => ({
    ...mod.meta,
    section: String(mod.meta.section), // YAML reads "3" as a number
    slug: path.replace('./notes/', '').replace('.mdx', ''),
    Body: mod.default,
  }))
  .sort(bySection)

export const courses: { course: string; notes: Note[] }[] = []
for (const note of notes) {
  const group = courses.find((c) => c.course === note.course)
  if (group) group.notes.push(note)
  else courses.push({ course: note.course, notes: [note] })
}
courses.sort((a, b) => a.course.localeCompare(b.course))
