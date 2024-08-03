import { BehaviorSubject } from '../../node_modules/rxjs/dist/types/index'
import { RxTools } from '../lib/const'
import { Property } from '../lib/types'

type Mods<T = any> = Map<Property<T>, BehaviorSubject<unknown>>

function provision<T extends { [RxTools]?: Mods }>(
  target: T,
  key: Property<T>,
  value: unknown
): BehaviorSubject<unknown> {
  let mods: Mods<T>
  if (!(RxTools in target)) {
    mods = new Map()
    Object.defineProperty(target, RxTools, {
      enumerable: false,
      writable: false,
      value: mods,
    })
  } else {
    mods = target[RxTools] as Mods<T>
  }

  let value$: BehaviorSubject<unknown>
  if (mods.has(key)) {
    value$ = mods.get(key)!
  } else {
    value$ = new BehaviorSubject(value)
    const { enumerable, set: oldSetter } =
      Object.getOwnPropertyDescriptor(target, key) ?? {}
    Object.defineProperty(target, key, {
      enumerable: enumerable ?? true,
      writable: true,
      set(v: unknown) {
        oldSetter?.call(target, v)
        value$.next(v)
      },
      value,
    })
    mods.set(key, value$)
  }

  return value$
}

/**
 * Create a wrapper around an object to make its properties reactive
 *
 * @param target
 */
export function rx<T extends object>(target: T) {
  return new Proxy<T>(target, {
    get(target: T, key: Property<T>, receiver: any) {
      return provision(target, key, target[key]).asObservable()
    },
    set(value: unknown, key: Property<T>, receiver: any): boolean {
      provision(target, key, value)
      return true
    },
  })
}

/**
 * Check whether {@link rx} has been called on this object
 *
 * @param target
 * @returns
 */
export function isRx<T extends object>(
  target: T
): target is T & { [RxTools]: Mods } {
  return RxTools in target
}
