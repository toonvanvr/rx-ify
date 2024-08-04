import { rx } from '@toonvanvr/rx-ify'
import { interval, map, tap } from 'rxjs'

// Make the counter thumnail interactive
const prevCounterValue = Number(localStorage.getItem('counter') || 0)
const div = document.getElementById('counter')
div.innerText = prevCounterValue
rx(div).innerHTML = interval(500).pipe(
  map((i) => prevCounterValue + i + 1),
  tap((i) => localStorage.setItem('counter', i))
)

// Remember closing an alert
document.querySelectorAll('sl-alert[data-local-storage-key]').forEach(async (alert) => {
  if (!(alert instanceof HTMLElement)) return

  if (localStorage.getItem(alert.dataset.localStorageKey) !== 'closed') {
    alert.style.display = 'block'
  }

  alert.addEventListener('sl-hide', () => {
    localStorage.setItem(alert.dataset.localStorageKey, 'closed')
  })
})
