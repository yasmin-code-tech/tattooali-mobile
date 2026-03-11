import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Chat</Text>
      <Text style={styles.sub}>(tela placeholder)</Text>

      <Navbar  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontSize: 24,
    color: '#f0f0f0',
    fontWeight: '600',
  },
  sub: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
});
