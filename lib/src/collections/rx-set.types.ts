export type IndexOptions<T> = {
  unique: boolean
} & { static: keyof T }

export interface RxSetOptions<T> {
  indices?: Iterable<IndexOptions<T>>
}
