import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/event';
import { extractTextFromImage } from '../services/ocrService';
import { useCameraPermissions } from '../hooks/useCameraPermissions';
import { getSubscriptionAccess } from '../services/subscriptionService';

type Props = NativeStackScreenProps<AppStackParamList, 'Scan'>;

export function ScanScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const { granted } = useCameraPermissions();

  const processImage = async (uri: string) => {
    setLoading(true);
    try {
      const rawText = await extractTextFromImage(uri);
      if (!rawText.trim()) {
        throw new Error('No se detectó texto en la imagen.');
      }
      navigation.navigate('Review', { rawText });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo procesar la imagen';
      Alert.alert('Error de escaneo', message);
    } finally {
      setLoading(false);
    }
  };

  const openGallery = async () => {
    const access = await getSubscriptionAccess();
    if (!access.canUsePremium) {
      navigation.navigate('Paywall');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para escanear capturas.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await processImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const access = await getSubscriptionAccess();
    if (!access.canUsePremium) {
      navigation.navigate('Paywall');
      return;
    }

    if (!granted) {
      Alert.alert('Permiso de cámara', 'Activa el permiso de cámara para escanear calendarios físicos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await processImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>Selecciona una captura/foto o usa la cámara para escanear un calendario.</Text>

      <Pressable style={styles.button} onPress={openGallery} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Procesando...' : 'Escanear desde galería'}</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={openCamera} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Procesando...' : 'Escanear con cámara'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#27272a'
  },
  button: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});