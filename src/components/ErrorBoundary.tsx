import React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';

interface State {
  error: Error | null;
  info: string | null;
}

/**
 * Catches JS render/runtime errors anywhere in the tree. In a release APK an
 * uncaught error otherwise closes the app with no message ("app keeps
 * stopping" → clear cache); here we show the message + stack so it can be
 * read on-device and reported. "Reintentar" clears the error and re-renders.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    this.setState({ info: info?.componentStack ?? null });
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: '#171231', paddingTop: 60, paddingHorizontal: 20 }}>
        <Text style={{ color: '#ffd9b8', fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
          Algo ha fallado
        </Text>
        <ScrollView style={{ flex: 1 }}>
          <Text selectable style={{ color: '#fff', fontSize: 14, marginBottom: 16 }}>
            {error.name}: {error.message}
          </Text>
          {!!error.stack && (
            <Text selectable style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 16 }}>
              {error.stack}
            </Text>
          )}
          {!!info && (
            <Text selectable style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              {info}
            </Text>
          )}
        </ScrollView>
        <Pressable
          onPress={() => this.setState({ error: null, info: null })}
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            marginVertical: 24,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
}
