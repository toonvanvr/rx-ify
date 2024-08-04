import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { Property } from '../types/object.js'

/** Full reactivity state invisibly attached to an object */
export type Mods<T = any> = Map<Property<T>, Mod>

/** Reactivity state for an object property */
export type Mod = {
  source$: BehaviorSubject<Observable<any>>
  value$: Observable<any>
  subscription: Subscription
  oldSetter: undefined | ((v: any) => void)
}

/** Wraps all properties of an object in Observable (set/gettable) */
export type WithRxProperties<T> = {
  [K in keyof T]: Observable<T[K]>
}
