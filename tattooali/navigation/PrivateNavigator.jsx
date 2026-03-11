import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BuscaScreen          from '../screens/BuscaScreen';
import AgendaScreen         from '../screens/AgendaScreen';
import ChatScreen           from '../screens/ChatScreen';
import PerfilClienteScreen  from '../screens/PerfilClienteScreen';
import PerfilTatuadorScreen from '../screens/PerfilTatuadorScreen';

const Stack = createNativeStackNavigator();

export default function PrivateNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Busca"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0a0a' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Busca"          component={BuscaScreen}          />
      <Stack.Screen name="Agenda"         component={AgendaScreen}         />
      <Stack.Screen name="Chat"           component={ChatScreen}           />
      <Stack.Screen name="PerfilCliente"  component={PerfilClienteScreen}  />
      <Stack.Screen name="PerfilTatuador" component={PerfilTatuadorScreen} />
    </Stack.Navigator>
  );
}