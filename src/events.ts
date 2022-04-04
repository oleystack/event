import * as React from 'react'
import { isDev } from './common'
import { createContext, useIsomorphicLayoutEffect } from './context'
import {
  Context,
  ContextValue,
  EventKey,
  EventMiddleware,
  EventRegistry,
  EventState,
  EventTuple,
  EventListener,
  ContextListener,
  EventDispatcher
} from './types'

const EVENT_STATE_NULL: EventState = { type: '', payload: {} } // todo: params listeners
const EVENT_DISPATCHED_NULL: EventDispatcher = () => {}
const EVENT_TUPLE_NULL: EventTuple = {
  event: EVENT_STATE_NULL,
  setEvent: () => {}
}

export default function events<
  Key extends EventKey,
  Middleware extends EventMiddleware<any, any>,
  Registry extends EventRegistry<Key, Middleware>
>(middlewares: Registry) {
  const dispatcher: { current: EventDispatcher } = {
    current: EVENT_DISPATCHED_NULL
  }
  const contextListeners: ContextListener<EventTuple>[] = []
  const context = createContext<EventTuple>(contextListeners, EVENT_TUPLE_NULL)

  const checkIfMounted = () => {
    if (!isDev) {
      return
    }

    if (dispatcher.current === EVENT_DISPATCHED_NULL) {
      console.warn('Event system is not wrapped with Provider')
    }
  }

  /**
   * Provider
   */
  const BindProvider: React.FC = ({ children }) => {
    // setEvent is never updated
    const [event, setEvent] = React.useState<EventState>(EVENT_STATE_NULL)
    dispatcher.current = setEvent

    // To prevent in-place creating EventTuple
    const state = React.useMemo(() => ({ event, setEvent }), [event])

    return React.createElement(context.Provider, { value: state }, children)
  }

  type ListenerRegistry = {
    [key in keyof Partial<Registry>]: EventListener<ReturnType<Registry[key]>>
  }

  /**
   * useEvent hook
   * @param eventListeners List of subscribed events
   * @returns Dispatch function
   */
  const useEvent = (eventListeners?: ListenerRegistry) => {
    const contextValue = React.useContext(
      context as unknown as Context<ContextValue<EventTuple>>
    )

    const {
      value: {
        current: { setEvent }
      },
      listeners
    } = contextValue

    checkIfMounted()

    // EventListener caller
    const update = React.useCallback(
      ({ event }: EventTuple) => {
        eventListeners?.[event.type]?.(middlewares[event.type](event.payload))
      },
      [context, eventListeners]
    )

    // Adding listener on component initialization
    useIsomorphicLayoutEffect(() => {
      listeners.push(update)

      return () => {
        const index = listeners.indexOf(update)
        listeners.splice(index, 1)
      }
    }, [listeners])

    /* eslint-disable indent */

    /**
     * Dispatcher
     * @param event
     * @param payload
     */
    const dispatch = <
      K extends keyof Registry,
      P extends Parameters<Registry[K]>[0]
    >(
      event: K,
      ...payload: P extends undefined ? [] : [P]
    ): void => {
      checkIfMounted()

      setEvent({ type: event, payload })
    }

    return dispatch
  }

  /**
   * Subscriber for non-hook aproaches
   * @param eventListeners List of subscribed events
   * @returns Subscriber with unsubscribe method
   */
  const subscribe = (eventListeners: ListenerRegistry) => {
    checkIfMounted()

    const subscriber: ContextListener<EventTuple> = ({ event }) => {
      eventListeners?.[event.type]?.(middlewares[event.type](event.payload))
    }

    contextListeners.push(subscriber)

    const unsubscribe = () => {
      const index = contextListeners.indexOf(subscriber)
      contextListeners.splice(index, 1)
    }

    return { unsubscribe }
  }

  /**
   * Dispatcher
   * @param event
   * @param payload
   */
  const dispatch = <
    K extends keyof Registry,
    P extends Parameters<Registry[K]>
  >(
    event: K,
    ...payload: P extends undefined ? [] : [P]
  ): void => {
    checkIfMounted()

    dispatcher.current({ type: event, payload })
  }

  return [BindProvider, useEvent, { subscribe, dispatch }] as const
}
