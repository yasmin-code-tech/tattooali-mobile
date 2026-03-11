import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen        from '../screens/auth/LoginScreen';
import CadastroScreen     from '../screens/auth/CadastroScreen';
import EsqueciSenhaScreen from '../screens/auth/EsqueciSenhaScreen';

const Stack = createNativeStackNavigator();

export default function PublicNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a0a0a' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login"        component={LoginScreen}        />
      <Stack.Screen name="Cadastro"     component={CadastroScreen}     />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
    </Stack.Navigator>
  );
}