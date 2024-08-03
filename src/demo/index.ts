import { BehaviorSubject } from 'rxjs'
import { rx } from '../fn/rx.js'

const foo = {
  bar: 1,
}

const foo$$ = rx(foo)
foo$$.bar.subscribe(console.log)

foo.bar = 2
foo.bar = 3

const bs = new BehaviorSubject(4)
bs.next(5)
bs.next(6)
foo$$.bar = bs
bs.next(7)
bs.next(8)
bs.next(9)

/*
1
2
3
6
7
8
9
*/
