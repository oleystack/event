# <p align="center">BitAboutEvent</p>
<p align="center">
<a href="https://www.npmjs.com/package/@bit-about/event"><img alt="" src="https://img.shields.io/npm/v/@bit-about/event.svg" /></a>
<img alt="Bundle size" src="https://img.shields.io/bundlephobia/min/@bit-about/event?label=size" />
<a href="https://codecov.io/gh/bit-about/event"><img alt="" src="https://codecov.io/gh/bit-about/event/branch/main/graph/badge.svg?token=ZBD02VKG6J" /></a>
<br />
💫 Tiny and powerful hook-based event system for React.<br />
100% Idiomatic React.<br />
</p>

## Install

```bash
npm install --save @bit-about/event
```

## Features

- 100% **Idiomatic React**
- 100% Typescript with event types deduction
- Efficient and hook-based
- No centralized event provider
- Tiny - only **100KB**
- **Just works** ™

## Usage

1️⃣ Define your events set and their payloads
```jsx
import { events } from '@bit-about/event'

const [EventProvider, useEvent] = events({
  buttonClicked: (payload: string) => payload,
  userLogged: () => {},
  modalClosed: () => {},
})
```

2️⃣ Wrap the tree with the EventProvider
```jsx
const App = () => (
  <EventProvider>
    {/* ... */}
  </EventProvider>
)
```

🗣️ Dispatch your events

```jsx
const Button = () => {
  const dispatchEvent = useEvent()
  
  const onButtonClick = () => dispatchEvent('buttonClicked', "Hello")
  
  return <button onClick={onButtonClick}>Call event</button>
}
```

👂 Listen on your events
```jsx
const Component = () => {
  const [message, setMessage] = React.useState("")

  useEvent({
    buttonClicked: (payload: string) => setMessage(payload)
  })
  
  return <p>{message}</p>
}
```

> **You don't need to think too much** - it's easy, look:<br />
> - define events with payloads using `events()`<br />
> - wrap the components tree with the generated `EventProvider`<br />
> - listen on events with **useEvent hook**
> - dispatch events with **useEvent hook**

## 👉 Rerendering
Neither listeners nor event dispatching rerender the component.<br />
The component will only be rerendered if its state is explicitly changed (in e.g. `React.useState`).

```jsx
const Component = () => {
  const [message, setMessage] = React.useState("")

  useEvent({
    aliceClicked: () => console.log("I DON'T rerender this component!"),
    bobClicked: () => setMessage("I DO rerender this component!")
  })
  
  // ...
}
```

## Event Middlewares
Events in `events()` are actually payload middlewares.

```jsx
const [EventProvider, useEvent] = events({
  buttonClicked: (payload: string) => `Hello ${message}!`,
})
```

```jsx
const dispatchEvent = useEvent({
  buttonClicked: (payload: string) => console.log(payload) // "Hello Alice!"
})

dispatchEvent('buttonClicked', "Alice")
```

> NOTE: <br />
> The library is completely type safe <br/>
> so Typescript will inform you when you use wrong payload anywhere

#### Default payload
When you don't need the payload and want some default object, you can omit middleware parameters.
```jsx
const [EventProvider, useEvent] = events({
  buttonClicked: () => `Bob!`,
})
```

```jsx
const dispatchEvent = useEvent({
  buttonClicked: (payload: string) => console.log(payload) // "Bob!"
})

dispatchEvent('buttonClicked')
```

#### Middleware helpers
Are you an aesthete? <br />
Try: `withPayload<PayloadType>()`, `withDefault(defaultPayload)` and `withNothing`.

```tsx
const [EventProvider, useEvent] = events({
  userLogged: withPayload<{ id: number }>(),
  homeVisited: withNothing,
  buttonClicked: withDefault({ type: 'userButton' })
})
```

> NOTE:
> `withPayload` does the call with `()`. If you forget about it, your payload will be the function 🤡

## BitAboutEvent 💛 [BitAboutState](https://github.com/bit-about/state)
Are you tired of sending logic to the related components?<br />
Move your bussiness logic to the hook-based state using `@bit-about/state` + `@bit-about/event`.<br />

Now you've got **completely type-safe side-effects**, isn't cool?

```tsx
import { state } from '@bit-about/state'
import { useEvent } from './auth-events' // Hook generated from events()
import User from '../models/user'

const [UserProvider, useUser] = state(
  () => {
    const [user, setUser] = React.useState<User | null>(null)
    
    useEvent({
      userLogged: (user: User) => setUser(user),
      userLoggout: () => setUser(null)
    })
    
    return user
  }
)
```

## Partners  
<a href="https://www.wayfdigital.com/"><img alt="wayfdigital.com" width="100" height="100" src="https://user-images.githubusercontent.com/1496580/161037415-0503f763-a60b-4d40-af9f-95d1304fa486.png"/></a>

## Credits
- [Constate](https://github.com/diegohaz/constate) - approach main inspiration
- [use-context-selector](https://github.com/dai-shi/use-context-selector) & [FluentUI](https://github.com/microsoft/fluentui) - fancy rerender avoiding tricks and code main inspiration

## License
MIT © [Maciej Olejnik 🇵🇱](https://github.com/Gareneye)

## Support me
If you use my library and you like it...<br />
it would be nice if you put the name `BitAboutEvent` in the work experience section of your resume.<br />
Thanks 🙇🏻! 

---
<p align="center">🇺🇦 Slava Ukraini</p>
