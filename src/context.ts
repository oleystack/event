import * as React from 'react'
import {
  unstable_NormalPriority as NormalPriority,
  unstable_runWithPriority as runWithPriority
} from 'scheduler'
import { Context, ContextValue } from './types'

const isDev = process.env.NODE_ENV !== 'production'

const canUseDOM = (): boolean =>
  typeof window !== 'undefined' &&
  !!(window.document && window.document.createElement)

export const useIsomorphicLayoutEffect: typeof React.useEffect = canUseDOM()
  ? React.useLayoutEffect
  : React.useEffect

const createProvider = <Value>(
  Original: React.Provider<ContextValue<Value>>
) => {
  const Provider: React.FC<React.ProviderProps<Value>> = (props) => {
    // Holds an actual "props.value"
    const valueRef = React.useRef(props.value)

    // Holds provider check flag
    const hasProviderRef = React.useRef(false)

    // A stable object, is used to avoid context updates via mutation of its values.
    const contextValue = React.useRef<ContextValue<Value>>()

    if (!contextValue.current) {
      contextValue.current = {
        value: valueRef,
        hasProvider: hasProviderRef,
        listeners: []
      }
    }

    // Todo: test if initialization call listeners somehow
    useIsomorphicLayoutEffect(() => {
      valueRef.current = props.value
      hasProviderRef.current = true

      runWithPriority(NormalPriority, () => {
        ;(contextValue.current as ContextValue<Value>).listeners.forEach(
          (listener) => {
            listener(props.value)
          }
        )
      })
    }, [props.value])

    return React.createElement(
      Original,
      { value: contextValue.current },
      props.children
    )
  }

  if (isDev) {
    Provider.displayName = 'Event.Provider'
  }

  return Provider as unknown as React.Provider<ContextValue<Value>>
}

export const createContext = <Value>(defaultValue: Value): Context<Value> => {
  const context = React.createContext<ContextValue<Value>>({
    value: { current: defaultValue },
    hasProvider: { current: false },
    listeners: []
  })

  context.Provider = createProvider<Value>(context.Provider)

  // We don't support Consumer API
  delete (context as unknown as Context<Value>).Consumer

  return context as unknown as Context<Value>
}
