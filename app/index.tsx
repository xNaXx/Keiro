import { Redirect } from 'expo-router';
import { useApp } from '../src/store';

export default function Index() {
  const { onboarded, user } = useApp();
  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/auth" />;
  return <Redirect href="/(tabs)" />;
}
