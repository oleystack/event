import * as React from 'react'
import {
  unstable_NormalPriority as NormalPriority,
  unstable_runWithPriority as runWithPriority
} from 'scheduler'
import { canUseDOM, isDev } from './common'
import { Context, ContextListener, ContextValue } from './types'

export const useIsomorphicLayoutEffect: typeof React.useEffect = canUseDOM()
  ? React.useLayoutEffect
  : React.useEffect

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
        value: valueRef,
        listeners
      }
    }

    // Todo: test if initialization call listeners somehow
    useIsomorphicLayoutEffect(() => {
      valueRef.current = props.value

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

export const createContext = <Value>(
  listeners: ContextListener<Value>[],
  defaultValue: Value
): Context<Value> => {
  const context = React.createContext<ContextValue<Value>>({
    value: { current: defaultValue },
    listeners
  })

  context.Provider = createProvider<Value>(listeners, context.Provider)

  // We don't support Consumer API
  delete (context as unknown as Context<Value>).Consumer

  return context as unknown as Context<Value>
}
