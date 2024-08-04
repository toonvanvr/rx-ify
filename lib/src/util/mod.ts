import { BehaviorSubject, of, switchMap } from 'rxjs'
import { RxTools } from '../config/const.js'
import { Property } from '../types/object.js'
import { getDescriptor } from './inheritance.js'
import { Mod, Mods } from './mod.types.js'

/**
 * Attach an empty reactive state to the object if this is the first time
 * we're handling this object, else return that state (performance+)
 */
export function getMods<T extends { [RxTools]?: Mods }>(target: T): Mods<T> {
  if (!(RxTools in target)) {
    const mods: Mods<T> = new Map()
    Object.defineProperty(target, RxTools, {
      enumerable: false,
      writable: false,
      value: mods,
    })
    return mods
  } else {
    return target[RxTools] as Mods<T>
  }
}

/**
 * Retrieve or create the reactivity state for an object property
 */
export function getMod<T extends { [RxTools]?: Mods }, K extends Property<T>>(
  target: T,
  key: K
): Mod {
  const mods = getMods(target)
  const mod = mods.get(key)
  if (mod) {
    return mod
  } else {
    return createMod(target, key, mods)
  }
}

/**
 * Create the reactivity state for an object property
 */
export function createMod<
  T extends { [RxTools]?: Mods },
  K extends Property<T>
>(target: T, key: K, mods: Mods<T>): Mod {
  // Create a backup of the original getter/setter
  const {
    enumerable,
    set: oldSetter,
    get: oldGetter,
  } = getDescriptor(target, key) ?? {}

  // Create a source and value cache in memory and make each emission of the
  // source observable affect the parent object (memory-)
  const currentValue = target[key]
  const source$ = new BehaviorSubject(of(currentValue))
  const value$ = new BehaviorSubject(currentValue)
  const subscription = source$.pipe(switchMap((v) => v)).subscribe((v) => {
    target[key] = v
  })

  // Overwrite the accessors, but make sure the setter still calls its parent
  // setters. This is needed for for example DOM.innerHTML to affect the
  // actual DOM since it doesn't read the getter after setting something.
  // Skips checking the old getter/setter upon assignment instead of during
  // calls (peformance+/memory+)
  Object.defineProperty(target, key, {
    enumerable: enumerable ?? true,
    set: oldSetter
      ? function (v: T[K]) {
          oldSetter.call(target, v)
          value$.next(v)
        }
      : function (v: T[K]) {
          value$.next(v)
        },
    get: oldGetter
      ? function () {
          oldGetter.call(target)
          return value$.value
        }
      : function () {
          return value$.value
        },
  })
  const mod = { source$, value$, subscription, oldSetter }
  mods.set(key, mod)
  return mod
}
