import { useState, useRef, useEffect } from 'react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import './Demo.css'

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
    <div className='container column demo'>
      <span className='container-title'>app</span>
      <RenderCounter />


        <div className='container column'>
          <span className='container-title'>store</span>


          <div className='row'>
            <AliceBox />
            <BobBox />
          </div>
        </div>

    </div>
  )
}

export default Demo
