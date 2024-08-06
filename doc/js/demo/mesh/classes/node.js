import { BehaviorSubject, NEVER, share, Subject, switchAll } from 'rxjs';
import { Edge } from './edge.js';
export class Node {
    mesh;
    origin$;
    edges = new Map();
    source$ = new Subject();
    value$ = this.source$.pipe(switchAll(), share());
    constructor(mesh, { x, y }, source$ = NEVER) {
        this.mesh = mesh;
        this.origin$ = new BehaviorSubject({ x, y });
        this.source$.next(source$);
    }
    Edge = Edge.bind(null, this);
}
