import { WithRxProperties } from '../util/mod.types.js'
import { $$ } from './$$.js'

export function with$$<T extends object>(
  target: T
): { target: T; $$: WithRxProperties<T> } {
  return { target, $$: $$(target) }
}
