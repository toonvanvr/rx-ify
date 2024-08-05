import { RxSet } from '@toonvanvr/rx-ify'
import { Node } from './node.js'

export class Mesh {
  public readonly dom = document.createElement('div')
  public readonly nodes = new RxSet<Node>()
  // on-add: scale

  Node = Node.bind(null, this)
}
