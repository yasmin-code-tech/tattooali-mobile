import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BuscaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Buscar Tatuador</Text>
      <Text style={styles.sub}>(tela placeholder)</Text>
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
