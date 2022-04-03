import React, { useRef } from 'react'
import { events, withNothing, withDefault, withPayload } from '@bit-about/event'

/**
 * Declaring EVENTS
 */
// const [EventProvider, useEvent] = events({
//   buttonClicked: (randomNumber: number) => `randomNumber:${randomNumber}`,
//   idle: () => 'defaultValue'
// })

const [EventProvider, useEvent] = events({
  userLogged: withPayload<{ id: number}>(),
  homeVisited: withNothing,
  buttonClicked: withDefault('asd')
})

/**
 * Counter
 */
const Counter = () => {
  const renderCounter = useRef(0)
  renderCounter.current = renderCounter.current + 1

  return <h3>rendered {renderCounter.current} times</h3>
}

/**
 * Alice counter
 */
const Alice = () => {
  useEvent({
    buttonClicked: (payload: string) => console.log('Alice', payload)
  })

  return (
    <div>
      <h1>Alice</h1>
      <Counter />
    </div>
  )
}

/**
 * Buttons
 */
const Buttons = () => {
  const dispatch = useEvent({
    buttonClicked: (payload: string) => console.log('Buttons', payload)
  })

  return (
    <div>
      <h1>Buttons</h1>
      <Counter />
      <button onClick={() => dispatch('buttonClicked', Math.random())}>
        Call event
      </button>
    </div>
  )
}

/**
 * Bob
 */
const Bob = () => {
  const [value, setValue] = React.useState('')

  useEvent({
    buttonClicked: (payload: string) => setValue(payload)
  })

  return (
    <div>
      <h1>Bob</h1>
      <Counter />
      <p>Value from event: {value}</p>
    </div>
  )
}

/**
 * App
 */
const App = () => {
  return (
    <EventProvider>
      <Alice />
      <Buttons />
      <Bob />
    </EventProvider>
  )
}

export default App
