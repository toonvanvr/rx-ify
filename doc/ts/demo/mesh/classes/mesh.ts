import { $$, RxSet } from '@toonvanvr/rx-ify'
import { distinctUntilChanged, map, mergeMap, scan, share, switchMap } from 'rxjs'
import type { SecondOnwards } from '../types.js'
import { Node } from './node.js'

export class Mesh {
  private readonly Node = Node.bind(null, this)

  private readonly nodes = new RxSet<Node>()
  public readonly dom = document.createElement('div')
  private readonly style$$ = $$(this.dom.style)

  public readonly limits$ = this.nodes.values$.pipe(
    mergeMap((nodes) => nodes.map((node) => node.origin$)),
    switchMap((v) => v),
    scan(
      (limits, origin) => ({
        x: {
          min: Math.min(limits.x.min, origin.x),
          max: Math.max(limits.x.max, origin.x),
        },
        y: {
          min: Math.min(limits.y.min, origin.y),
          max: Math.max(limits.y.max, origin.y),
        },
      }),
      { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } },
    ),
    distinctUntilChanged(
      (a, b) =>
        a.x.min === b.x.min &&
        a.x.max === b.x.max &&
        a.y.min === b.y.min &&
        a.y.max === b.y.max,
    ),
    share(),
  )

  public readonly size$ = this.limits$.pipe(
    map(({ x, y }) => ({
      width: x.max - x.min,
      height: y.max - y.min,
    })),
    share(),
  )

  constructor() {
    this.style$$.gridTemplate = this.size$.pipe(
      map(({ width, height }) => `repeat(${width}, 1fr) / repeat(${height}, 1fr)`),
    )

    this.addNode({ x: 1, y: 0 })
    this.addNode({ x: 2, y: 0 })
    this.addNode({ x: 3, y: 4 })
    this.addNode({ x: 2, y: 6 })
  }

  public addNode(...args: SecondOnwards<ConstructorParameters<typeof Node>>) {
    const node = new this.Node(...args)
    this.nodes.add(node)
    return node
  }
}
