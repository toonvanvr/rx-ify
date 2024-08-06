import { Subject, map, share, startWith } from 'rxjs'
import { RxMap } from './rx-map.js'
import type { IndexOptions, RxSetOptions } from './rx-set.types.d.ts'

export const Empty = Symbol('Empty')

export class RxSet<T> {
  constructor(initialItems?: Iterable<T>, { indices }: RxSetOptions<T> = {}) {
    if (initialItems) {
      this.add(...initialItems)
    }

    if (indices) {
      for (const index of indices) {
        this.addIndex(index)
      }
    }
  }
  readonly #staticIndices = new Map<PropertyKey, RxMap<T[keyof T], T>>()
  readonly #indexDefinitions = new Map<PropertyKey, IndexOptions<T>>()

  readonly #items = new Set<T>()
  readonly #itemsUpdated$ = new Subject<void>()
  readonly #items$ = this.#itemsUpdated$.pipe(map(() => this.#items), startWith(this.#items))
  public readonly values$ = this.#items$.pipe(map(items => items.values()))

  async add(...items: T[]) {
    for (const item of items) {
      this.#items.add(item)
      for (const index of this.#indexDefinitions.values()) {
        if ('static' in index) {
          await this.populateIndex(index.static)
        }
      }
    }

    this.#itemsUpdated$.next()
  }

  remove(...items: T[]) {
    for (const item of items) {
      this.#items.delete(item)
    }
    this.#itemsUpdated$.next()
  }

  addIndex(index: IndexOptions<T>) {
    if ('static' in index) {
      this.addStaticIndex(index)
    }
  }

  has$(item: T) {
    return this.#items$.pipe(
      map((items) => items.has(item) ? true : false),
      share()
    )
  }

  private async addStaticIndex<K extends keyof T>(
    index: IndexOptions<T> & { static: K }
  ) {
    const collection = new RxMap<T[K], T>()
    this.#indexDefinitions.set(index.static, index)
    this.#staticIndices.set(index.static, collection)
    await this.populateIndex(index.static)
  }

  private async populateIndex<K extends keyof T>(key: K) {
    const collection = this.#staticIndices.get(key)
    if (!collection) {
      throw new Error(`Index ${key.toString()} not found`)
    }

    using tx = await collection.transaction()
    for (const item of this.#items) {
      collection.set(item[key], item)
    }
  }
}
