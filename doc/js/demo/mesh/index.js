// import { $$ } from '@toonvanvr/rx-ify'
import { interval } from 'rxjs';
import { Mesh } from './classes/mesh.js';
const mesh = new Mesh();
const ticker = mesh.addNode({ x: 0, y: 0 }, interval(1000));
console.dir(mesh);
// @ts-ignore
globalThis.mesh = mesh;
