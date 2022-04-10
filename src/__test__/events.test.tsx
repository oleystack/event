import * as React from 'react'
import { fireEvent, render } from '@testing-library/react'
import events from '../events'
import { act } from 'react-dom/test-utils'
import { withDefault, withNothing, withPayload } from '../consts'

// Counter Component
const Counter = ({ role }: { role: string }) => {
  const renderCounter = React.useRef(0)
  renderCounter.current = renderCounter.current + 1
  return <p role={role}>{renderCounter.current}</p>
}

test('Basic usage', () => {
  const aliceListener = jest.fn()
  const [Provider, useEvent] = events({
    onAlicePress: (alice: string, bob: number) => `alice:${alice},bob:${bob}`,
    onBobPress: () => {}
  })

  const Buttons = () => {
    const dispatch = useEvent()

    return (
      <>
        <button
          role='trigger_alice'
          onClick={() => dispatch('onAlicePress', 'alice', 100)}
        />
        <button role='trigger_bob' onClick={() => dispatch('onBobPress')} />
        <Counter role='counter_buttons' />
      </>
    )
  }

  const Alice = () => {
    useEvent({
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

    useEvent({
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
  const [Provider, useEvent] = events({
    onAlicePress: () => {},
    onEject: () => {}
  })

  const Buttons = () => {
    const dispatch = useEvent()

    return (
      <>
        <button role='trigger_alice' onClick={() => dispatch('onAlicePress')} />
        <button role='trigger_eject' onClick={() => dispatch('onEject')} />
      </>
    )
  }

  const Alice = () => {
    useEvent({
      onAlicePress: aliceListener
    })

    return <></>
  }

  const Gate = () => {
    const [isVisible, setIsVisible] = React.useState(true)

    useEvent({
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

  const [Provider, useEvent, staticEvent] = events({
    onAlicePress: (alice: string, bob: number) => `alice:${alice},bob:${bob}`,
    onBobPress: () => {}
  })

  const Alice = () => {
    useEvent({
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

    useEvent({
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

  const aliceSubscriber = staticEvent.subscribe({
    onAlicePress: staticAliceListener
  })

  const bobSubscriber = staticEvent.subscribe({
    onBobPress: staticBobListener
  })

  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')
  expect(getByRole('bob').textContent).toEqual('0')
  expect(aliceListener).toBeCalledTimes(0)
  expect(staticAliceListener).toBeCalledTimes(0)
  expect(staticBobListener).toBeCalledTimes(0)

  act(() => {
    staticEvent.dispatch('onAlicePress', 'alice', 100)
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')
  expect(aliceListener).toBeCalledTimes(1)
  expect(aliceListener).toBeCalledWith('alice:alice,bob:100')
  expect(staticAliceListener).toBeCalledTimes(1)
  expect(staticAliceListener).toBeCalledWith('alice:alice,bob:100')
  expect(staticBobListener).toBeCalledTimes(0)

  act(() => {
    staticEvent.dispatch('onAlicePress', 'alice', 100)
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('1')
  expect(aliceListener).toBeCalledTimes(2)
  expect(staticAliceListener).toBeCalledTimes(2)
  expect(staticBobListener).toBeCalledTimes(0)

  act(() => {
    staticEvent.dispatch('onBobPress')
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('2')
  expect(getByRole('bob').textContent).toEqual('1')
  expect(aliceListener).toBeCalledTimes(2)
  expect(staticAliceListener).toBeCalledTimes(2)
  expect(staticBobListener).toBeCalledTimes(1)

  aliceSubscriber.unsubscribe()
  act(() => {
    staticEvent.dispatch('onAlicePress', 'alice', 100)
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
    staticEvent.dispatch('onBobPress')
  })
  expect(getByRole('counter_alice').textContent).toEqual('1')
  expect(getByRole('counter_bob').textContent).toEqual('3')
  expect(getByRole('bob').textContent).toEqual('2')
  expect(aliceListener).toBeCalledTimes(3)
  expect(staticAliceListener).toBeCalledTimes(2)
  expect(staticBobListener).toBeCalledTimes(1) // should not changed
})

test('Basic usage', () => {
  const withPayloadListener = jest.fn()
  const withNothingListener = jest.fn()
  const withDefaultListener = jest.fn()

  const [Provider, , staticEvent] = events({
    withPayload: withPayload<{ alice: string; bob: number }>(),
    withNothing: withNothing,
    withDefault: withDefault({ alice: 'alice', bob: 100 })
  })

  const App = () => (
    <Provider>
      <Counter role='counter' />
    </Provider>
  )

  render(<App />)

  staticEvent.subscribe({
    withPayload: withPayloadListener,
    withNothing: withNothingListener,
    withDefault: withDefaultListener
  })

  expect(withPayloadListener).toBeCalledTimes(0)
  expect(withNothingListener).toBeCalledTimes(0)
  expect(withDefaultListener).toBeCalledTimes(0)

  act(() => {
    staticEvent.dispatch('withPayload', { alice: 'alice', bob: 100 })
  })
  expect(withPayloadListener).toBeCalledTimes(1)
  expect(withPayloadListener).toBeCalledWith({ alice: 'alice', bob: 100 })
  expect(withNothingListener).toBeCalledTimes(0)
  expect(withDefaultListener).toBeCalledTimes(0)

  act(() => {
    staticEvent.dispatch('withNothing')
  })
  expect(withPayloadListener).toBeCalledTimes(1)
  expect(withNothingListener).toBeCalledTimes(1)
  expect(withNothingListener).toBeCalledWith(undefined)
  expect(withDefaultListener).toBeCalledTimes(0)

  act(() => {
    staticEvent.dispatch('withDefault', { bob: 200 })
  })
  expect(withPayloadListener).toBeCalledTimes(1)
  expect(withNothingListener).toBeCalledTimes(1)
  expect(withDefaultListener).toBeCalledTimes(1)
  expect(withDefaultListener).toBeCalledWith({ alice: 'alice', bob: 200 })
})
