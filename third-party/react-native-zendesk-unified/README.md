## Library Under Construction – Do Not Use Yet 🚧

I'm currently working on this library, even though it is already working, it's not yet fully usable as there will be breaking changes coming soon. If you want to help, feel free to open a PR! Testing the alpha version is also very welcome.

See the [Supported Zendesk SDKs and Methods](#supported-zendesk-sdks-and-methods) section for more information of what is currently supported and what is coming soon.

It is part of my journey to learn how to create native modules for React Native. So it might take a while to get it to a stable state (or maybe I'll never get there, who knows 🤷‍♂️).

# react-native-zendesk-unified

React Native wrapper for the iOS and Android Zendesk SDKs (Chat, Support & Answer Bot)

## Installation

```sh
npm install react-native-zendesk-unified
```

### iOS

Install the pods:

```sh
cd ios && pod install
```

### Android

Add the following to your `android/app/build.gradle` file:

```gradle
repositories {
  maven {
    url 'https://zendesk.jfrog.io/zendesk/repo'
  }
}
```

## Usage

```tsx
import { useEffect } from 'react';
import { Button, Text } from 'react-native';
import {
  useZendesk,
  ZendeskProvider,
  ZendeskConfig,
} from 'react-native-zendesk-unified';

const zendeskConfig: ZendeskConfig = {
  appId: 'YOUR_ZENDESK_APP_ID',
  clientId: 'YOUR_ZENDESK_CLIENT_ID',
  zendeskUrl: 'YOUR_ZENDESK_URL',
};

export function App() {
  return (
    <ZendeskProvider zendeskConfig={zendeskConfig}>
      <MyComponent />
    </ZendeskProvider>
  );
}

function MyComponent() {
  const zendesk = useZendesk();

  const openHelpCenter = async () => {
    try {
      await zendesk.openHelpCenter({
        labels: ['test'],
        groupType: 'section',
        groupIds: [15138052595485],
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    zendesk.changeTheme('#3f2b96');
    zendesk.setAnonymousIdentity({
      email: 'info@mateoguzman.net',
      name: 'Mateo Guzmán',
    });
  }, []);

  return (
    <>
      <Text>{zendesk.healthCheck()}</Text>

      <Button onPress={openHelpCenter} title="Open Help Center" />
    </>
  );
}
```

<hr />
<details>
  <summary>Using the `Zendesk` class</summary>

<br />

If you are not using React hooks, or you need to instantiate the `Zendesk` class in a different way (for example in a utility function or another context outside React), you can do so like this:

```tsx
import { useEffect } from 'react';
import { Button, Text } from 'react-native';
import { Zendesk, ZendeskConfig } from 'react-native-zendesk-unified';

const zendeskConfig: ZendeskConfig = {
  appId: 'YOUR_ZENDESK_APP_ID',
  clientId: 'YOUR_ZENDESK_CLIENT_ID',
  zendeskUrl: 'YOUR_ZENDESK_URL',
};
const zendesk = new Zendesk(zendeskConfig);

export function App() {
  const openHelpCenter = async () => {
    try {
      await zendesk.openHelpCenter({
        labels: ['test'],
        groupType: 'section',
        groupIds: [15138052595485],
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    zendesk.changeTheme('#3f2b96');
    zendesk.setAnonymousIdentity({
      email: 'info@mateoguzman.net',
      name: 'Mateo Guzmán',
    });
  }, []);

  return (
    <>
      <Text>{zendesk.healthCheck()}</Text>

      <Button onPress={openHelpCenter} title="Open Help Center" />
    </>
  );
}
```

</details>

## API Documentation

All the methods are documented in the [API documentation](https://mateoguzmana.github.io/react-native-zendesk-unified/).

The naming convention is very similar to the official Zendesk SDKs, so you can check the [iOS](https://developer.zendesk.com/documentation/classic-web-widget-sdks/support-sdk/ios/nutshell/) and [Android](https://developer.zendesk.com/documentation/classic-web-widget-sdks/support-sdk/android/nutshell/) documentation for more information.

There are some things that are not possible to do using only React Native, so you might need to do some native coding to achieve them. For example, to change the theme colors on Android, you need to create a custom theme in your native Android project.

Another example is the localization, which can be overridden by setting the localizable strings for both iOS and Android in your native projects.

## Supported Zendesk SDKs and Methods

| SDK        | Feature                                   | iOS | Android |
| ---------- | ----------------------------------------- | --- | ------- |
| Core       | Initialize SDK                            | ✅  | ✅      |
|            | Health Check                              | ✅  | ✅      |
|            | Anonymous Identity                        | ✅  | ✅      |
|            | Identity                                  | ✅  | ✅      |
|            | Change Theme (Primary color)              | ✅  | ❌      |
| Support    | Show the help center                      | ✅  | ✅      |
|            | Show a single article                     | ✅  | ✅      |
|            | Filter articles by category               | ✅  | ✅      |
|            | Filter articles by section                | ✅  | ✅      |
|            | Filter articles by label                  | ✅  | ✅      |
|            | Open a new ticket                         | ✅  | ✅      |
|            | Show an existing ticket                   | ✅  | ✅      |
|            | Show the user's tickets                   | ✅  | ✅      |
|            | Locale Override                           | ✅  | ✅      |
|            | Show contact options                      | ✅  | ✅      |
|            | Custom Fields                             | 🛠️  | ✅      |
| Chat       | Initialize SDK                            | ✅  | ✅      |
|            | Start a chat                              | ✅  | ✅      |
|            | Agent availability Enabled                | ✅  | ✅      |
|            | Transcript Enabled                        | ✅  | ✅      |
|            | Offline Form Enabled                      | ✅  | ✅      |
|            | Chat Menu Items (out of scope for now)    | ❌  | ❌      |
|            | Pre-Chat Form Enabled                     | ✅  | ✅      |
|            | Pre-Chat Form Name Field Status           | ✅  | ✅      |
|            | Pre-Chat Form Email Field Status          | ✅  | ✅      |
|            | Pre-Chat Form Phone Field Status          | ✅  | ✅      |
|            | Pre-Chat Form Department Field Status     | ✅  | ✅      |
|            | Multi-line Response Enabled               | ✅  | ✅      |
|            | Push Notifications (out of scope for now) | ❌  | ❌      |
| Answer Bot | Initialize SDK                            | ✅  | ✅      |
|            | Start Answer Bot                          | ✅  | ✅      |
| Unified    | Coming up next                            | 🛠️  | 🛠️      |

Any questions about any specific implemention? Feel free to open an issue!

## Demo App

You can check the [Zendesk demo app](https://github.com/mateoguzmana/ZendeskDemo) to see how to use the library in a real app.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

[MIT](./LICENSE)

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
