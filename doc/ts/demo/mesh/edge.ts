import { RxSet } from '@toonvanvr/rx-ify'
import { Node } from './node.js'

export class Edge {
  public readonly nodes: RxSet<Node>

  constructor(a: Node, b: Node) {
    this.nodes = new RxSet([a, b])
    a.edges.set(b, this)
    b.edges.set(a, this)
  }
}
