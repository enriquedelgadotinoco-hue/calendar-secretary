import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { EventPreviewScreen } from '../screens/EventPreviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ConnectionsScreen } from '../screens/ConnectionsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import type { AppStackParamList } from '../types/event';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Calendar Secretary' }} />
      <Stack.Screen name="Scan" component={ScanScreen} options={{ title: 'Escanear' }} />
      <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Revisión' }} />
      <Stack.Screen name="EventPreview" component={EventPreviewScreen} options={{ title: 'Evento detectado' }} />
      <Stack.Screen name="Paywall" component={PaywallScreen} options={{ title: 'Suscripción' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
      <Stack.Screen name="Connections" component={ConnectionsScreen} options={{ title: 'Conexiones' }} />
    </Stack.Navigator>
  );
}