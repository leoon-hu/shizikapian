import { categories } from './categories'

export { categories }
export const findCategory = (id: string) => categories.find((c) => c.id === id)

export type { Card, Category, DisplayMode, Lang, Part } from './types'
export * from './paths'
export { prompts, promptIds, type PromptId } from './prompts'
