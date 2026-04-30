import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './context/AuthContext';
import { ConversationsProvider } from './context/ConversationsContext';
import { NotificationsProvider } from './context/NotificationsContext';
import ChatProfileSync from './components/ChatProfileSync';
import RootNavigator   from './navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ChatProfileSync />
      <NotificationsProvider>
        <ConversationsProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </ConversationsProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}