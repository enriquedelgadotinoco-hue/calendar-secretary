import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { debugActivateSubscriptionFor30Days, getSubscriptionAccess, restorePurchases, startOneDollarSubscription, type SubscriptionAccess } from '../services/subscriptionService';

export function PaywallScreen() {
  const [access, setAccess] = useState<SubscriptionAccess | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const state = await getSubscriptionAccess();
    setAccess(state);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await startOneDollarSubscription();
      await refresh();
      Alert.alert('Suscripción', 'Proceso de compra completado. Se actualizó tu acceso premium.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible abrir el flujo de suscripción.';
      Alert.alert('Suscripción', message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      await refresh();
      Alert.alert('Restaurar compras', restored ? 'Se restauró tu suscripción activa.' : 'No se encontró suscripción activa para restaurar.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible restaurar compras.';
      Alert.alert('Restaurar compras', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDebugUnlock = async () => {
    await debugActivateSubscriptionFor30Days();
    await refresh();
    Alert.alert('Modo pruebas', 'Suscripción activada por 30 días para pruebas locales.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Calendar Secretary</Text>
      <Text style={styles.price}>USD $1/mes</Text>
      <Text style={styles.subtitle}>Incluye 30 días de prueba gratis para nuevos usuarios.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estado actual</Text>
        <Text style={styles.cardText}>Prueba activa: {access?.isTrialActive ? 'Sí' : 'No'}</Text>
        <Text style={styles.cardText}>Días restantes de prueba: {access?.trialDaysRemaining ?? 0}</Text>
        <Text style={styles.cardText}>Suscripción activa: {access?.hasActiveSubscription ? 'Sí' : 'No'}</Text>
        <Text style={styles.cardText}>Proveedor de acceso: {access?.provider === 'revenuecat' ? 'RevenueCat / Tienda' : 'Prueba local'}</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleSubscribe} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Abriendo...' : 'Suscribirme por USD $1/mes'}</Text>
      </Pressable>

      <Text style={styles.footnote}>Para publicación en tiendas, configura producto mensual con prueba de 1 mes en Google Play / App Store.</Text>

      <Pressable style={styles.secondaryButton} onPress={handleRestore} disabled={loading}>
        <Text style={styles.secondaryButtonText}>Restaurar compras</Text>
      </Pressable>

      {__DEV__ ? (
        <Pressable style={styles.debugButton} onPress={handleDebugUnlock}>
          <Text style={styles.debugButtonText}>Activar suscripción de prueba (dev)</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '700'
  },
  price: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '700',
    color: '#18181b'
  },
  subtitle: {
    marginTop: 8,
    color: '#3f3f46',
    fontSize: 15
  },
  card: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 12,
    padding: 14
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },
  cardText: {
    fontSize: 15,
    color: '#3f3f46',
    marginBottom: 4
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  footnote: {
    marginTop: 12,
    color: '#52525b',
    fontSize: 13
  },
  secondaryButton: {
    marginTop: 10,
    borderColor: '#d4d4d8',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#18181b',
    fontWeight: '600'
  },
  debugButton: {
    marginTop: 18,
    borderColor: '#d4d4d8',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  debugButtonText: {
    color: '#18181b',
    fontWeight: '600'
  }
});
