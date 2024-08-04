import { rx } from '@toonvanvr/rx-ify'
import { interval, map, tap } from 'rxjs'

const prevCounterValue = Number(localStorage.getItem('counter') || 0)

const div = document.getElementById('counter')
rx(div).innerHTML = interval(500).pipe(
  map((i) => prevCounterValue + i),
  tap((i) => localStorage.setItem('counter', i))
)
