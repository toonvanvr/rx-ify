import { BehaviorSubject, Observable, of, Subscription, switchMap } from 'rxjs'
import { RxTools } from '../lib/const.js'
import { Property } from '../lib/types.js'

/** Full reactivity state invisibly attached to an object */
type Mods<T = any> = Map<Property<T>, Mod>

/** Reactivity state for an object property */
type Mod = {
  source$: BehaviorSubject<Observable<any>>
  value$: Observable<any>
  subscription: Subscription
  oldSetter: undefined | ((v: any) => void)
}

/** Wraps all properties of an object in Observable (set/gettable) */
type WithRxProperties<T> = {
  [K in keyof T]: Observable<T[K]>
}

/**
 * Attach a reactivity state to an object if it doesn't exist yet.
 *
 * NOTE: Memory wise this can probably be improved, but it's optimized to
 * somewhat efficiently grab the state again.
 */
function provision<T extends { [RxTools]?: Mods }, K extends Property<T>>(
  target: T,
  key: K
): Mod {
  let mods: Mods<T>

  // Attach an empty reactive state to the object if this is the first time
  // we're handling this object, else return that state (performance+)
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

  // Make the property reactive or return its reactive state object
  if (mods.has(key)) {
    return mods.get(key)! // mods.get could be called above to improve perf
  } else {
    // Crawl along the inheritance chain to find a setter/getter
    // TODO: is it possible that one layer sets `enumerable` etc and that
    //       another layer sets the getter? In that case, we've got a bug.
    // TODO: make this a function
    let propOwner = target
    let propDescriptor
    while (
      !(propDescriptor = Object.getOwnPropertyDescriptor(propOwner, key))
    ) {
      propOwner = Object.getPrototypeOf(propOwner)
    }
    const { enumerable, set: oldSetter, get: oldGetter } = propDescriptor ?? {}

    // Create a source and value cache in memory and make each emission of the
    // source observable affect the parent object (memory-)
    const source$ = new BehaviorSubject(of(target[key]))
    const value$ = new BehaviorSubject(target[key])
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
}

/**
 * Create a wrapper around an object to make its properties reactive
 *
 * The setters and getters of the base object are wrapped for properties which
 * are altered so that the base object setters and getters interact with the
 * reactive layer.
 *
 * - TODO: Currently, no function exists to un-alter these properties
 * - TODO: Errors on unconfigurable properties are not detected yet
 * - IDEA: should the source observable.next() be called by the setter?
 *
 * ```
 * const foo = { bar: 3 }
 * const foo$$ = rx(foo)
 *
 * // Normal setters keep working
 * foo.bar = 4
 *
 * // Setters on the wrapped object accept observables
 * foo$$.bar = interval(1000)
 *
 * foo$$.bar instanceof Observable // true
 * typeof foo.bar === 'number' // true
 *
 * foo$$.bar.subscribe(console.log)
 * foo.bar = 5 // logs: 5
 * ```
 *
 * TODO: setting a non-observable on foo$$ should remove the subscription
 */
export function rx<T extends object>(target: T): WithRxProperties<T> {
  return new Proxy<WithRxProperties<T>>(target as any, {
    // Return an observable for the target object's property
    get(target: any, key: Property<T>, receiver: any) {
      return provision(target as T, key).value$
    },
    // Swap the emitting source$ with your own observable (switchmap)
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
        // TODO: remove the subscription
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
