import { Observable, of } from 'rxjs'
import { Property } from '../types/object.js'
import { getMod } from '../util/mod.js'
import type { WithRxProperties } from '../util/mod.types.js'

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
      return getMod(target as T, key).value$
    },
    // Swap the emitting source$ with your own observable (switchmap)
    set(
      target: any,
      key: Property<T>,
      value: T[Property<T>] | Observable<T[Property<T>]>,
      receiver: any
    ): boolean {
      const mod = getMod(target as T, key)
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
