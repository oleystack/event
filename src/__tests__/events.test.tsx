import * as React from 'react'
import { fireEvent, render } from '@testing-library/react'
import events from '../events'
import { act } from 'react-dom/test-utils'

// Counter Component
const Counter = ({ role }: { role: string }) => {
  const renderCounter = React.useRef(0)
  renderCounter.current = renderCounter.current + 1
  return <p role={role}>{renderCounter.current}</p>
}

test('Basic usage', () => {
  const aliceListener = jest.fn()
  const [Provider, useEvents] = events({
    onAlicePress: (alice: string, bob: number) => `alice:${alice},bob:${bob}`,
    onBobPress: () => {}
  })

  const Buttons = () => {
    const { onAlicePress, onBobPress } = useEvents()

    return (
      <>
        <button
          role='trigger_alice'
          onClick={() => onAlicePress('alice', 100)}
        />
        <button role='trigger_bob' onClick={() => onBobPress()} />
        <Counter role='counter_buttons' />
      </>
    )
  }

  const Alice = () => {
    useEvents({
      onAlicePress: aliceListener
    })

    return (
      <>
        <Counter role='counter_alice' />
      </>
    )
  }

  const Bob = () => {
    const [value, setValue] = React.useState(0)

    useEvents({
      onBobPress: () => setValue((bob) => bob + 1)
    })

    return (
      <>
        <p role='bob'>{value}</p>
        <Counter role='counter_bob' />
      </>
    )
  }

  const App = () => (
    <Provider>
      <Buttons />
      <Alice />
      <Bob />
      <Counter role='counter' />
    </Provider>
  )
  const { getByRole } = render(<App />)

  expect(getByRole('counter_buttons').textContent).toEqual('1')
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')
  expect(getByRole('bob').textContent).toEqual('0')
  expect(aliceListener).toBeCalledTimes(0)

  fireEvent.click(getByRole('trigger_alice'))
  expect(aliceListener).toBeCalledTimes(1)
  expect(aliceListener).toBeCalledWith('alice:alice,bob:100')
  expect(getByRole('counter_buttons').textContent).toEqual('1')
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')

  fireEvent.click(getByRole('trigger_alice'))
  expect(aliceListener).toBeCalledTimes(2)
  expect(getByRole('counter_buttons').textContent).toEqual('1')
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')

  fireEvent.click(getByRole('trigger_bob'))
  expect(aliceListener).toBeCalledTimes(2)
  expect(getByRole('counter_buttons').textContent).toEqual('1')
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('2')
  expect(getByRole('bob').textContent).toEqual('1')

  fireEvent.click(getByRole('trigger_alice'))
  expect(aliceListener).toBeCalledTimes(3)
  expect(getByRole('counter_buttons').textContent).toEqual('1')
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('2')
  expect(getByRole('bob').textContent).toEqual('1')
})

test('Ejecting component', () => {
  const aliceListener = jest.fn()
  const [Provider, useEvents] = events({
    onAlicePress: () => {},
    onEject: () => {}
  })

  const Buttons = () => {
    const { onAlicePress, onEject } = useEvents()

    return (
      <>
        <button role='trigger_alice' onClick={() => onAlicePress()} />
        <button role='trigger_eject' onClick={() => onEject()} />
      </>
    )
  }

  const Alice = () => {
    useEvents({
      onAlicePress: aliceListener
    })

    return <></>
  }

  const Gate = () => {
    const [isVisible, setIsVisible] = React.useState(true)

    useEvents({
      onEject: () => setIsVisible((wasVisible) => !wasVisible)
    })

    return <>{isVisible && <Alice />}</>
  }

  const App = () => {
    return (
      <Provider>
        <Buttons />
        <Gate />
      </Provider>
    )
  }
  const { getByRole } = render(<App />)
  expect(aliceListener).toBeCalledTimes(0)

  fireEvent.click(getByRole('trigger_alice'))
  expect(aliceListener).toBeCalledTimes(1)

  fireEvent.click(getByRole('trigger_eject'))
  expect(aliceListener).toBeCalledTimes(1)

  fireEvent.click(getByRole('trigger_alice'))
  expect(aliceListener).toBeCalledTimes(1) // shouldn't be called

  fireEvent.click(getByRole('trigger_eject'))
  expect(aliceListener).toBeCalledTimes(1)

  fireEvent.click(getByRole('trigger_alice'))
  expect(aliceListener).toBeCalledTimes(2) // should be called
})

