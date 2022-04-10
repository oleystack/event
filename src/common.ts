import React from 'react'

/* istanbul ignore next */
export const isDev = process.env.NODE_ENV !== 'production'

const canUseDOM = (): boolean =>
  typeof window !== 'undefined' &&
  !!(window.document && window.document.createElement)

/* istanbul ignore next */
export const useIsomorphicLayoutEffect: typeof React.useEffect = canUseDOM()
  ? React.useLayoutEffect
  : React.useEffect
