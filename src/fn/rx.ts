import { BehaviorSubject, Observable, of, share, switchMap } from 'rxjs'
import { RxTools } from '../lib/const.js'
import { Property } from '../lib/types.js'

type Mod = {
  source$: BehaviorSubject<Observable<any>>
  value$: Observable<any>
}
type Mods<T = any> = Map<Property<T>, Mod>

type WithRxProperties<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : Observable<T[K]>
}

function provision<T extends { [RxTools]?: Mods }, K extends Property<T>>(
  target: T,
  key: K
): Mod {
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

  let mod: Mod
  if (mods.has(key)) {
    mod = mods.get(key)!
  } else {
    const source$ = new BehaviorSubject(of(target[key]))
    const value$ = source$.pipe(
      switchMap((v) => v),
      share()
    )
    mod = { source$, value$ }
    const { enumerable, set: oldSetter } =
      Object.getOwnPropertyDescriptor(target, key) ?? {}
    Object.defineProperty(target, key, {
      enumerable: enumerable ?? true,
      set(v: T[K]) {
        oldSetter?.call(target, v)
        source$.next(of(v))
      },
      get() {
        return value$
      },
    })
    mods.set(key, { source$, value$ })
  }

  return mod
}

/**
 * Create a wrapper around an object to make its properties reactive
 *
 * @param target
 */
export function rx<T extends object>(target: T): WithRxProperties<T> {
  return new Proxy<WithRxProperties<T>>(target as any, {
    get(target: any, key: Property<T>, receiver: any) {
      return provision(target as T, key).value$
    },
    set(
      target: any,
      key: Property<T>,
      value: T[Property<T>] | Observable<T[Property<T>]>,
      receiver: any
    ): boolean {
      const mod = provision(target as T, key)
      if (value instanceof Observable) {
        mod.source$.next(value)
      } else {
        mod.source$.next(of(value))
      }
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
