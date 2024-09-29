import { Linking } from 'expo';
import Constants from 'expo-constants';

// ... other imports and code

const prefix = Linking.createURL('/');
const config = {
  screens: {
    // ... your screen configurations
  },
};

export default function App() {
  return (
    <NavigationContainer
      linking={{
        prefixes: [prefix, Constants.manifest.homepage],
        config,
      }}
    >
      {/* ... your app content */}
    </NavigationContainer>
  );
}