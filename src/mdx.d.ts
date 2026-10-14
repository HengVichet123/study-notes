declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { NoteMeta } from './notes'
  export const meta: NoteMeta
  const Component: ComponentType
  export default Component
}
