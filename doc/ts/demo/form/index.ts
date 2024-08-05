import { $$ } from '@toonvanvr/rx-ify'
import { debounceTime, fromEvent, map, merge } from 'rxjs'

type TextInputEvent = InputEvent & { target: HTMLInputElement }

const clear = document.querySelector('.demo-form #clear') as HTMLButtonElement
const input = document.querySelector('.demo-form #input') as HTMLInputElement
const output = document.querySelector('.demo-form #output') as HTMLDivElement

const input$$ = $$(input)
const output$$ = $$(output)

// Unfortunately, we can't use input$$.value directly because the 'input'
// event does not trigger the setter of <input> => no observable updated to emit
const inputValue$ = fromEvent<TextInputEvent>(input, 'input').pipe(
  map((e) => e.target.value)
)

const clear$ = fromEvent(clear, 'click')
const idle$ = merge(clear$, inputValue$).pipe(debounceTime(5000))

output$$.innerText = merge(
  // input$$.value does not update from keyboardevents, unfortunately
  inputValue$,
  clear$.pipe(map(() => '')),
  idle$.pipe(map(() => 'Idle'))
)

// input$$.value = clear$.pipe(map(() => '')) // FIXME: this should work? 😰
