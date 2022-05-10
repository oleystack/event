import { useState, useRef, useEffect } from 'react'
import { events } from '@bit-about/event'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import './Demo.css'

const [EventProvider, useEvent] = events({
  lightSwitchPressed: () => {}
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
function ComponentOne() {
  const dispatch = useEvent()

  return (
    <div className='container column'>
      <span className='container-title'>component_1</span>
      <RenderCounter />
      <button className='button' onClick={() => dispatch('lightSwitchPressed')}>
        Press <strong>light switch</strong>
      </button>
    </div>
  )
}

/**
 * COMPONENT_2
 */
function ComponentTwo() {
  const [isLightOn, setIsLightOn] = useState(false)
  useEvent({
    lightSwitchPressed: () => setIsLightOn((value) => !value)
  })

  return (
    <div className='container column'>
      <span className='container-title'>component_2</span>
      <RenderCounter />

      <code className='code-preview'>
        <p suppressHydrationWarning>
          💡 light is{' '}
          {isLightOn ? (
            <span className='on'>ON</span>
          ) : (
            <span className='off'>OFF</span>
          )}
        </p>
      </code>
      <small className='legend'>is listening on <strong>lightSwitchPressed event</strong></small>
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
        <span className='container-title'>bedroom</span>
        <RenderCounter />

        <ComponentOne />
        <ComponentTwo />
      </div>
    </EventProvider>
  )
}

export default Demo
