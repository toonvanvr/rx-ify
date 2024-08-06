import { BehaviorSubject, NEVER, Observable, share, Subject, switchAll } from 'rxjs'
import { Vector } from '../types.js'
import { Edge } from './edge.js'
import { Mesh } from './mesh.js'

export class Node {
  public readonly mesh: Mesh
  public readonly origin$: BehaviorSubject<Vector>

  public readonly edges = new Map<Node, Edge>()
  public readonly source$ = new Subject<Observable<any>>()
  public readonly value$ = this.source$.pipe(switchAll(), share())

  constructor(mesh: Mesh, { x, y }: Vector, source$: Observable<any> = NEVER) {
    this.mesh = mesh
    this.origin$ = new BehaviorSubject({ x, y })
    this.source$.next(source$)
  }

  Edge = Edge.bind(null, this)
}
