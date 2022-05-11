<p align="center">
<img alt="BitAboutEvent 💫 Tiny and powerful hook-based event system for React. 100% Idiomatic React." src="https://user-images.githubusercontent.com/1496580/162749593-7b98f01b-8fed-4669-8617-a41b0fca004c.png" />
<br /><br />
<a href="https://www.npmjs.com/package/@bit-about/event"><img alt="" src="https://img.shields.io/npm/v/@bit-about/event.svg" /></a>
<a href="https://bundlephobia.com/package/@bit-about/event"><img alt="Bundle size" src="https://img.shields.io/bundlephobia/minzip/@bit-about/event?label=size" /></a>
<a href="https://codecov.io/gh/bit-about/event"><img alt="" src="https://img.shields.io/codecov/c/github/bit-about/event?token=ZBD02VKG6J" /></a>
</p>

## Install

```bash
npm i @bit-about/event
```

## Features

- 100% **Idiomatic React**
- 100% Typescript with event types deduction
- Efficient and hook-based
- ...with static listener and dispatcher
- No centralized event provider
- Tiny - only **0.6kB**
- **Just works** ™

### ➡️ [Check demo](https://bit-about.github.io/event/)

## Usage

1️⃣ Define your events set and their payloads
```jsx
import { events } from '@bit-about/event'

const [EventProvider, useEvents] = events({
  buttonClicked: (payload: string) => payload,
  userLogged: () => {},
  modalClosed: () => {},
})
```

2️⃣ Wrap the tree with the EventProvider
```jsx
const App = () => (
  <EventProvider>
    ...
  </EventProvider>
)
```

🗣️ Dispatch your events

```jsx
const Button = () => {
  const { buttonClicked } = useEvents()
  
  const onClick = () => buttonClicked('Hello')
  
  return <button onClick={onClick}>Call event</button>
}
```

👂 Listen on your events
```jsx
const Component = () => {
  const [message, setMessage] = React.useState('')

  useEvents({
    buttonClicked: (payload: string) => setMessage(payload)
  })
  
  return <p>{message}</p>
}
```

## Static access
The third element of the `events()` result tuple is object which provides access in static manner (without hook). 

```jsx
const [AppEventProvider, useAppEvents, { subscribe, dispatcher }] = events(...)
```

and then
```jsx
// 🗣️ Dispatch event
dispatcher.buttonClicked('Hello Allice!')

// 👂 Subscribe and listen on new events
const subscriber = subscribe({
  buttonClicked: (payload: string) => console.log(payload)
})
  
// remember to unsubscribe!
subscriber.unsubscribe()
```

## 👉 Rerendering
Neither listeners nor event dispatching rerender the component.<br />
The component will only be rerendered if its state is explicitly changed (in e.g. `React.useState`).

```jsx
const Component = () => {
  const [message, setMessage] = React.useState('')

  useEvents({
    aliceClicked: () => console.log('I DO NOT rerender this component!'),
    bobClicked: () => setMessage('I DO rerender this component!')
  })
  
  return <p>{message}</p>
}
```

## Event Middlewares
Events in `events()` are actually payload middlewares.

```jsx
const [EventProvider, useEvents] = events({
  buttonClicked: (payload: string) => `Hello ${message}!`, // Transforms string payload to another
  avatarClicked: () => `Bob!`, // Provides default payload
})

const { buttonClicked, avatarClicked } = useEvents({
  buttonClicked: (payload: string) => console.log(payload), // "Hello Alice!",
  avatarClicked: (payload: string) => console.log(payload), // "Bob!"
})

buttonClicked('Alice')
avatarClicked()
```

> NOTE: <br />
> The library is completely type safe so Typescript will inform you when you use wrong payload anywhere

## BitAboutEvent 💛 [BitAboutState](https://github.com/bit-about/state)
Are you tired of sending logic to the related components?<br />
Move your bussiness logic to the hook-based state using `@bit-about/state` + `@bit-about/event`.<br />

Now you've got **completely type-safe side-effects**, isn't cool?

```tsx
import { state } from '@bit-about/state'
import { useEvents } from './auth-events' // Hook generated from events()
import User from '../models/user'

const [UserProvider, useUser] = state(
  () => {
    const [user, setUser] = React.useState<User | null>(null)
    
    useEvents({
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

<a href="https://github.com/sponsors/Gareneye"><img alt="Support me!" src="https://img.shields.io/badge/github.com-Support%20me!-green"/></a>

If you use my library and you like it...<br />
it would be nice if you put the name `BitAboutEvent` in the work experience section of your resume.<br />
Thanks 🙇🏻! 

---
<p align="center">🇺🇦 Slava Ukraini</p>
