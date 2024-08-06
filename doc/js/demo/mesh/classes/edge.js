import { RxSet } from '@toonvanvr/rx-ify';
export class Edge {
    nodes;
    constructor(a, b) {
        this.nodes = new RxSet([a, b]);
        a.edges.set(b, this);
        b.edges.set(a, this);
    }
}
