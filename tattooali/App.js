import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './context/AuthContext';
// 1. Importamos o seu novo contexto aqui
import { ConversationsProvider } from './context/ConversationsContext'; 
import RootNavigator   from './navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      {/* 2. Adicionamos o ConversationsProvider englobando a navegação */}
      <ConversationsProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </ConversationsProvider>
    </AuthProvider>
  );
}