test('Static usage', () => {
  const aliceListener = jest.fn()

  const staticAliceListener = jest.fn()
  const staticBobListener = jest.fn()

  const [Provider, useEvents, staticEvents] = events({
    onAlicePress: (alice: string, bob: number) => `alice:${alice},bob:${bob}`,
    onBobPress: () => {}
  })

  const Alice = () => {
    useEvents({
      onAlicePress: aliceListener
    })

    return (
      <>
        <Counter role='counter_alice' />
      </>
    )
  }

  const Bob = () => {
    const [value, setValue] = React.useState(0)

    useEvents({
      onBobPress: () => setValue((bob) => bob + 1)
    })

    return (
      <>
        <p role='bob'>{value}</p>
        <Counter role='counter_bob' />
      </>
    )
  }

  const App = () => (
    <Provider>
      <Alice />
      <Bob />
      <Counter role='counter' />
    </Provider>
  )
  const { getByRole } = render(<App />)

  const aliceSubscriber = staticEvents.subscribe({
    onAlicePress: staticAliceListener
  })

  const bobSubscriber = staticEvents.subscribe({
    onBobPress: staticBobListener
  })

  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')
  expect(getByRole('bob').textContent).toEqual('0')
  expect(aliceListener).toBeCalledTimes(0)
  expect(staticAliceListener).toBeCalledTimes(0)
  expect(staticBobListener).toBeCalledTimes(0)

  act(() => {
    staticEvents.dispatch.onAlicePress('alice', 100)
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')
  expect(aliceListener).toBeCalledTimes(1)
  expect(aliceListener).toBeCalledWith('alice:alice,bob:100')
  expect(staticAliceListener).toBeCalledTimes(1)
  expect(staticAliceListener).toBeCalledWith('alice:alice,bob:100')
  expect(staticBobListener).toBeCalledTimes(0)

  act(() => {
    staticEvents.dispatch.onAlicePress('alice', 100)
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')
  expect(aliceListener).toBeCalledTimes(2)
  expect(staticAliceListener).toBeCalledTimes(2)
  expect(staticBobListener).toBeCalledTimes(0)

  act(() => {
    staticEvents.dispatch.onBobPress()
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('2')
  expect(getByRole('bob').textContent).toEqual('1')
  expect(aliceListener).toBeCalledTimes(2)
  expect(staticAliceListener).toBeCalledTimes(2)
  expect(staticBobListener).toBeCalledTimes(1)

  aliceSubscriber.unsubscribe()
  act(() => {
    staticEvents.dispatch.onAlicePress('alice', 100)
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('2')
  expect(getByRole('bob').textContent).toEqual('1')
  expect(aliceListener).toBeCalledTimes(3)
  expect(aliceListener).toBeCalledWith('alice:alice,bob:100')
  expect(staticAliceListener).toBeCalledTimes(2) // should not changed
  expect(staticBobListener).toBeCalledTimes(1)

  bobSubscriber.unsubscribe()
  act(() => {
    staticEvents.dispatch.onBobPress()
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('3')
  expect(getByRole('bob').textContent).toEqual('2')
  expect(aliceListener).toBeCalledTimes(3)
  expect(staticAliceListener).toBeCalledTimes(2)
  expect(staticBobListener).toBeCalledTimes(1) // should not changed
})
