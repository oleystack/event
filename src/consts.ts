/* eslint-disable indent */

export const withPayload =
  <In>() =>
  (payload: In) =>
    payload

export const withDefault =
  <Out = any>(base: Out) =>
  (payload?: Partial<Out>) => ({ ...base, ...payload })

export const withNothing = () => {}
