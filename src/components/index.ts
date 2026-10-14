import type { MDXComponents } from 'mdx/types'
import { Figure, Goal, KeyEq, QA, QAList, SayIt } from './blocks'
import * as figures from '../figures'

// Everything here can be used in any .mdx note without importing it.
export const mdxComponents: MDXComponents = {
  Goal,
  KeyEq,
  SayIt,
  Figure,
  QA,
  QAList,
  ...figures,
}
