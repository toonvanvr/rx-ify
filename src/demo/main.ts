import { rx } from '../fn/rx'

const foo = {
  bar: 1,
}

const foo$$ = rx(foo)
foo$$.bar = 3

console.log(foo)
