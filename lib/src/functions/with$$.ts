import { WithRxProperties } from '../util/mod.types'
import { $$ } from './$$'

export function with$$<T extends object>(
  target: T
): { target: T; $$: WithRxProperties<T> } {
  return { target, $$: $$(target) }
}
