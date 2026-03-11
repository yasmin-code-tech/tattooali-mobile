import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuth }        from '../context/AuthContext';
import PublicNavigator    from './PublicNavigator';
import PrivateNavigator   from './PrivateNavigator';

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#e53030" />
      </View>
    );
  }

  return isAuthenticated ? <PrivateNavigator /> : <PublicNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});