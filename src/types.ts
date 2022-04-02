import * as React from 'react'

export type Provider<Props> = React.FC<Props>

export type Context<Value> = React.Context<Value> & {
  Provider: Provider<React.ProviderProps<Value>>
  // We don't support Consumer API
  Consumer: never
}

export type ContextValue<Value> = {
  /** Holds a set of subscribers from components. */
  listeners: ((payload: Readonly<Value>) => void)[]

  /** Holds an actual value of React's context that will be propagated down for computations. */
  value: React.MutableRefObject<Value>

  /** Check if component is wrapped with Provider. */
  hasProvider: React.MutableRefObject<boolean>
}

export type EventKey = string | number | symbol
export type EventMiddleware<In = any, Out = any> = (payload: In) => Out
export type EventListener<Payload> = (payload: Payload) => void
export type EventRegistry<
  Key extends EventKey,
  Event extends EventMiddleware
> = Record<Key, Event>
export type EventState = { type: EventKey; payload: any }
export type EventTuple = {
  event: EventState
  setEvent: React.Dispatch<React.SetStateAction<EventState>>
}
