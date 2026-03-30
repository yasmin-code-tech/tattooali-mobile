import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BuscaScreen          from '../screens/BuscaScreen';
import AgendaScreen from '../screens/AgendaScreen';
import ChatScreen from '../screens/ChatScreen';
import PerfilScreen from '../screens/PerfilScreen';
import EditarPerfilScreen from '../screens/EditarPerfilScreen';
import Contactsscreen from '../screens/Contactsscreen';
import ReportScreen from '../screens/ReportScreen';


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
      <Stack.Screen name="Perfil"         component={PerfilScreen}         />
      <Stack.Screen name="EditarPerfil"   component={EditarPerfilScreen}   />
      <Stack.Screen name="Contatos"       component={Contactsscreen}       />
      <Stack.Screen name="Report"         component={ReportScreen}         />
      
    </Stack.Navigator>
  );
}