import { RxSet } from '@toonvanvr/rx-ify';
import { Node } from './node.js';
export class Mesh {
    dom = document.createElement('div');
    nodes = new RxSet();
    // on-add: scale
    Node = Node.bind(null, this);
}
