import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgendaScreen from './screens/AgendaScreen';
import BuscaScreen from './screens/BuscaScreen';
import ChatScreen from './screens/ChatScreen';
import PerfilClienteScreen from './screens/PerfilClienteScreen';
import PerfilTatuadorScreen from './screens/PerfilTatuadorScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Agenda"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Busca" component={BuscaScreen} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="PerfilCliente" component={PerfilClienteScreen} />
        <Stack.Screen name="PerfilTatuador" component={PerfilTatuadorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
