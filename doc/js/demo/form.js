import { debounceTime, fromEvent, map, merge } from 'rxjs'
import { $$ } from '~/rx-ify'

const input$$ = $$(document.querySelector('.demo-form #input'))

// Unfortunately, we can't use input$$.value directly because the 'input'
// event does not trigger the setter of <input> => no observable updated to emit
const inputValue$ = fromEvent(
  document.querySelector('.demo-form #input'),
  'input'
).pipe(map((e) => e.target.value))

const clear$ = fromEvent(document.querySelector('.demo-form #clear'), 'click')

const idle$ = merge(clear$, inputValue$).pipe(debounceTime(5000))

const output$$ = $$(document.querySelector('.demo-form #output'))

output$$.innerText = merge(
  // input$$.value does not update from keyboardevents, unfortunately
  inputValue$,
  clear$.pipe(map(() => '')),
  idle$.pipe(map(() => 'Idle'))
)
