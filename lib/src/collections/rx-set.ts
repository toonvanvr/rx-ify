import {
  combineLatest,
  EMPTY,
  map,
  merge,
  of,
  share,
  startWith,
  Subject,
} from 'rxjs'

export class RxSet<T> extends Set<T> {
  public readonly additions$ = new Subject<T>()
  add(value: T): this {
    if (this.has(value)) {
      return this
    } else {
      super.add(value)
      this.additions$.next(value)
      return this
    }
  }

  public readonly clears$ = new Subject<void>()
  clear(): void {
    super.clear()
    this.clears$.next()
  }

  public readonly deletes$ = new Subject<T>()
  delete(value: T): boolean {
    const deleted = this.delete(value)
    if (deleted) {
      this.deletes$.next(value)
    }
    return deleted
  }

  public readonly updated$ = merge(
    this.additions$,
    this.deletes$,
    this.clears$
  ).pipe(() => EMPTY, share())
  public readonly updates$ = merge(
    this.additions$.pipe(map((value) => ({ type: 'add', value }))),
    this.deletes$.pipe(map((value) => ({ type: 'delete', value }))),
    this.clears$.pipe(map(() => ({ type: 'clear' })))
  ).pipe(share())

  difference$<U>(other: RxSet<U>): RxSet<T> {
    combineLatest([this.updated$, other.updated$]).pipe(([a, b]) => )
  }
  difference<U>(other: ReadonlySetLike<U>): Set<T> {
    return new RxSet(super.difference(other))
  }

  entries(): SetIterator<[T, T]> {}

  forEach(
    callbackfn: (value: T, value2: T, set: Set<T>) => void,
    thisArg?: any
  ): void {}

  has(value: T): boolean {}

  intersection<U>(other: ReadonlySetLike<U>): Set<T & U> {}

  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {}

  isSubsetOf(other: ReadonlySetLike<unknown>): boolean {}

  isSupersetOf(other: ReadonlySetLike<unknown>): boolean {}

  keys(): SetIterator<T> {}

  size: number

  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {}

  union<U>(other: ReadonlySetLike<U>): Set<T | U> {}

  public readonly values$ = merge(
    this.additions$,
    this.updates$,
    this.clears$
  ).pipe(() => of(this.values()), startWith(this.values()))
  values(): SetIterator<T> {}
}
