import { NEVER, Observable, share, Subject, switchAll } from 'rxjs'
import { Edge } from './edge.js'
import { Mesh } from './mesh.js'
import { Vector } from './types.js'

export class Node {
  public readonly mesh: Mesh
  public readonly x: number
  public readonly y: number

  public readonly edges = new Map<Node, Edge>()
  public readonly source$ = new Subject<Observable<any>>()
  public readonly value$ = this.source$.pipe(switchAll(), share())

  constructor(mesh: Mesh, { x, y }: Vector, source$: Observable<any> = NEVER) {
    this.mesh = mesh
    this.x = x
    this.y = y
    this.source$.next(source$)
  }

  Edge = Edge.bind(null, this)
}
