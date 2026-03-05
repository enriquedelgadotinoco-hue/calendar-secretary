import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/event';
import { createDeviceCalendarEvent } from '../services/calendarService';
import { saveIcsFile } from '../services/icsService';

type Props = NativeStackScreenProps<AppStackParamList, 'EventPreview'>;

export function EventPreviewScreen({ route }: Props) {
  const { event } = route.params;

  const saveToDeviceCalendar = async () => {
    const eventId = await createDeviceCalendarEvent(event);
    if (eventId) {
      Alert.alert('Listo', `Evento creado con ID: ${eventId}`);
      return;
    }
    Alert.alert('No disponible', 'No se pudo crear el evento en el calendario del dispositivo.');
  };

  const exportIcs = async () => {
    const uri = await saveIcsFile(event);
    Alert.alert('Archivo .ics generado', uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>Inicio: {new Date(event.startDate).toLocaleString()}</Text>
      <Text style={styles.meta}>Fin: {new Date(event.endDate).toLocaleString()}</Text>
      {event.location ? <Text style={styles.meta}>Lugar: {event.location}</Text> : null}
      <Text style={styles.meta}>Fuente OCR: {Math.round(event.confidence * 100)}%</Text>

      <Pressable style={styles.button} onPress={saveToDeviceCalendar}>
        <Text style={styles.buttonText}>Agregar al calendario del dispositivo</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={exportIcs}>
        <Text style={styles.secondaryText}>Exportar .ics (compatible con la mayoría de calendarios)</Text>
      </Pressable>
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12
  },
  meta: {
    fontSize: 15,
    color: '#3f3f46',
    marginBottom: 6
  },
  button: {
    marginTop: 18,
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  secondary: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  secondaryText: {
    color: '#18181b',
    textAlign: 'center',
    fontWeight: '500'
  }
});