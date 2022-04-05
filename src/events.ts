import * as React from 'react'
import { isDev } from './common'
import { createContext, useIsomorphicLayoutEffect } from './context'
import {
  EventKey,
  EventMiddleware,
  EventRegistry,
  EventState,
  EventListener,
  ContextListener,
  EventDispatcher
} from './types'

const EVENT_STATE_NULL: EventState = { type: '_init', payload: {} } // todo: params listeners
const EVENT_DISPATCHED_NULL: EventDispatcher = () => {
  if (isDev) {
    console.warn('Tried to dispatch event without Provider')
  }
}

export default function events<
  Key extends EventKey,
  Middleware extends EventMiddleware<any, any>,
  Registry extends EventRegistry<Key, Middleware>
>(middlewares: Registry) {
  const dispatcher: { current: EventDispatcher } = {
    current: EVENT_DISPATCHED_NULL
  }
  const contextListeners: ContextListener<EventState>[] = []
  const context = createContext<EventState>(contextListeners, EVENT_STATE_NULL)

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

    return React.createElement(context.Provider, { value: event }, children)
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
    checkIfMounted()

    // EventListener caller
    const update = React.useCallback(
      (event: EventState) => {
        eventListeners?.[event.type]?.(middlewares[event.type](event.payload))
      },
      [context, eventListeners]
    )

    // Adding listener on component initialization
    useIsomorphicLayoutEffect(() => {
      contextListeners.push(update)

      return () => {
        const index = contextListeners.indexOf(update)
        contextListeners.splice(index, 1)
      }
    }, [contextListeners])

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

      dispatcher.current({ type: event, payload })
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

    const subscriber: ContextListener<EventState> = (event) => {
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
