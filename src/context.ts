import * as React from 'react'
import {
  unstable_NormalPriority as NormalPriority,
  unstable_runWithPriority as runWithPriority
} from 'scheduler'
import { useIsomorphicLayoutEffect, isDev } from './common'
import { ContextListener } from './types'

type Context<Value> = React.Context<Value> & {
  Provider: React.FC<React.ProviderProps<Value>>

  // We don't support Consumer API
  Consumer: never
}

type ContextValue<Value> = {
  /** Holds an actual value of React's context that will be propagated down for computations. */
  value: React.MutableRefObject<Value>
}

const createProvider = <Value>(
  listeners: ContextListener<Value>[],
  Original: React.Provider<ContextValue<Value>>
) => {
  const Provider: React.FC<React.ProviderProps<Value>> = (props) => {
    // Holds an actual "props.value"
    const valueRef = React.useRef(props.value)

    // A stable object, is used to avoid context updates via mutation of its values.
    const contextValue = React.useRef<ContextValue<Value>>()

    if (!contextValue.current) {
      contextValue.current = {
        value: valueRef
      }
    }

    // Todo: test if initialization call listeners somehow
    useIsomorphicLayoutEffect(() => {
      valueRef.current = props.value

      runWithPriority(NormalPriority, () => {
        listeners.forEach((listener) => {
          listener(props.value)
        })
      })
    }, [props.value])

    return React.createElement(
      Original,
      { value: contextValue.current },
      props.children
    )
  }

  /* istanbul ignore next */
  if (isDev) {
    Provider.displayName = 'BitAboutEvent.Provider'
  }

  return Provider as unknown as React.Provider<ContextValue<Value>>
}

export const createContext = <Value>(
  listeners: ContextListener<Value>[],
  defaultValue: Value
): Context<Value> => {
  const context = React.createContext<ContextValue<Value>>({
    value: { current: defaultValue }
  })

  context.Provider = createProvider<Value>(listeners, context.Provider)

  // We don't support Consumer API
  delete (context as unknown as Context<Value>).Consumer

  return context as unknown as Context<Value>
}
