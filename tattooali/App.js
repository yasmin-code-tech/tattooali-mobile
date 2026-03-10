import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgendaScreen from './screens/AgendaScreen';
import BuscaScreen from './screens/BuscaScreen';
import ChatScreen from './screens/ChatScreen';
import PerfilClienteScreen from './screens/PerfilClienteScreen';
import PerfilTatuadorScreen from './screens/PerfilTatuadorScreen';

import LoginScreen from './screens/auth/LoginScreen';
import CadastroScreen from './screens/auth/CadastroScreen';
import EsqueciSenhaScreen from './screens/auth/EsqueciSenhaScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
          animation: 'slide_from_right',
        }}
      >
        {/* Telas de autenticação */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />

        {/* Telas principais */}
        <Stack.Screen name="Busca" component={BuscaScreen} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="PerfilCliente" component={PerfilClienteScreen} />
        <Stack.Screen name="PerfilTatuador" component={PerfilTatuadorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}