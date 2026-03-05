import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { AppStackParamList } from '../types/event';
import { getSubscriptionAccess, type SubscriptionAccess } from '../services/subscriptionService';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [access, setAccess] = useState<SubscriptionAccess | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      void getSubscriptionAccess().then((state) => {
        if (mounted) {
          setAccess(state);
        }
      });

      return () => {
        mounted = false;
      };
    }, [])
  );

  const onScanPress = () => {
    if (access?.canUsePremium) {
      navigation.navigate('Scan');
      return;
    }

    navigation.navigate('Paywall');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar Secretary</Text>
      <Text style={styles.subtitle}>Escanea capturas, fotos o calendarios con cámara y crea eventos.</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>Prueba gratis: {access?.isTrialActive ? 'Activa' : 'Vencida'}</Text>
        <Text style={styles.statusText}>Días restantes: {access?.trialDaysRemaining ?? 0}</Text>
      </View>

      <Pressable style={styles.button} onPress={onScanPress}>
        <Text style={styles.buttonText}>Escanear ahora</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Paywall')}>
        <Text style={styles.secondaryText}>Suscripción USD $1 / mes</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Connections')}>
        <Text style={styles.secondaryText}>Conectar proveedores</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.secondaryText}>Ajustes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24
  },
  statusBox: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  statusText: {
    color: '#3f3f46',
    fontSize: 14
  },
  button: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    borderColor: '#d4d4d8',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10
  },
  secondaryText: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '500'
  }
});