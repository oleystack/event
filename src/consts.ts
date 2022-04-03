
export const withPayload = <In>() => (payload: In) => payload
export const withDefault = <Out>(extra: Out) => (payload?: Out) => ({ ...extra, ...payload })
export const withNothing = () => {}
