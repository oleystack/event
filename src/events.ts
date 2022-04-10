import * as React from 'react'
import { isDev, useIsomorphicLayoutEffect } from './common'
import { createContext } from './context'
import { ContextListener } from './types'

/**
 * Types
 */

type EventKey = string | number | symbol

type EventMiddleware<In extends Readonly<unknown>[], Out> = (
  ...payload: In
) => Out

type EventListener<Payload> = (payload: Payload) => void

type EventRegistry<
  Key extends EventKey,
  Event extends EventMiddleware<any, any>
> = Record<Key, Event>

type EventState = { type: EventKey; payload: any }

type EventDispatcher = React.Dispatch<React.SetStateAction<EventState>>

/**
 * Constants
 */

const EVENT_STATE_NULL: EventState = { type: '', payload: {} }
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
  type ListenerRegistry = {
    [key in keyof Partial<Registry>]: EventListener<ReturnType<Registry[key]>>
  }

  const dispatcher: { current: EventDispatcher } = {
    current: EVENT_DISPATCHED_NULL
  }
  const contextListeners: ContextListener<EventState>[] = []
  const context = createContext<EventState>(contextListeners, EVENT_STATE_NULL)

  /**
   * Dispatcher
   * @param event
   * @param payload
   */
  const dispatch = <Event extends keyof Registry>(
    event: Event,
    ...payload: Parameters<Registry[Event]>
  ): void => {
    dispatcher.current({ type: event, payload })
  }

  /**
   * Informat
   * @param eventListeners ListenerRegistry
   * @returns void
   */
  const informant: (
    eventListeners?: ListenerRegistry
  ) => ContextListener<EventState> =
    (eventListeners?: ListenerRegistry) => (event: EventState) => {
      eventListeners?.[event.type]?.(middlewares[event.type](...event.payload))
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

  /**
   * useEvent hook
   * @param eventListeners List of subscribed events
   * @returns Dispatch function
   */
  const useEvent = (eventListeners?: ListenerRegistry) => {
    // EventListener caller
    const update = React.useCallback(informant(eventListeners), [
      eventListeners
    ])

    // Adding listener on component initialization
    useIsomorphicLayoutEffect(() => {
      contextListeners.push(update)

      return () => {
        const index = contextListeners.indexOf(update)
        contextListeners.splice(index, 1)
      }
    }, [contextListeners])

    return dispatch
  }

  /**
   * Subscriber for non-hook aproaches
   * @param eventListeners List of subscribed events
   * @returns Subscriber with unsubscribe method
   */
  const subscribe = (eventListeners: ListenerRegistry) => {
    const subscriber: ContextListener<EventState> = informant(eventListeners)

    contextListeners.push(subscriber)

    const unsubscribe = () => {
      const index = contextListeners.indexOf(subscriber)
      contextListeners.splice(index, 1)
    }

    return { unsubscribe }
  }

  return [BindProvider, useEvent, { subscribe, dispatch }] as const
}
