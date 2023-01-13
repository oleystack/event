import React from 'react'
import {
  unstable_NormalPriority as NormalPriority,
  unstable_runWithPriority as runWithPriority
} from 'scheduler'

import { useIsomorphicLayoutEffect } from './common'

/**
 * Types
 */
type EventKey = string | number | symbol

type EventMiddleware<In extends Readonly<unknown>[], Out> = (
  ...payload: In
) => Out

type EventListener<Payload> = (payload: Readonly<Payload>) => void

type EventRegistry<
  Key extends EventKey,
  Event extends EventMiddleware<any, any>
> = Record<Key, Event>

type EventRecord = Readonly<{ key: EventKey; payload: any[] }>

export default function events<
  Key extends EventKey,
  Middleware extends EventMiddleware<any, any>,
  Registry extends EventRegistry<Key, Middleware>
>(middlewares: Registry) {
  type ListenerRegistry = {
    [key in keyof Partial<Registry>]: EventListener<ReturnType<Registry[key]>>
  }

  const isBinded = { current: false }
  const listeners: ListenerRegistry[] = []
  const records: EventRecord[] = []

  const informListeners = (
    listeners: ListenerRegistry[],
    record: EventRecord
  ) => {
    listeners.forEach((registry) =>
      registry[record.key]?.(middlewares[record.key](...record.payload))
    )
  }

  type Dispatcher = {
    [key in keyof Registry]: (...payload: Parameters<Registry[key]>) => void
  }
  const dispatcher = new Proxy(listeners, {
    get: (thisListeners, eventKey) => {
      return (...payload: unknown[]) => {
        if (isBinded.current) {
          // Dispatch immediately
          informListeners(thisListeners, { key: eventKey, payload })
        } else {
          // Dispatch after the first render
          records.push({ key: eventKey, payload })
        }
      }
    }
  }) as unknown as Dispatcher

  /**
   * Provider
   */
  const BindProvider: React.FC = (props) => {
    useIsomorphicLayoutEffect(() => {
      runWithPriority(NormalPriority, () => {
        // Informing listeners
        records.forEach((record) => informListeners(listeners, record))
        records.splice(0, records.length)

        isBinded.current = true
      })
    }, [])

    return React.createElement(React.Fragment, props)
  }

  /**
   * useEvent hook
   * @param newListeners List of subscribed events
   * @returns Dispatch function
   */
  const useEvent = (newListeners?: ListenerRegistry) => {
    useIsomorphicLayoutEffect(() => {
      if (!newListeners) {
        return
      }

      listeners.push(newListeners)

      return () => {
        listeners.splice(listeners.indexOf(newListeners), 1)
      }
    }, [newListeners])

    return dispatcher
  }

  /**
   * Subscriber for non-hook aproaches
   * @param newListeners List of subscribed events
   * @returns Subscriber with unsubscribe method
   */
  const subscribe = (newListeners: ListenerRegistry) => {
    listeners.push(newListeners)

    const unsubscribe = () => {
      listeners.splice(listeners.indexOf(newListeners), 1)
    }

    return { unsubscribe }
  }

  return [BindProvider, useEvent, { subscribe, dispatcher }] as const
}
