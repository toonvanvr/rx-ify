import { rx } from '@toonvanvr/rx-ify'

const input = document.querySelector('.demo-form input')
rx(input).value.subscribe((value) => console.log(value))
