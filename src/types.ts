import * as React from 'react'

export type EventKey = string | number | symbol

export type EventMiddleware<In, Out> = (payload: Readonly<In>) => Out

export type EventListener<Payload> = (payload: Readonly<Payload>) => void

export type EventRegistry<
  Key extends EventKey,
  Event extends EventMiddleware<any, any>
> = Record<Key, Event>

export type EventState = { type: EventKey; payload: any }

export type EventTuple = {
  event: EventState
  setEvent: React.Dispatch<React.SetStateAction<EventState>>
}

export type Provider<Props> = React.FC<Props>

export type ContextListener<Value> = (payload: Readonly<Value>) => void;

export type Context<Value> = React.Context<Value> & {
  Provider: Provider<React.ProviderProps<Value>>
  // We don't support Consumer API
  Consumer: never
}

export type ContextValue<Value> = {
  /** Holds a set of subscribers from components. */
  listeners: ContextListener<Value>[]

  /** Holds an actual value of React's context that will be propagated down for computations. */
  value: React.MutableRefObject<Value>
}
