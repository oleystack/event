import * as React from 'react'
import { createContext, useIsomorphicLayoutEffect } from './context'
import {
  Context,
  ContextValue,
  EventKey,
  EventMiddleware,
  EventRegistry,
  EventState,
  EventTuple,
  EventListener
} from './types'

const EVENT_STATE_NULL: EventState = { type: '', payload: {} }
const EVENT_TUPLE_NULL: EventTuple = {
  event: EVENT_STATE_NULL,
  setEvent: () => {}
}

export default function events<
  Key extends EventKey,
  Middleware extends EventMiddleware,
  Registry extends EventRegistry<Key, Middleware>
>(middlewares: Registry) {
  const context = createContext<EventTuple>(EVENT_TUPLE_NULL)

  /**
   * Provider
   */
  const BindProvider: React.FC = ({ children }) => {
    // setEvent is never updated
    const [event, setEvent] = React.useState<EventState>(EVENT_STATE_NULL)

    // To prevent in-place creating EventTuple
    const state = React.useMemo(() => ({ event, setEvent }), [event])

    return React.createElement(context.Provider, { value: state }, children)
  }

  /**
   * useEvent hook
   */
  type ListenerRegistry = {
    [key in keyof Partial<Registry>]: EventListener<ReturnType<Registry[key]>>
  }
  const useEvent = (eventListeners?: ListenerRegistry) => {
    const contextValue = React.useContext(
      context as unknown as Context<ContextValue<EventTuple>>
    )

    const {
      value: {
        current: { setEvent }
      },
      hasProvider: { current: hasProvider },
      listeners
    } = contextValue

    if (!hasProvider) {
      console.warn(
        'The Events System hook must be used in component wrapped with its corresponding EventsProvider'
      )
    }

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
      setEvent({ type: event, payload })
    }

    return dispatch
  }

  return [BindProvider, useEvent] as const
}
