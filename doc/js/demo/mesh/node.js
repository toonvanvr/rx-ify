import { NEVER, share, Subject, switchAll } from 'rxjs';
import { Edge } from './edge.js';
export class Node {
    mesh;
    x;
    y;
    edges = new Map();
    source$ = new Subject();
    value$ = this.source$.pipe(switchAll(), share());
    constructor(mesh, { x, y }, source$ = NEVER) {
        this.mesh = mesh;
        this.x = x;
        this.y = y;
        this.source$.next(source$);
    }
    Edge = Edge.bind(null, this);
}
