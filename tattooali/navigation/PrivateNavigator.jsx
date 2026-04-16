import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, TouchableOpacity, Text, View } from 'react-native';

import BuscaScreen          from '../screens/BuscaScreen';
import AgendaScreen from '../screens/AgendaScreen';
import ChatScreen from '../screens/ChatScreen';
import PerfilScreen from '../screens/PerfilScreen';
import EditarPerfilScreen from '../screens/EditarPerfilScreen';
import Contactsscreen from '../screens/Contactsscreen';
import ReportScreen from '../screens/ReportScreen';
import ReviewScreen from '../screens/ReviewScreen';
import MyReviewsScreen from '../screens/MyReviewsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
const Stack = createNativeStackNavigator();

function getScreenTitle(routeName) {
  if (routeName === 'Busca') return 'BUSCA';
  if (routeName === 'Agenda') return 'AGENDA';
  if (routeName === 'Perfil') return 'MEU PERFIL';
  if (routeName === 'EditarPerfil') return 'EDITAR PERFIL';
  if (routeName === 'Contatos') return 'CONTATOS';
  return routeName.toUpperCase();
}

export default function PrivateNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Busca"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerShadowVisible: false,
        headerTintColor: '#f0f0f0',
        headerBackTitleVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: 1,
          fontSize: 22,
        },
        headerTitle: getScreenTitle(route.name),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => Alert.alert('Notificações', 'Central de notificações em breve.')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#2a2a2a',
              backgroundColor: '#141414',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 17 }}>🔔</Text>
            <View
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e53030',
              }}
            />
          </TouchableOpacity>
        ),
        contentStyle: { backgroundColor: '#0a0a0a' },
        animation: 'slide_from_right',
      })}
    >
      <Stack.Screen name="Busca"          component={BuscaScreen}          />
      <Stack.Screen name="Agenda"         component={AgendaScreen}         />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Perfil"         component={PerfilScreen}         />
      <Stack.Screen
        name="EditarPerfil"
        component={EditarPerfilScreen}
        options={{ headerBackTitleVisible: false }}
      />
      <Stack.Screen name="Contatos"       component={Contactsscreen}       />
      <Stack.Screen name="Report"         component={ReportScreen}         />
      <Stack.Screen name="Review"         component={ReviewScreen}         />
      <Stack.Screen name="MyReviews"      component={MyReviewsScreen}      />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />

    </Stack.Navigator>
  );
}