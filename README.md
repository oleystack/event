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

## Migrations
<details>
  <summary>v1 -> v2</summary>
  
  > Events dispatch approach has been changed. There are no longer functions executed using their names in string.
  >
  > ✖️ old one:
  > ```jsx
  > const dispatch = useEvent()
  > dispatch('onBobPress', 'hello') 
  > ```
  > ✅ new one:
  > ```jsx
  > const { onBobPress } = useEvent()
  > onBobPress('hello')
  > ```
</details>



## Features

- 100% **Idiomatic React**
- 100% Typescript with event types deduction
- Listen or dispatch events from a hook...
- ...or utilise static access
- No centralized event provider
- Tiny - only **0.6kB**
- **Just works** ™

### ➡️ [Check demo](https://bit-about.github.io/event/)

## Usage

1️⃣ Define *your events* by defining their payload middlewares
```jsx
import { events } from '@bit-about/event'

const [EventProvider, useEvents] = events({
  buttonClicked: (payload: string) => payload,
  userLogged: () => {},
  modalClosed: () => {},
})
```

2️⃣ Wrap your components in EventProvider
```jsx
const App = () => (
  <EventProvider>
    ...
  </EventProvider>
)
```

🗣️ Dispatch your events in one place...

```jsx
const Button = () => {
  const { buttonClicked } = useEvents()
  
  return (
    <button onClick={() => buttonClicked('Hello')}>
      Call event
    </button>
  )
}
```

👂 ...and listen for them in another
```jsx
const Component = () => {
  const [message, setMessage] = React.useState('')

  useEvents({
    buttonClicked: (payload: string) => setMessage(payload)
  })
  
  return <p>{message}</p> // "Hello"
}
```

## Static access
The third result element of `events()` is object providing access in static manner (without hook). 

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

## 👉 Re-render
Neither listeners nor events dispatch your components render.<br />
A component will only be rerendered if it's state is explicitly changed (in e.g. `React.useState`).

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
Events in `events()` are payload middlewares. They can transform payload into another.

```jsx
const [EventProvider, useEvents] = events({
  buttonClicked: (payload) => `Hello ${message}!`, // Transforms string payload to another
  avatarClicked: () => `Bob!`,                     // Provides default payload
})

const { buttonClicked, avatarClicked } = useEvents({
  buttonClicked: (payload) => console.log(payload), // prints "Hello Alice!",
  avatarClicked: (payload) => console.log(payload), // prints "Bob!"
})

buttonClicked('Alice')
avatarClicked()
```

> NOTE: <br />
> The library is full type-safe, so Typescript will inform you when you use wrong payload anywhere.

## BitAboutEvent 💛 [BitAboutState](https://github.com/bit-about/state)
Are you tired of sending logic to a related components?<br />
Move your bussiness logic to hook-based state using `@bit-about/state` + `@bit-about/event`.<br />

Now you've got **completely type-safe side-effects**. Isn't that cool?

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
MIT © [Maciej Olejnik 🇵🇱](https://github.com/macoley)

## Support me

<a href="https://github.com/sponsors/macoley"><img alt="Support me!" src="https://img.shields.io/badge/github.com-Support%20me!-green"/></a>

If you use my library and you like it...<br />
it would be nice if you put the name `BitAboutEvent` in the work experience section of your resume.<br />
Thanks 🙇🏻! 

---
<p align="center">🇺🇦 Slava Ukraini</p>
