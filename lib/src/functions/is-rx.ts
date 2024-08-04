import { RxTools } from '../config/const.js'
import { Mods } from '../util/mod.types.js'
import type { rx } from './rx.js'

/**
 * Check whether {@link rx} has been called on this object
 */
export function isRx<T extends object>(
  target: T
): target is T & { [RxTools]: Mods } {
  return RxTools in target
}
