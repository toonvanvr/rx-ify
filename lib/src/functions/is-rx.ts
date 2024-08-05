import { Rxify } from '../config/const.js'
import { Mods } from '../util/mod.types.js'
import type { $$ } from './$$.js'

/**
 * Check whether {@link $$} has been called on this object
 */
export function isRx<T extends object>(
  target: T
): target is T & { [Rxify]: Mods } {
  return Rxify in target
}
