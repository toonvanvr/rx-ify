export type Vector = { x: number; y: number }
export type SecondOnwards<T> = T extends [first: any, ...rest: infer Rest] ? Rest : never
