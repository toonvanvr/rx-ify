import {
  BehaviorSubject,
  NEVER,
  Subject,
  filter,
  firstValueFrom,
  map,
  switchMap,
} from 'rxjs'

export class RxMap<K, V> {
  readonly #items = new Map<K, V>()
  readonly #itemsUpdated$ = new Subject<void>()
  readonly #transaction$ = new BehaviorSubject(false)

  public readonly items$ = this.#transaction$.pipe(
    switchMap((tx) => {
      if (tx) {
        return this.#itemsUpdated$.pipe(map(() => this.#items))
      } else {
        return NEVER
      }
    })
  )

  constructor() {}

  set(key: K, value: V) {
    this.#items.set(key, value)
    this.#itemsUpdated$.next()
  }

  setMany(entries: Iterable<[K, V]>) {
    for (const [key, value] of entries) {
      this.set(key, value)
    }
    this.#itemsUpdated$.next()
  }

  async transaction(): Promise<this> {
    await firstValueFrom(
      this.#transaction$.pipe(filter(() => this.#transaction$.value === false))
    )
    return this
  }

  [Symbol.dispose]() {
    this.#transaction$.next(false)
  }
}
