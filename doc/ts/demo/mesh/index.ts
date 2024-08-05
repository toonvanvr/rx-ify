// import { $$ } from '@toonvanvr/rx-ify'
import { interval } from 'rxjs'
import { Mesh } from './mesh.js'

const mesh = new Mesh()

const ticker = new mesh.Node({ x: 0, y: 0 }, interval(1000))

console.dir(mesh)
