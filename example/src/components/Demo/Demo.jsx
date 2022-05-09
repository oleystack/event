import { useState, useRef, useEffect } from 'react'
import { events } from '@bit-about/event'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import './Demo.css'

const [EventProvider, useEvent] = events({
  buttonClicked: (payload) => payload,
  userLogged: () => {},
  modalClosed: () => {}
})

/**
 * Render counter
 */
const RenderCounter = () => {
  const renderCounter = useRef(1)

  useEffect(() => {
    renderCounter.current = renderCounter.current + 1
  })

  return (
    <span className='container-info'>
      🔄
      <SwitchTransition>
        <CSSTransition
          key={renderCounter.current}
          addEndListener={(node, done) =>
            node.addEventListener('transitionend', done, false)
          }
          classNames='bump'
        >
          <span suppressHydrationWarning> {renderCounter.current}</span>
        </CSSTransition>
      </SwitchTransition>
    </span>
  )
}

/**
 * COMPONENT_1
 */
function AliceBox() {
  const dispatch = useEvent()

  return (
    <div className='container column'>
      <span className='container-title'>component_2</span>
      <RenderCounter />
    </div>
  )
}

/**
 * COMPONENT_2
 */
function BobBox() {
  const dispatch = useEvent()

  return (
    <div className='container column'>
      <span className='container-title'>component_2</span>
      <RenderCounter />
    </div>
  )
}

/**
 * main component aka APP
 */
function Demo() {
  return (
    <EventProvider>
      <div className='container row demo'>
        <span className='container-title'>app</span>
        <RenderCounter />

        <AliceBox />
        <BobBox />
      </div>
    </EventProvider>
  )
}

export default Demo
